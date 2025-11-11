import { Module, Global } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { AppConfigService } from './config.service';
import { envValidationSchema } from './env.validation';
import { INFRASTRUCTURE_CONSTANTS } from '@shared/infrastructure/constants/app.constants';

@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        INFRASTRUCTURE_CONSTANTS.ENV_FILES.PRODUCTION,
        INFRASTRUCTURE_CONSTANTS.ENV_FILES.DEFAULT,
      ],
      ignoreEnvFile: false,
      validationSchema: envValidationSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
    }),
  ],
  providers: [AppConfigService],
  exports: [AppConfigService],
})
export class AppConfigModule {}
