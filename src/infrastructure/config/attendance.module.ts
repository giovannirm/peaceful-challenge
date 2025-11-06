import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceController } from '../../adapters/input/rest/attendance.controller';
import { CheckInUseCase } from '../../application/use-cases/check-in.use-case';
import { CheckOutUseCase } from '../../application/use-cases/check-out.use-case';
import { GetAttendancesByEmployeeUseCase } from '../../application/use-cases/get-attendances-by-employee.use-case';
import { TypeOrmAttendanceRepository } from '../../adapters/output/persistence/typeorm-attendance.repository';
import { AttendanceTypeOrmEntity } from '../persistence/typeorm/entities/attendance.typeorm.entity';
import { IAttendanceRepository } from '../../ports/output/attendance.repository.port';
import { EmployeeModule } from './employee.module';
import { DEPENDENCY_INJECTION_TOKENS } from './dependency-injection.tokens';

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
    {
      provide: DEPENDENCY_INJECTION_TOKENS.ATTENDANCE_REPOSITORY,
      useClass: TypeOrmAttendanceRepository,
    },
  ],
})
export class AttendanceModule {}

