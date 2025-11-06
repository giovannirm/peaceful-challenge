import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AppConfigService } from '@shared/infrastructure/config/config.service';
import { INFRASTRUCTURE_CONSTANTS } from '@shared/infrastructure/constants/app.constants';
import { API_ROUTES } from '@shared/adapters/input/rest/routes.constants';
import {
  SWAGGER_CONSTANTS,
  API_VERSIONING,
} from '@shared/adapters/input/rest/swagger.constants';

import { LOGGER_CONSTANTS } from '@shared/infrastructure/constants/logger.constants';

async function bootstrap() {
  const logger = new Logger(LOGGER_CONSTANTS.NAMES.BOOTSTRAP);

  const app = await NestFactory.create(AppModule, {
    logger: [
      LOGGER_CONSTANTS.LEVELS.ERROR,
      LOGGER_CONSTANTS.LEVELS.WARN,
      LOGGER_CONSTANTS.LEVELS.LOG,
      LOGGER_CONSTANTS.LEVELS.DEBUG,
      LOGGER_CONSTANTS.LEVELS.VERBOSE,
    ],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Habilitar CORS
  app.enableCors();

  // Configurar prefijo global de la API (sin versión, ya que enableVersioning la agrega)
  app.setGlobalPrefix(SWAGGER_CONSTANTS.PATH);

  // Configurar versionamiento de la API
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: API_VERSIONING.DEFAULT_VERSION,
  });

  // Configurar Swagger/OpenAPI
  const config = new DocumentBuilder()
    .setTitle(SWAGGER_CONSTANTS.TITLE)
    .setDescription(SWAGGER_CONSTANTS.DESCRIPTION)
    .setVersion(SWAGGER_CONSTANTS.VERSION)
    .addTag(
      SWAGGER_CONSTANTS.TAGS.ATTENDANCE,
      SWAGGER_CONSTANTS.TAG_DESCRIPTIONS.ATTENDANCE,
    )
    .addTag(
      SWAGGER_CONSTANTS.TAGS.EMPLOYEES,
      SWAGGER_CONSTANTS.TAG_DESCRIPTIONS.EMPLOYEES,
    )
    .addTag(
      SWAGGER_CONSTANTS.TAGS.HEALTH,
      SWAGGER_CONSTANTS.TAG_DESCRIPTIONS.HEALTH,
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(`${SWAGGER_CONSTANTS.PATH}`, app, document);

  logger.log(`📚 Swagger disponible en: /${SWAGGER_CONSTANTS.PATH}`);

  const configService = app.get(AppConfigService);
  const port = configService.port;
  const host = configService.host;
  const nodeEnv = configService.nodeEnv;

  await app.listen(port, host);

  const protocol =
    nodeEnv === INFRASTRUCTURE_CONSTANTS.ENVIRONMENT.PRODUCTION
      ? INFRASTRUCTURE_CONSTANTS.PROTOCOL.HTTPS
      : INFRASTRUCTURE_CONSTANTS.PROTOCOL.HTTP;
  const baseUrl = `${protocol}://${host}:${port}`;

  logger.log(`🚀 Application is running on: ${baseUrl}`);
  logger.log(`📝 Environment: ${nodeEnv}`);
  logger.log(`🔍 Health check available at: ${baseUrl}/${API_ROUTES.HEALTH}`);
}

void bootstrap();
