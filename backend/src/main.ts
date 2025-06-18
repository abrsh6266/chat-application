import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import * as dotenv from 'dotenv'; 

dotenv.config(); 

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173', 
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  const pubClient = createClient({
    url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`
  });
  const subClient = pubClient.duplicate();

  await Promise.all([pubClient.connect(), subClient.connect()]);

  const adapter = createAdapter(pubClient, subClient);
  app.useWebSocketAdapter(adapter as any); 

  const PORT = process.env.PORT || 3000;
  await app.listen(PORT);
  console.log(`Backend is running on port ${PORT}`);
}
bootstrap();