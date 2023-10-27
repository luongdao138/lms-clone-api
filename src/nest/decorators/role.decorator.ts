import { CustomDecorator, SetMetadata } from '@nestjs/common';
import { USER_ROLE_KEY } from 'src/constants/metadata-key';

export const Roles = (...roles: string[]): CustomDecorator<symbol> =>
  SetMetadata(USER_ROLE_KEY, roles);
