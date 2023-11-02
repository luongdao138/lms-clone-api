import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Environment } from './constants/env';
import { buildSwagger } from './swagger';
import { classValidatorErrorsFactory } from './graphql/errors/format-validation-error';
import { ErrorHandlingInterceptor } from './nest/interceptors/error-handling.interceptor';
import { LoggingInterceptor } from './nest/interceptors/logging.interceptor';

declare const module: any;
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
      exceptionFactory: classValidatorErrorsFactory,
    }),
  );

  // hmr
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }

  // swagger
  await buildSwagger(app);

  // interceptors
  app.useGlobalInterceptors(new ErrorHandlingInterceptor());
  app.useGlobalInterceptors(new LoggingInterceptor());

  await app.listen(port);
}

bootstrap();
