import 'dotenv/config'; // Prisma 7을 위해 환경 변수 먼저 로드
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS 설정
  const corsOrigin = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN === '*'
      ? true
      : process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
    : 'http://localhost:3000';

  app.enableCors({
    origin: corsOrigin,
    credentials: true,
  });

  // Validation Pipe 설정
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 Backend server is running on http://localhost:${port}`);
}
bootstrap();
