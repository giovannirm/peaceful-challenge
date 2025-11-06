import { AttendanceType } from '@shared/domain/value-objects/attendance-type.vo';
import { BUSINESS_CONSTANTS } from '@shared/domain/constants/business.constants';

/**
 * Servicio de dominio para validaciones de asistencia
 */
export class AttendanceValidatorService {
  /**
   * Calcula si un check-in es tardío (más de 1 hora después de la hora de inicio)
   */
  static isLateCheckIn(checkInTime: Date): boolean {
    const workStartTime = new Date(checkInTime);
    workStartTime.setHours(
      BUSINESS_CONSTANTS.WORK_SCHEDULE.START_HOUR,
      BUSINESS_CONSTANTS.WORK_SCHEDULE.START_MINUTE,
      0,
      0,
    );

    const lateThreshold = new Date(workStartTime);
    lateThreshold.setHours(
      lateThreshold.getHours() +
        BUSINESS_CONSTANTS.WORK_SCHEDULE.LATE_THRESHOLD_HOURS,
    );

    return checkInTime > lateThreshold;
  }

  /**
   * Calcula los minutos de tardanza
   */
  static calculateLateMinutes(checkInTime: Date): number {
    const workStartTime = new Date(checkInTime);
    workStartTime.setHours(
      BUSINESS_CONSTANTS.WORK_SCHEDULE.START_HOUR,
      BUSINESS_CONSTANTS.WORK_SCHEDULE.START_MINUTE,
      0,
      0,
    );

    const lateThreshold = new Date(workStartTime);
    lateThreshold.setHours(
      lateThreshold.getHours() +
        BUSINESS_CONSTANTS.WORK_SCHEDULE.LATE_THRESHOLD_HOURS,
    );

    if (checkInTime <= lateThreshold) {
      return 0;
    }

    const diffMs = checkInTime.getTime() - lateThreshold.getTime();
    return Math.floor(diffMs / (1000 * 60)); // Convertir a minutos
  }

  /**
   * Obtiene el inicio del día (00:00:00)
   */
  static getStartOfDay(date: Date): Date {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    return startOfDay;
  }

  /**
   * Obtiene el final del día (23:59:59.999)
   */
  static getEndOfDay(date: Date): Date {
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    return endOfDay;
  }

  /**
   * Verifica si dos fechas son del mismo día
   */
  static isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }
}

