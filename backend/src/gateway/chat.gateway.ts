import {
    WebSocketGateway,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
    OnGatewayConnection,
    OnGatewayDisconnect,
    WebSocketServer,
  } from '@nestjs/websockets';
  import { Server, Socket } from 'socket.io';
  import { Logger } from '@nestjs/common';
  import { JwtService } from '@nestjs/jwt';
  import { PrismaService } from '../prisma/prisma.service';
  import { MessagesService } from '../messages/messages.service';
  import {
    ServerToClientEvents,
    ClientToServerEvents,
    JoinRoomData,
    LeaveRoomData,
    SendMessageData,
    TypingData,
    StopTypingData,
  } from './types';
  
  interface AuthenticatedSocket extends Socket {
    userId?: string;
    username?: string;
  }
  
  @WebSocketGateway({
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true,
    },
  })
  export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server<ClientToServerEvents, ServerToClientEvents>;
  
    private readonly logger = new Logger(ChatGateway.name);
    private activeUsers = new Map<string, Set<string>>(); 
    
    constructor(
      private jwtService: JwtService,
      private prisma: PrismaService,
      private messagesService: MessagesService,
    ) {}
  
    async handleConnection(client: AuthenticatedSocket) {
      try {
        const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.split(' ')[1];
        
        if (!token) {
          client.disconnect();
          return;
        }
  
        const payload = this.jwtService.verify(token);
        const user = await this.prisma.user.findUnique({
          where: { id: payload.sub },
          select: { id: true, username: true },
        });
  
        if (!user) {
          client.disconnect();
          return;
        }
  
        client.userId = user.id;
        client.username = user.username;
  
        this.logger.log(`User ${user.username} connected with socket ${client.id}`);
      } catch (error) {
        this.logger.error('Authentication failed:', error.message);
        client.disconnect();
      }
    }
  
    handleDisconnect(client: AuthenticatedSocket) {
      if (client.userId) {
        // Remove user from all active rooms
        for (const [roomId, users] of this.activeUsers.entries()) {
          if (users.has(client.userId)) {
            users.delete(client.userId);
            client.to(roomId).emit('userLeft', {
              userId: client.userId,
              username: client.username,
              roomId,
            });
          }
        }
        
        this.logger.log(`User ${client.username} disconnected`);
      }
    }
  
    @SubscribeMessage('joinRoom')
    async handleJoinRoom(
      @MessageBody() data: JoinRoomData,
      @ConnectedSocket() client: AuthenticatedSocket,
    ) {
      try {
        if (!client.userId) {
          client.emit('error', { message: 'Authentication required' });
          return;
        }
  
        // Verify user has access to the room
        const room = await this.prisma.room.findFirst({
          where: {
            id: data.roomId,
            users: {
              some: {
                id: client.userId,
              },
            },
          },
          include: {
            users: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        });
  
        if (!room) {
          client.emit('error', { message: 'Room not found or access denied' });
          return;
        }
  
        // Join the socket room
        client.join(data.roomId);
  
        // Track active users
        if (!this.activeUsers.has(data.roomId)) {
          this.activeUsers.set(data.roomId, new Set());
        }
        this.activeUsers.get(data.roomId).add(client.userId);
  
        // Notify others in the room
        client.to(data.roomId).emit('userJoined', {
          userId: client.userId,
          username: client.username,
          roomId: data.roomId,
        });
  
        this.logger.log(`User ${client.username} joined room ${room.name}`);
      } catch (error) {
        this.logger.error('Error joining room:', error.message);
        client.emit('error', { message: 'Failed to join room' });
      }
    }
  
    @SubscribeMessage('leaveRoom')
    async handleLeaveRoom(
      @MessageBody() data: LeaveRoomData,
      @ConnectedSocket() client: AuthenticatedSocket,
    ) {
      try {
        if (!client.userId) return;
  
        client.leave(data.roomId);
  
        // Remove from active users
        const activeUsersInRoom = this.activeUsers.get(data.roomId);
        if (activeUsersInRoom) {
          activeUsersInRoom.delete(client.userId);
          if (activeUsersInRoom.size === 0) {
            this.activeUsers.delete(data.roomId);
          }
        }
  
        // Notify others
        client.to(data.roomId).emit('userLeft', {
          userId: client.userId,
          username: client.username,
          roomId: data.roomId,
        });
  
        this.logger.log(`User ${client.username} left room ${data.roomId}`);
      } catch (error) {
        this.logger.error('Error leaving room:', error.message);
      }
    }
  
    @SubscribeMessage('sendMessage')
    async handleSendMessage(
      @MessageBody() data: SendMessageData,
      @ConnectedSocket() client: AuthenticatedSocket,
    ) {
      try {
        if (!client.userId) {
          client.emit('error', { message: 'Authentication required' });
          return;
        }
  
        // Create the message using the messages service
        const message = await this.messagesService.createMessage(client.userId, {
          content: data.content,
          roomId: data.roomId,
        });
  
        // Emit the message to all users in the room
        this.server.to(data.roomId).emit('message', {
          id: message.id,
          content: message.content,
          userId: message.userId,
          roomId: message.roomId,
          user: message.user,
          createdAt: message.createdAt,
        });
  
        this.logger.log(`Message sent by ${client.username} in room ${data.roomId}`);
      } catch (error) {
        this.logger.error('Error sending message:', error.message);
        client.emit('error', { message: 'Failed to send message' });
      }
    }
  
    @SubscribeMessage('typing')
    async handleTyping(
      @MessageBody() data: TypingData,
      @ConnectedSocket() client: AuthenticatedSocket,
    ) {
      if (!client.userId) return;
  
      client.to(data.roomId).emit('userJoined', {
        userId: client.userId,
        username: client.username,
        roomId: data.roomId,
      });
    }
  
    @SubscribeMessage('stopTyping')
    async handleStopTyping(
      @MessageBody() data: StopTypingData,
      @ConnectedSocket() client: AuthenticatedSocket,
    ) {
      if (!client.userId) return;
  
      client.to(data.roomId).emit('userLeft', {
        userId: client.userId,
        username: client.username,
        roomId: data.roomId,
      });
    }
  }