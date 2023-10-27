import { registerEnumType } from '@nestjs/graphql';
import { $Enums } from '@prisma/client';

registerEnumType($Enums.UserRole, { name: 'UserRole' });
