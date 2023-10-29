import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';
import { PUBLIC_KEY, USER_ROLE_KEY } from 'src/constants/metadata-key';
import { User } from 'src/graphql/models/User';
import { GqlContext } from 'src/types/common';

@Injectable()
export class GqlJwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // this will invoke jwt strategy we defined before
    const isInitialValid = await super.canActivate(context);
    if (!isInitialValid) return false;

    const req = this.getRequest(context);
    const handler = context.getHandler();
    const currentUser = req.user;

    // check if this route is public => just let it pass
    const isPublic = this.reflector.get<boolean>(PUBLIC_KEY, handler);
    if (isPublic) return true;

    return this.canActivateRoles(handler, currentUser);
  }

  canActivateRoles(
    // eslint-disable-next-line @typescript-eslint/ban-types
    handler: Function,
    currentUser: User,
  ): boolean {
    const expectedRoles = this.reflector.get<string[]>(USER_ROLE_KEY, handler);
    if (!expectedRoles) return false;

    return expectedRoles.includes(currentUser.role);
  }

  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext<GqlContext>().req;
  }
}
