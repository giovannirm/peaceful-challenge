import { BUSINESS_CONSTANTS } from '@shared/domain/constants/business.constants';
import { IAttendanceValidator } from '@attendance/domain/ports/attendance-validator.port';

/**
 * Servicio de dominio para validaciones de asistencia
 * Implementa el puerto IAttendanceValidator siguiendo el principio de inversión de dependencias
 */
export class AttendanceValidatorService implements IAttendanceValidator {
  /**
   * Calcula si un check-in es tardío (más de 1 hora después de la hora de inicio)
   */
  isLateCheckIn(checkInTime: Date): boolean {
    const workStartTime = this.getWorkStartTime(checkInTime);
    const lateThreshold = this.getLateThreshold(workStartTime);
    return checkInTime > lateThreshold;
  }

  /**
   * Calcula los minutos de tardanza
   */
  calculateLateMinutes(checkInTime: Date): number {
    const workStartTime = this.getWorkStartTime(checkInTime);
    const lateThreshold = this.getLateThreshold(workStartTime);

    if (checkInTime <= lateThreshold) {
      return 0;
    }

    const diffMs = checkInTime.getTime() - lateThreshold.getTime();
    return Math.floor(
      diffMs / BUSINESS_CONSTANTS.TIME_CONVERSION.MILLISECONDS_PER_MINUTE,
    );
  }

  /**
   * Obtiene el inicio del día (00:00:00)
   */
  getStartOfDay(date: Date): Date {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    return startOfDay;
  }

  /**
   * Obtiene el final del día (23:59:59.999)
   */
  getEndOfDay(date: Date): Date {
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    return endOfDay;
  }

  /**
   * Obtiene la hora de inicio de trabajo para una fecha dada
   * Método privado para evitar duplicación de código
   */
  private getWorkStartTime(date: Date): Date {
    const workStartTime = new Date(date);
    workStartTime.setHours(
      BUSINESS_CONSTANTS.WORK_SCHEDULE.START_HOUR,
      BUSINESS_CONSTANTS.WORK_SCHEDULE.START_MINUTE,
      0,
      0,
    );
    return workStartTime;
  }

  /**
   * Calcula el umbral de tardanza (hora de inicio + tolerancia)
   * Método privado para evitar duplicación de código
   */
  private getLateThreshold(workStartTime: Date): Date {
    const lateThreshold = new Date(workStartTime);
    lateThreshold.setHours(
      lateThreshold.getHours() +
        BUSINESS_CONSTANTS.WORK_SCHEDULE.LATE_THRESHOLD_HOURS,
    );
    return lateThreshold;
  }
}
