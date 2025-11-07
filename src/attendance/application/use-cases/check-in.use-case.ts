import {
  Injectable,
  NotFoundException,
  Inject,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { Attendance } from '@attendance/domain/entities/attendance.entity';
import { AttendanceType } from '@shared/domain/value-objects/attendance-type.vo';
import type { IEmployeeRepository } from '@employees/domain/ports/employee.repository.port';
import type { IAttendanceRepository } from '@attendance/domain/ports/attendance.repository.port';
import type { INotificationQueue } from '@attendance/domain/ports/notification.queue.port';
import { CheckInDto } from '@attendance/application/dto/check-in.dto';
import { DEPENDENCY_INJECTION_TOKENS } from '@shared/application/config/dependency-injection.tokens';
import { ERROR_MESSAGES } from '@shared/domain/constants/error-messages.constants';
import { DuplicateCheckInException } from '@attendance/domain/exceptions/attendance.exception';
import type { IAttendanceValidator } from '@attendance/domain/ports/attendance-validator.port';

@Injectable()
export class CheckInUseCase {
  private readonly logger = new Logger(CheckInUseCase.name);

  constructor(
    @Inject(DEPENDENCY_INJECTION_TOKENS.EMPLOYEE_REPOSITORY)
    private readonly employeeRepository: IEmployeeRepository,
    @Inject(DEPENDENCY_INJECTION_TOKENS.ATTENDANCE_REPOSITORY)
    private readonly attendanceRepository: IAttendanceRepository,
    @Inject(DEPENDENCY_INJECTION_TOKENS.NOTIFICATION_QUEUE)
    private readonly notificationQueue: INotificationQueue,
    @Inject(DEPENDENCY_INJECTION_TOKENS.ATTENDANCE_VALIDATOR)
    private readonly attendanceValidator: IAttendanceValidator,
  ) {}

  async execute(checkInDto: CheckInDto): Promise<Attendance> {
    this.logger.log(
      `Iniciando check-in para empleado ID: ${checkInDto.employeeId}`,
    );

    // Validar que el empleado existe
    const employee = await this.employeeRepository.findById(
      checkInDto.employeeId,
    );

    if (!employee) {
      this.logger.warn(`Empleado no encontrado: ${checkInDto.employeeId}`);
      throw new NotFoundException(
        ERROR_MESSAGES.EMPLOYEE_NOT_FOUND(checkInDto.employeeId),
      );
    }

    const recordTime = new Date(checkInDto.recordTime);

    // Validar que no haya un check-in previo el mismo día
    const existingCheckIn =
      await this.attendanceRepository.findLastByEmployeeIdAndType(
        checkInDto.employeeId,
        AttendanceType.CHECK_IN,
        recordTime,
      );

    if (existingCheckIn) {
      this.logger.warn(
        `Intento de check-in duplicado para empleado ${checkInDto.employeeId} en ${recordTime.toLocaleDateString()}`,
      );
      throw new BadRequestException(
        new DuplicateCheckInException(
          checkInDto.employeeId,
          recordTime,
        ).message,
      );
    }

    // Crear el registro de asistencia (siempre CHECK_IN para este endpoint)
    const attendance = Attendance.create(
      checkInDto.employeeId,
      AttendanceType.CHECK_IN,
      checkInDto.latitude,
      checkInDto.longitude,
      recordTime,
    );

    const savedAttendance = await this.attendanceRepository.save(attendance);

    // Verificar si es tardío (más de 1 hora después de la hora de inicio)
    const isLate = this.attendanceValidator.isLateCheckIn(recordTime);
    if (isLate) {
      const lateMinutes =
        this.attendanceValidator.calculateLateMinutes(recordTime);
      this.logger.warn(
        `Check-in tardío detectado para empleado ${checkInDto.employeeId}: ${lateMinutes} minutos de tardanza`,
      );

      // Enviar notificación a la cola si el empleado tiene email
      if (employee.hasEmail() && employee.email) {
        try {
          await this.notificationQueue.sendLateCheckInNotification(
            employee.id,
            employee.email,
            employee.fullName,
            recordTime,
            lateMinutes,
          );
          this.logger.log(
            `Notificación de tardanza enviada a la cola para empleado ${employee.id}`,
          );
        } catch (error) {
          this.logger.error(
            `Error al enviar notificación de tardanza: ${error.message}`,
            error.stack,
          );
          // No fallamos el caso de uso si falla la notificación
        }
      } else {
        this.logger.warn(
          `No se puede enviar notificación de tardanza: empleado ${employee.id} no tiene email configurado`,
        );
      }
    } else {
      this.logger.log(
        `Check-in registrado exitosamente para empleado ${checkInDto.employeeId}`,
      );
    }

    return savedAttendance;
  }
}
