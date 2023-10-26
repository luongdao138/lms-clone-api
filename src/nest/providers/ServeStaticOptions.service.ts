import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ServeStaticModuleOptions,
  ServeStaticModuleOptionsFactory,
} from '@nestjs/serve-static';
import * as path from 'path';
import { Environment } from 'src/constants/env';

const defaultStaticModuleOptionsList: ServeStaticModuleOptions[] = [
  {
    serveRoot: '/swagger',
    rootPath: path.join(__dirname, '../../', 'swagger/assets'),
    exclude: ['/api/*', '/graphql'],
  },
];

@Injectable()
export class ServeStaticOptionsService
  implements ServeStaticModuleOptionsFactory
{
  private logger = new Logger(ServeStaticOptionsService.name);

  constructor(private readonly configService: ConfigService) {}

  createLoggerOptions(): ServeStaticModuleOptions[] {
    const serveStaticRootPath = this.configService.get(
      Environment.SERVE_STATIC_ROOT_PATH,
    );

    if (serveStaticRootPath) {
      const resolvedPath = path.resolve(serveStaticRootPath);
      this.logger.log(`Serving static files from ${serveStaticRootPath}`);

      return defaultStaticModuleOptionsList.concat([
        {
          rootPath: resolvedPath,
          exclude: ['/api/*', '/graphql'],
        },
      ]);
    }

    return defaultStaticModuleOptionsList;
  }
}
