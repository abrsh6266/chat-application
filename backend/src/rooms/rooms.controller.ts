import {
    Controller,
    Get,
    Post,
    Delete,
    Body,
    Param,
    UseGuards,
    HttpCode,
    HttpStatus,
  } from '@nestjs/common';
  import { RoomsService } from './rooms.service';
  import { CreateRoomDto } from './dto/create-room.dto';
  import { CurrentUser } from '../common/decorators/current-user.decorator';
  import { AuthGuard } from '../auth/auth.guard';
  
  @Controller('rooms')
  @UseGuards(AuthGuard)
  export class RoomsController {
    constructor(private readonly roomsService: RoomsService) {}
  
    @Post()
    async createRoom(
      @Body() createRoomDto: CreateRoomDto,
      @CurrentUser('id') userId: string,
    ) {
      try {
        const result = await this.roomsService.createRoom(createRoomDto, userId);
        return result;
      } catch (error) {
        console.error('Room creation failed in controller:', error);
        throw error;
      }
    }
  
    @Get()
    async getAllRooms(@CurrentUser('id') userId: string) {
      return this.roomsService.getAllRooms(userId);
    }
  
    @Get('my-rooms')
    async getUserRooms(@CurrentUser('id') userId: string) {
      return this.roomsService.getUserRooms(userId);
    }
  
    @Get(':id')
    async getRoomById(
      @Param('id') roomId: string,
      @CurrentUser('id') userId: string,
    ) {
      return this.roomsService.getRoomById(roomId, userId);
    }
  
    @Post(':id/join')
    @HttpCode(HttpStatus.OK)
    async joinRoom(
      @Param('id') roomId: string,
      @CurrentUser('id') userId: string,
    ) {
      return this.roomsService.joinRoom(roomId, userId);
    }
  
    @Post(':id/leave')
    @HttpCode(HttpStatus.OK)
    async leaveRoom(
      @Param('id') roomId: string,
      @CurrentUser('id') userId: string,
    ) {
      return this.roomsService.leaveRoom(roomId, userId);
    }
  
    @Delete(':id')
    async deleteRoom(
      @Param('id') roomId: string,
      @CurrentUser('id') userId: string,
    ) {
      return this.roomsService.deleteRoom(roomId, userId);
    }
  }