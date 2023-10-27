import { $Enums } from '@prisma/client';

export interface JwtPayload {
  id: number;
  role: $Enums.UserRole;
  email: string;
}
