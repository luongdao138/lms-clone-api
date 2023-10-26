import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Environment } from './constants/env';
import { buildSwagger } from './swagger';
import { PrismaExceptionFilter } from './nest/filters/prisma-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const configService = app.get(ConfigService);
  const port = +configService.get(Environment.PORT) || 2960;

  // api prefix
  app.setGlobalPrefix('api');

  if (configService.get(Environment.ENABLE_SHUTDOWN_HOOKS)) {
    process.removeAllListeners('SIGTERM');
    process.removeAllListeners('SIGINT');
    app.enableShutdownHooks();
  }

  // validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidUnknownValues: false,
    }),
  );

  // swagger
  await buildSwagger(app);

  // exeption filters
  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new PrismaExceptionFilter(httpAdapter));

  await app.listen(port);
}

bootstrap();
