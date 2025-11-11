import { Injectable, NotFoundException, Inject, Logger } from '@nestjs/common';
import { Attendance } from '@attendance/domain/entities/attendance.entity';
import type { IEmployeeRepository } from '@employees/domain/ports/employee.repository.port';
import type { IAttendanceRepository } from '@attendance/domain/ports/attendance.repository.port';
import { DEPENDENCY_INJECTION_TOKENS } from '@shared/application/config/dependency-injection.tokens';
import { ERROR_MESSAGES } from '@shared/domain/constants/error-messages.constants';

@Injectable()
export class GetAttendancesByEmployeeUseCase {
  private readonly logger = new Logger(GetAttendancesByEmployeeUseCase.name);

  constructor(
    @Inject(DEPENDENCY_INJECTION_TOKENS.EMPLOYEE_REPOSITORY)
    private readonly employeeRepository: IEmployeeRepository,
    @Inject(DEPENDENCY_INJECTION_TOKENS.ATTENDANCE_REPOSITORY)
    private readonly attendanceRepository: IAttendanceRepository,
  ) {}

  async execute(employeeId: number): Promise<Attendance[]> {
    this.logger.log(`Obteniendo asistencias para empleado ID: ${employeeId}`);

    const employeeExists = await this.employeeRepository.exists(employeeId);

    if (!employeeExists) {
      this.logger.warn(`Empleado no encontrado: ${employeeId}`);
      throw new NotFoundException(
        ERROR_MESSAGES.EMPLOYEE_NOT_FOUND(employeeId),
      );
    }

    const attendances =
      await this.attendanceRepository.findByEmployeeId(employeeId);

    this.logger.log(
      `Se encontraron ${attendances.length} registros de asistencia para empleado ${employeeId}`,
    );

    return attendances;
  }
}
