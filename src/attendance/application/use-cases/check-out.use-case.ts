import { Injectable, NotFoundException, Inject, Logger } from '@nestjs/common';
import { Attendance } from '@attendance/domain/entities/attendance.entity';
import { AttendanceType } from '@shared/domain/value-objects/attendance-type.vo';
import type { IEmployeeRepository } from '@employees/domain/ports/employee.repository.port';
import type { IAttendanceRepository } from '@attendance/domain/ports/attendance.repository.port';
import { CheckOutDto } from '@attendance/application/dto/check-out.dto';
import { DEPENDENCY_INJECTION_TOKENS } from '@shared/application/config/dependency-injection.tokens';
import { ERROR_MESSAGES } from '@shared/domain/constants/error-messages.constants';
import {
  MissingCheckInException,
  DuplicateCheckOutException,
} from '@attendance/domain/exceptions/attendance.exception';

@Injectable()
export class CheckOutUseCase {
  private readonly logger = new Logger(CheckOutUseCase.name);

  constructor(
    @Inject(DEPENDENCY_INJECTION_TOKENS.EMPLOYEE_REPOSITORY)
    private readonly employeeRepository: IEmployeeRepository,
    @Inject(DEPENDENCY_INJECTION_TOKENS.ATTENDANCE_REPOSITORY)
    private readonly attendanceRepository: IAttendanceRepository,
  ) {}

  async execute(checkOutDto: CheckOutDto): Promise<Attendance> {
    this.logger.log(
      `Iniciando check-out para empleado ID: ${checkOutDto.employeeId}`,
    );

    // Validar que el empleado existe
    const employee = await this.employeeRepository.findById(
      checkOutDto.employeeId,
    );

    if (!employee) {
      this.logger.warn(`Empleado no encontrado: ${checkOutDto.employeeId}`);
      throw new NotFoundException(
        ERROR_MESSAGES.EMPLOYEE_NOT_FOUND(checkOutDto.employeeId),
      );
    }

    const recordTime = new Date(checkOutDto.recordTime);

    // Validar que no haya un check-out previo el mismo día
    const existingCheckOut =
      await this.attendanceRepository.findLastByEmployeeIdAndType(
        checkOutDto.employeeId,
        AttendanceType.CHECK_OUT,
        recordTime,
      );

    if (existingCheckOut) {
      this.logger.warn(
        `Intento de check-out duplicado para empleado ${checkOutDto.employeeId} en ${recordTime.toLocaleDateString()}`,
      );
      throw new DuplicateCheckOutException(checkOutDto.employeeId, recordTime);
    }

    // Validar que exista un check-in previo el mismo día
    const checkIn = await this.attendanceRepository.findLastByEmployeeIdAndType(
      checkOutDto.employeeId,
      AttendanceType.CHECK_IN,
      recordTime,
    );

    if (!checkIn) {
      this.logger.warn(
        `Intento de check-out sin check-in previo para empleado ${checkOutDto.employeeId} en ${recordTime.toLocaleDateString()}`,
      );
      throw new MissingCheckInException(checkOutDto.employeeId, recordTime);
    }

    // Crear el registro de asistencia (siempre CHECK_OUT para este endpoint)
    const attendance = Attendance.create(
      checkOutDto.employeeId,
      AttendanceType.CHECK_OUT,
      checkOutDto.latitude,
      checkOutDto.longitude,
      recordTime,
    );

    const savedAttendance = await this.attendanceRepository.save(attendance);

    this.logger.log(
      `Check-out registrado exitosamente para empleado ${checkOutDto.employeeId}`,
    );

    return savedAttendance;
  }
}
