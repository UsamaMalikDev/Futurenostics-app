import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app/app.module';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { randomUUID } from 'crypto';

// Make crypto.randomUUID globally available for @nestjs/schedule
// Use Object.defineProperty to avoid the read-only property error
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID,
  },
  writable: true,
  configurable: true,
});

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global logging interceptor
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Enable CORS
  app.enableCors();

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
