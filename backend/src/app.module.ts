import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { MessagesModule } from './messages/messages.module';
import { ChatModule } from './gateway/chat.module';
@Module({
  imports: [
    PrismaModule,
    AuthModule,
    MessagesModule,
    ChatModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}