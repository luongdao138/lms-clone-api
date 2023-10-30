import { registerEnumType } from '@nestjs/graphql';
import { $Enums } from '@prisma/client';

export enum UserSignupRole {
  STUDENT = 'STUDENT',
  INSTRUCTOR = 'INSTRUCTOR',
}

registerEnumType($Enums.UserRole, { name: 'UserRole' });
registerEnumType(UserSignupRole, { name: 'UserSignupRole' });
