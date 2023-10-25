import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerPath = 'api/swg';

export const swaggerDocumentOptions = new DocumentBuilder()
  .setTitle('LMS Clone API')
  .setDescription('This is API for cloned LMS server!!!')
  .addBearerAuth()
  .build();
