import { CustomDecorator, SetMetadata } from '@nestjs/common';
import { $Enums } from '@prisma/client';
import { USER_ROLE_KEY } from 'src/constants/metadata-key';
import { ROLE_ALL } from 'src/constants/role';

export const Roles = (...roles: string[]): CustomDecorator<symbol> => {
  const expectedRoleSet = new Set(roles);

  if (expectedRoleSet.has(ROLE_ALL)) {
    for (const role of Object.values($Enums.UserRole)) {
      expectedRoleSet.add(role);
    }
  }

  return SetMetadata(USER_ROLE_KEY, [...expectedRoleSet]);
};
