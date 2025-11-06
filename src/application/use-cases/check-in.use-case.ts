import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { Attendance } from '../../domain/entities/attendance.entity';
import { AttendanceType } from '../../domain/value-objects/attendance-type.vo';
import { IEmployeeRepository } from '../../ports/output/employee.repository.port';
import { IAttendanceRepository } from '../../ports/output/attendance.repository.port';
import { CreateAttendanceDto } from '../dto/create-attendance.dto';
import { DEPENDENCY_INJECTION_TOKENS } from '../../infrastructure/config/dependency-injection.tokens';
import { ERROR_MESSAGES } from '../../domain/constants/error-messages.constants';

@Injectable()
export class CheckInUseCase {
  constructor(
    @Inject(DEPENDENCY_INJECTION_TOKENS.EMPLOYEE_REPOSITORY)
    private readonly employeeRepository: IEmployeeRepository,
    @Inject(DEPENDENCY_INJECTION_TOKENS.ATTENDANCE_REPOSITORY)
    private readonly attendanceRepository: IAttendanceRepository,
  ) {}

  async execute(createAttendanceDto: CreateAttendanceDto): Promise<Attendance> {
    const employeeExists = await this.employeeRepository.exists(
      createAttendanceDto.employeeId,
    );

    if (!employeeExists) {
      throw new NotFoundException(
        ERROR_MESSAGES.EMPLOYEE_NOT_FOUND(createAttendanceDto.employeeId),
      );
    }

    const attendance = Attendance.create(
      createAttendanceDto.employeeId,
      AttendanceType.CHECK_IN,
      createAttendanceDto.latitude,
      createAttendanceDto.longitude,
      new Date(createAttendanceDto.recordTime),
    );

    return this.attendanceRepository.save(attendance);
  }
}

