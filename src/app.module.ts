import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeModule } from '@employees/infrastructure/config/employee.module';
import { AttendanceModule } from '@attendance/infrastructure/config/attendance.module';
import { AppConfigModule } from '@shared/infrastructure/config/config.module';
import { AppConfigService } from '@shared/infrastructure/config/config.service';
import { EmployeeTypeOrmEntity } from '@employees/infrastructure/persistence/typeorm/entities/employee.typeorm.entity';
import { AttendanceTypeOrmEntity } from '@attendance/infrastructure/persistence/typeorm/entities/attendance.typeorm.entity';
import { HealthController } from '@shared/adapters/input/rest/health.controller';
import { TYPEORM_CONSTANTS } from '@shared/infrastructure/constants/typeorm.constants';
import { INFRASTRUCTURE_CONSTANTS } from '@shared/infrastructure/constants/app.constants';

@Module({
  imports: [
    AppConfigModule,
    TypeOrmModule.forRootAsync({
      inject: [AppConfigService],
      useFactory: (configService: AppConfigService) => ({
        ...configService.typeOrmConfig,
        entities: [EmployeeTypeOrmEntity, AttendanceTypeOrmEntity],
        retryAttempts: TYPEORM_CONSTANTS.RETRY_ATTEMPTS,
        retryDelay: TYPEORM_CONSTANTS.RETRY_DELAY,
        autoLoadEntities: false,
        logging:
          configService.nodeEnv ===
          INFRASTRUCTURE_CONSTANTS.ENVIRONMENT.DEVELOPMENT
            ? [...TYPEORM_CONSTANTS.LOGGING.DEVELOPMENT]
            : [...TYPEORM_CONSTANTS.LOGGING.PRODUCTION],
      }),
    }),
    EmployeeModule,
    AttendanceModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
