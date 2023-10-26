import { DocumentBuilder, SwaggerCustomOptions } from '@nestjs/swagger';

export const swaggerPath = 'api/swg';

export const swaggerDocumentOptions = new DocumentBuilder()
  .setTitle('LMS Clone API')
  .setDescription('This is API for cloned LMS server!!!')
  .addBearerAuth()
  .build();

export const swaggerCustomOptions: SwaggerCustomOptions = {
  swaggerOptions: {
    persistAuthorization: true,
  },
  customCssUrl: '/swagger/swagger.css',
  customSiteTitle: 'LMS Clone API',
  customfavIcon: '/swagger/favicon.avif',
};
