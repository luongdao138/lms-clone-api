import { ExecutionContext, Injectable, Type } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';
import { User } from '@prisma/client';
import { PUBLIC_KEY, USER_ROLE_KEY } from 'src/constants/metadata-key';
import { GqlContext } from 'src/types/common';

@Injectable()
export class GqlJwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = this.getRequest(context);
    const handler = context.getHandler();
    const resolverClass = context.getClass();

    // check if this route is public => just let it pass
    const isMethodPublic = this.reflector.get<boolean>(PUBLIC_KEY, handler);
    const isClassPublic = this.reflector.get<boolean>(
      PUBLIC_KEY,
      resolverClass,
    );
    if (isMethodPublic || isClassPublic) return true;

    // this will invoke jwt strategy we defined before
    const isInitialValid = await super.canActivate(context);
    if (!isInitialValid) return false;

    return this.canActivateRoles(handler, resolverClass, req.user);
  }

  canActivateRoles(
    // eslint-disable-next-line @typescript-eslint/ban-types
    handler: Function,
    resolverClass: Type<any>,
    currentUser: User,
  ): boolean {
    const expectedHandlerRoles = this.reflector.get<string[]>(
      USER_ROLE_KEY,
      handler,
    );
    const expectedClassRoles = this.reflector.get<string[]>(
      USER_ROLE_KEY,
      resolverClass,
    );
    if (!expectedHandlerRoles && !expectedClassRoles) return false;

    if (expectedHandlerRoles) {
      return expectedHandlerRoles.includes(currentUser.role);
    }

    return expectedClassRoles.includes(currentUser.role);
  }

  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext<GqlContext>().req;
  }
}
