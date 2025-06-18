import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { IoAdapter } from '@nestjs/platform-socket.io';
import * as dotenv from 'dotenv'; 

dotenv.config(); 

class RedisIoAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter>;

  async connectToRedis(): Promise<void> {
    const pubClient = createClient({
      url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 20) {
            console.error('Max reconnection attempts reached. Stopping reconnection.');
            return false;
          }
          return Math.min(retries * 100, 3000);
        }
      }
    });
    
    const subClient = pubClient.duplicate();

    await Promise.all([pubClient.connect(), subClient.connect()]);
    this.adapterConstructor = createAdapter(pubClient, subClient);
  }

  createIOServer(port: number, options?: any) {
    const server = super.createIOServer(port, options);
    server.adapter(this.adapterConstructor);
    return server;
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Add global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173', 
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  try {
    const redisIoAdapter = new RedisIoAdapter(app);
    await redisIoAdapter.connectToRedis();
    app.useWebSocketAdapter(redisIoAdapter);
    console.log('Successfully connected to Redis and configured WebSocket adapter');
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
    console.log('Starting application with default WebSocket adapter...');
    app.useWebSocketAdapter(new IoAdapter(app));
  }

  const PORT = process.env.PORT || 3000;
  await app.listen(PORT);
  console.log(`Backend is running on port ${PORT}`);
}
bootstrap();