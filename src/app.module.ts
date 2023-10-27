import { Logger, Module, OnApplicationShutdown } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { AppResolver } from './app.resolver';
import { AppService } from './app.service';
import { ServeStaticOptionsService } from './nest/providers/ServeStaticOptions.service';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { Request } from 'express';
import { Environment } from './constants/env';
import { CoreModule } from './app/core.module';
import { RedisModule } from './redis/redis.module';
import './graphql/enums'; // import to resolve all graphql enums

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
    }),
    ServeStaticModule.forRootAsync({
      useClass: ServeStaticOptionsService,
    }),
    HealthModule,
    PrismaModule,
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      async useFactory(configService: ConfigService) {
        return {
          autoSchemaFile: join(process.cwd(), 'src/graphql', 'schema.graphql'),
          sortSchema: true,
          debug: configService.get(Environment.GRAPHQL_DEBUG) === '1',
          playground: configService.get(Environment.GRAPHQL_PLAYGROUND) === '1',
          introspection:
            configService.get(Environment.GRAPHQL_INTROSPECTION) === '1',
          context({ req }: { req: Request }) {
            return {
              req,
            };
          },
          resolvers: {},
        };
      },
      inject: [ConfigService],
    }),
    RedisModule,
    CoreModule,
  ],
  controllers: [],
  providers: [AppService, AppResolver],
})
export class AppModule implements OnApplicationShutdown {
  onApplicationShutdown(signal: string) {
    new Logger(AppModule.name).debug(
      `Application shutdown (signal: ${signal})`,
    );
  }
}
