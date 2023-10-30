import { Logger, Module, OnApplicationShutdown } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { AppResolver } from './app.resolver';
import { AppService } from './app.service';
import { ServeStaticOptionsService } from './nest/providers/ServeStaticOptions.service';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { CoreModule } from './app/core.module';
import { RedisModule } from './redis/redis.module';
import './graphql/enums'; // import to resolve all graphql enums
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaOptionsService } from './nest/providers/PrismaOptions.service';
import { GqlOptionsService } from './nest/providers/GqlOptions.service';
import {
  envValidatorSchema,
  validationOptions,
} from './nest/validators/env.validator';
import { AppRabbitMQModule } from './rabbitmq/rabbitmq.module';
import { EmailModule } from './email/email.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidatorSchema,
      validationOptions,
    }),
    ServeStaticModule.forRootAsync({
      useClass: ServeStaticOptionsService,
    }),
    HealthModule,
    PrismaModule.forRootAsync({
      isGlobal: true,
      useClass: PrismaOptionsService,
    }),
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      useClass: GqlOptionsService,
    }),
    RedisModule,
    CoreModule,
    ScheduleModule.forRoot(),
    AppRabbitMQModule,
    EmailModule,
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
