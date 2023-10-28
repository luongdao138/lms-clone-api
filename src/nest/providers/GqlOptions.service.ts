import { ApolloDriverConfig } from '@nestjs/apollo';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GqlOptionsFactory } from '@nestjs/graphql';
import { join } from 'path';
import { Environment } from 'src/constants/env';

@Injectable()
export class GqlOptionsService implements GqlOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  createGqlOptions(): ApolloDriverConfig {
    return {
      autoSchemaFile: join(process.cwd(), 'src/graphql', 'schema.graphql'),
      sortSchema: true,
      debug: this.configService.get(Environment.GRAPHQL_DEBUG) === '1',
      playground:
        this.configService.get(Environment.GRAPHQL_PLAYGROUND) === '1',
      introspection:
        this.configService.get(Environment.GRAPHQL_INTROSPECTION) === '1',
      context({ req }: { req: Request }) {
        return {
          req,
        };
      },
      resolvers: {},
    };
  }
}
