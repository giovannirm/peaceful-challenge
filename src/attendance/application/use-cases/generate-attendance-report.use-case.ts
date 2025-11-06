import {
  Injectable,
  NotFoundException,
  Inject,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import type { IEmployeeRepository } from '@employees/domain/ports/employee.repository.port';
import type { IAttendanceRepository } from '@attendance/domain/ports/attendance.repository.port';
import { DEPENDENCY_INJECTION_TOKENS } from '@shared/application/config/dependency-injection.tokens';
import { ERROR_MESSAGES } from '@shared/domain/constants/error-messages.constants';
import { AttendanceType } from '@shared/domain/value-objects/attendance-type.vo';
import {
  AttendanceReportDto,
  DayAttendanceDto,
} from '@attendance/application/dto/attendance-report.dto';
import { AttendanceValidatorService } from '@attendance/domain/services/attendance-validator.service';
import { DATE_FORMAT } from '@shared/domain/constants/date-format.constants';

@Injectable()
export class GenerateAttendanceReportUseCase {
  private readonly logger = new Logger(GenerateAttendanceReportUseCase.name);

  constructor(
    @Inject(DEPENDENCY_INJECTION_TOKENS.EMPLOYEE_REPOSITORY)
    private readonly employeeRepository: IEmployeeRepository,
    @Inject(DEPENDENCY_INJECTION_TOKENS.ATTENDANCE_REPOSITORY)
    private readonly attendanceRepository: IAttendanceRepository,
  ) {}

  async execute(
    employeeId: number,
    startDate: Date,
    endDate: Date,
  ): Promise<AttendanceReportDto> {
    this.logger.log(
      `Generando reporte de asistencia para empleado ${employeeId} desde ${startDate.toISOString()} hasta ${endDate.toISOString()}`,
    );

    // Validar que el empleado existe
    const employee = await this.employeeRepository.findById(employeeId);
    if (!employee) {
      this.logger.warn(`Empleado no encontrado: ${employeeId}`);
      throw new NotFoundException(ERROR_MESSAGES.EMPLOYEE_NOT_FOUND(employeeId));
    }

    // Validar rango de fechas
    if (startDate > endDate) {
      throw new BadRequestException(
        'La fecha de inicio debe ser anterior a la fecha de fin',
      );
    }

    // Obtener todas las asistencias en el rango de fechas
    const attendances =
      await this.attendanceRepository.findByEmployeeIdAndDateRange(
        employeeId,
        startDate,
        endDate,
      );

    // Generar lista de días en el rango
    const days = this.generateDaysInRange(startDate, endDate);
    const dayAttendances: DayAttendanceDto[] = [];

    let absentDays = 0;
    let lateDays = 0;

    for (const day of days) {
      const dayAttendance = this.processDayAttendance(day, attendances);
      dayAttendances.push(dayAttendance);

      if (dayAttendance.isAbsent) {
        absentDays++;
      }
      if (dayAttendance.isLate) {
        lateDays++;
      }
    }

    const report: AttendanceReportDto = {
      employeeId: employee.id,
      employeeName: employee.fullName,
      startDate: startDate
        .toISOString()
        .split(DATE_FORMAT.ISO_DATE_SEPARATOR)[0],
      endDate: endDate.toISOString().split(DATE_FORMAT.ISO_DATE_SEPARATOR)[0],
      totalDays: days.length,
      absentDays,
      lateDays,
      attendances: dayAttendances,
    };

    this.logger.log(
      `Reporte generado: ${absentDays} faltas, ${lateDays} tardanzas de ${days.length} días totales`,
    );

    return report;
  }

  private generateDaysInRange(startDate: Date, endDate: Date): Date[] {
    const days: Date[] = [];
    const current = new Date(startDate);
    current.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    while (current <= end) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return days;
  }

  private processDayAttendance(
    day: Date,
    attendances: import('@attendance/domain/entities/attendance.entity').Attendance[],
  ): DayAttendanceDto {
    const dayStart = AttendanceValidatorService.getStartOfDay(day);
    const dayEnd = AttendanceValidatorService.getEndOfDay(day);

    // Filtrar asistencias del día
    const dayAttendances = attendances.filter((attendance) => {
      const recordTime = new Date(attendance.recordTime);
      return recordTime >= dayStart && recordTime <= dayEnd;
    });

    const checkIn = dayAttendances.find(
      (a) => a.type === AttendanceType.CHECK_IN,
    );
    const checkOut = dayAttendances.find(
      (a) => a.type === AttendanceType.CHECK_OUT,
    );

    const hasCheckIn = !!checkIn;
    const hasCheckOut = !!checkOut;
    const isAbsent = !hasCheckIn;

    let isLate = false;
    let lateMinutes = 0;

    if (checkIn) {
      isLate = AttendanceValidatorService.isLateCheckIn(checkIn.recordTime);
      if (isLate) {
        lateMinutes = AttendanceValidatorService.calculateLateMinutes(
          checkIn.recordTime,
        );
      }
    }

    return {
      date: day.toISOString().split(DATE_FORMAT.ISO_DATE_SEPARATOR)[0],
      hasCheckIn,
      hasCheckOut,
      checkInTime: checkIn ? checkIn.recordTime.toISOString() : null,
      checkOutTime: checkOut ? checkOut.recordTime.toISOString() : null,
      isLate,
      lateMinutes,
      isAbsent,
    };
  }
}


