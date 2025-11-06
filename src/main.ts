import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { AppConfigService } from './infrastructure/config/config.service';
import { INFRASTRUCTURE_CONSTANTS } from './infrastructure/constants/app.constants';
import { API_ROUTES } from './adapters/input/rest/routes.constants';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
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
bootstrap();
