import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { IoAdapter } from '@nestjs/platform-socket.io'; 

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://localhost:5173', 
    credentials: true,
  });

  app.useWebSocketAdapter(new IoAdapter(app)); 

  const PORT = process.env.PORT || 3000;
  await app.listen(PORT);
  console.log(`Backend is running on port ${PORT}`);
}
bootstrap();