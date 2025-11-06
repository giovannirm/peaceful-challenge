import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { Attendance } from '../../domain/entities/attendance.entity';
import { IEmployeeRepository } from '../../ports/output/employee.repository.port';
import { IAttendanceRepository } from '../../ports/output/attendance.repository.port';
import { DEPENDENCY_INJECTION_TOKENS } from '../../infrastructure/config/dependency-injection.tokens';
import { ERROR_MESSAGES } from '../../domain/constants/error-messages.constants';

@Injectable()
export class GetAttendancesByEmployeeUseCase {
  constructor(
    @Inject(DEPENDENCY_INJECTION_TOKENS.EMPLOYEE_REPOSITORY)
    private readonly employeeRepository: IEmployeeRepository,
    @Inject(DEPENDENCY_INJECTION_TOKENS.ATTENDANCE_REPOSITORY)
    private readonly attendanceRepository: IAttendanceRepository,
  ) {}

  async execute(employeeId: number): Promise<Attendance[]> {
    const employeeExists = await this.employeeRepository.exists(employeeId);

    if (!employeeExists) {
      throw new NotFoundException(ERROR_MESSAGES.EMPLOYEE_NOT_FOUND(employeeId));
    }

    return this.attendanceRepository.findByEmployeeId(employeeId);
  }
}

