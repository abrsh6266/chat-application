import {
    Controller,
    Get,
    Post,
    Delete,
    Param,
    Body,
    Query,
    UseGuards,
    Request,
  } from '@nestjs/common';
  import { MessagesService } from './messages.service';
  import { CreateMessageDto } from './dto/create-message.dto';
  import { AuthGuard } from '../auth/auth.guard';
  
  @Controller('messages')
  @UseGuards(AuthGuard)
  export class MessagesController {
    constructor(private readonly messagesService: MessagesService) {}
  
    @Post()
    async createMessage(@Request() req, @Body() createMessageDto: CreateMessageDto) {
      return this.messagesService.createMessage(req.user.sub, createMessageDto);
    }
  
    @Get('room/:roomId')
    async getMessagesByRoom(
      @Param('roomId') roomId: string,
      @Request() req,
      @Query('page') page?: string,
      @Query('limit') limit?: string,
    ) {
      const pageNum = page ? parseInt(page, 10) : 1;
      const limitNum = limit ? parseInt(limit, 10) : 50;
      
      return this.messagesService.getMessagesByRoom(
        roomId,
        req.user.sub,
        pageNum,
        limitNum,
      );
    }
  
    @Delete(':messageId')
    async deleteMessage(@Param('messageId') messageId: string, @Request() req) {
      return this.messagesService.deleteMessage(messageId, req.user.sub);
    }
  }