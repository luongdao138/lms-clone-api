import { INestApplication } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import {
  swaggerCustomOptions,
  swaggerDocumentOptions,
  swaggerPath,
} from './options';
import { ConfigService } from '@nestjs/config';
import { Environment, NodeEnv } from 'src/constants/env';

export const buildSwagger = async (app: INestApplication<any>) => {
  const document = SwaggerModule.createDocument(app, swaggerDocumentOptions);
  const configService = app.get(ConfigService);

  Object.values(document.paths).forEach((path) => {
    Object.values(path).forEach((method) => {
      if (
        Array.isArray(method.security) &&
        method.security.includes('isPublic')
      ) {
        method.security = [];
      }
    });
  });

  SwaggerModule.setup(swaggerPath, app, document, swaggerCustomOptions);

  // only gen swagger in development environment
  if (configService.get(Environment.NODE_ENV) === NodeEnv.Development) {
    const fs = await import('fs');
    const prettier = await import('prettier');
    fs.writeFileSync(
      'swagger.json',
      prettier.format(JSON.stringify(document), {
        parser: 'json',
      }),
    );
  }
};
