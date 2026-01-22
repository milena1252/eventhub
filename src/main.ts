import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { LoggerInterceptor } from './common/interceptors/logger.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
);

  app.useGlobalInterceptors(
    app.get(LoggerInterceptor),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
