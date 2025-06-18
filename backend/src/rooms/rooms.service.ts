import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { Prisma, Room } from '@prisma/client';

@Injectable()
export class RoomsService {
  constructor(private prisma: PrismaService) {}

  async createRoom(createRoomDto: CreateRoomDto, userId: string): Promise<Room> {
    try {
      const existingRoom = await this.prisma.room.findUnique({
        where: { name: createRoomDto.name },
      });

      if (existingRoom) {
        throw new ConflictException('Room name already exists');
      }

      // Create room and add creator as member
      const room = await this.prisma.room.create({
        data: {
          name: createRoomDto.name,
          description: createRoomDto.description,
          users: {
            connect: { id: userId },
          },
        },
        include: {
          users: {
            select: {
              id: true,
              username: true,
              createdAt: true,
            },
          },
          _count: {
            select: {
              messages: true,
              users: true,
            },
          },
        },
      });

      console.log('Room created successfully:', room);
      return room;
    } catch (error) {
      console.error('Error creating room:', error);
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        code: error.code,
        meta: error.meta
      });
      
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Failed to create room');
    }
  }

  async getAllRooms(userId: string) {
    const rooms = await this.prisma.room.findMany({
      include: {
        users: {
          select: {
            id: true,
            username: true,
          },
        },
        _count: {
          select: {
            messages: true,
            users: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return rooms.map(room => ({
      ...room,
      isJoined: room.users.some(user => user.id === userId),
    }));
  }

  async getUserRooms(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        rooms: {
          include: {
            users: {
              select: {
                id: true,
                username: true,
              },
            },
            _count: {
              select: {
                messages: true,
                users: true,
              },
            },
          },
          orderBy: {
            updatedAt: 'desc',
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user.rooms;
  }

  async getRoomById(roomId: string, userId: string) {
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
      include: {
        users: {
          select: {
            id: true,
            username: true,
            createdAt: true,
          },
        },
        messages: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
          take: 50, // Limit initial messages
        },
        _count: {
          select: {
            messages: true,
            users: true,
          },
        },
      },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    const isJoined = room.users.some(user => user.id === userId);

    return {
      ...room,
      isJoined,
    };
  }

  async joinRoom(roomId: string, userId: string) {
    // Check if room exists
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
      include: {
        users: true,
      },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    // Check if user is already in room
    const isAlreadyMember = room.users.some(user => user.id === userId);
    if (isAlreadyMember) {
      throw new ConflictException('User is already a member of this room');
    }

    // Add user to room
    const updatedRoom = await this.prisma.room.update({
      where: { id: roomId },
      data: {
        users: {
          connect: { id: userId },
        },
        updatedAt: new Date(),
      },
      include: {
        users: {
          select: {
            id: true,
            username: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            messages: true,
            users: true,
          },
        },
      },
    });

    return updatedRoom;
  }

  async leaveRoom(roomId: string, userId: string) {
    // Check if room exists and user is a member
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
      include: {
        users: true,
      },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    const isMember = room.users.some(user => user.id === userId);
    if (!isMember) {
      throw new BadRequestException('User is not a member of this room');
    }

    // Remove user from room
    await this.prisma.room.update({
      where: { id: roomId },
      data: {
        users: {
          disconnect: { id: userId },
        },
        updatedAt: new Date(),
      },
    });

    // If no users left, optionally delete the room
    const remainingUsers = await this.prisma.room.findUnique({
      where: { id: roomId },
      include: { _count: { select: { users: true } } },
    });

    if (remainingUsers && remainingUsers._count.users === 0) {
      await this.prisma.room.delete({
        where: { id: roomId },
      });
    }

    return { message: 'Successfully left the room' };
  }

  async deleteRoom(roomId: string, userId: string) {
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
      include: {
        users: true,
      },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    // For now, any member can delete. You might want to add admin roles later
    const isMember = room.users.some(user => user.id === userId);
    if (!isMember) {
      throw new BadRequestException('Only room members can delete the room');
    }

    await this.prisma.room.delete({
      where: { id: roomId },
    });

    return { message: 'Room deleted successfully' };
  }
}