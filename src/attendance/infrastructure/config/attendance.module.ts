import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceController } from '@attendance/adapters/input/rest/attendance.controller';
import { CheckInUseCase } from '@attendance/application/use-cases/check-in.use-case';
import { CheckOutUseCase } from '@attendance/application/use-cases/check-out.use-case';
import { GetAttendancesByEmployeeUseCase } from '@attendance/application/use-cases/get-attendances-by-employee.use-case';
import { GenerateAttendanceReportUseCase } from '@attendance/application/use-cases/generate-attendance-report.use-case';
import { TypeOrmAttendanceRepository } from '@attendance/adapters/output/persistence/typeorm-attendance.repository';
import { AttendanceTypeOrmEntity } from '@attendance/infrastructure/persistence/typeorm/entities/attendance.typeorm.entity';
import { IAttendanceRepository } from '@attendance/domain/ports/attendance.repository.port';
import { EmployeeModule } from '@employees/infrastructure/config/employee.module';
import { DEPENDENCY_INJECTION_TOKENS } from '@shared/application/config/dependency-injection.tokens';
import { INotificationQueue } from '@attendance/domain/ports/notification.queue.port';
import { MockNotificationQueue } from '@attendance/infrastructure/queues/mock-notification.queue';
import { AzureServiceBusNotificationQueue } from '@attendance/infrastructure/queues/azure-service-bus-notification.queue';
import { AppConfigService } from '@shared/infrastructure/config/config.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([AttendanceTypeOrmEntity]),
    EmployeeModule,
  ],
  controllers: [AttendanceController],
  providers: [
    CheckInUseCase,
    CheckOutUseCase,
    GetAttendancesByEmployeeUseCase,
    GenerateAttendanceReportUseCase,
    {
      provide: DEPENDENCY_INJECTION_TOKENS.ATTENDANCE_REPOSITORY,
      useClass: TypeOrmAttendanceRepository,
    },
    {
      provide: DEPENDENCY_INJECTION_TOKENS.NOTIFICATION_QUEUE,
      useFactory: (configService: AppConfigService) => {
        // Usar Azure Service Bus si está configurado, sino usar Mock
        if (
          configService.serviceBusConnectionString &&
          configService.serviceBusQueueName
        ) {
          return new AzureServiceBusNotificationQueue(configService);
        }
        return new MockNotificationQueue();
      },
      inject: [AppConfigService],
    },
  ],
})
export class AttendanceModule {}

