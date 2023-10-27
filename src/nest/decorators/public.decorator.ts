import { SetMetadata, applyDecorators } from '@nestjs/common';
import { PUBLIC_KEY } from 'src/constants/metadata-key';

const PublicAuthMiddleware = SetMetadata(PUBLIC_KEY, true);

export const Public = () => applyDecorators(PublicAuthMiddleware);
