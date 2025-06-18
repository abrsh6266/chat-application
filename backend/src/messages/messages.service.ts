import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  async createMessage(userId: string, createMessageDto: CreateMessageDto) {
    const { content, roomId } = createMessageDto;

    const room = await this.prisma.room.findFirst({
      where: {
        id: roomId,
        users: {
          some: {
            id: userId,
          },
        },
      },
    });

    if (!room) {
      throw new NotFoundException('Room not found or access denied');
    }

    const message = await this.prisma.message.create({
      data: {
        content,
        userId,
        roomId,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
        room: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return message;
  }

  async getMessagesByRoom(roomId: string, userId: string, page = 1, limit = 50) {
    // Verify user has access to the room
    const userInRoom = await this.prisma.room.findFirst({
      where: {
        id: roomId,
        users: {
          some: {
            id: userId,
          },
        },
      },
    });

    if (!userInRoom) {
      throw new NotFoundException('Room not found or access denied');
    }

    const skip = (page - 1) * limit;

    const messages = await this.prisma.message.findMany({
      where: {
        roomId,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    });

    const totalMessages = await this.prisma.message.count({
      where: {
        roomId,
      },
    });

    return {
      messages: messages.reverse(), // Show oldest first
      pagination: {
        page,
        limit,
        total: totalMessages,
        totalPages: Math.ceil(totalMessages / limit),
      },
    };
  }

  async deleteMessage(messageId: string, userId: string) {
    const message = await this.prisma.message.findUnique({
      where: {
        id: messageId,
      },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.userId !== userId) {
      throw new NotFoundException('You can only delete your own messages');
    }

    await this.prisma.message.delete({
      where: {
        id: messageId,
      },
    });

    return { success: true };
  }
}