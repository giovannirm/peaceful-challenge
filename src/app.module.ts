import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeModule } from './infrastructure/config/employee.module';
import { AttendanceModule } from './infrastructure/config/attendance.module';
import { AppConfigModule } from './infrastructure/config/config.module';
import { AppConfigService } from './infrastructure/config/config.service';
import { EmployeeTypeOrmEntity } from './infrastructure/persistence/typeorm/entities/employee.typeorm.entity';
import { AttendanceTypeOrmEntity } from './infrastructure/persistence/typeorm/entities/attendance.typeorm.entity';
import { HealthController } from './adapters/input/rest/health.controller';

@Module({
  imports: [
    AppConfigModule,
    TypeOrmModule.forRootAsync({
      inject: [AppConfigService],
      useFactory: (configService: AppConfigService) => ({
        ...configService.typeOrmConfig,
        entities: [EmployeeTypeOrmEntity, AttendanceTypeOrmEntity],
      }),
    }),
    EmployeeModule,
    AttendanceModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
