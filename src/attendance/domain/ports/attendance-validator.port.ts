/**
 * Puerto (interfaz) para el servicio de validación de asistencia
 * Define el contrato que debe cumplir cualquier implementación de validación
 */
export interface IAttendanceValidator {
  /**
   * Calcula si un check-in es tardío (más de 1 hora después de la hora de inicio)
   */
  isLateCheckIn(checkInTime: Date): boolean;

  /**
   * Calcula los minutos de tardanza
   */
  calculateLateMinutes(checkInTime: Date): number;

  /**
   * Obtiene el inicio del día (00:00:00)
   */
  getStartOfDay(date: Date): Date;

  /**
   * Obtiene el final del día (23:59:59.999)
   */
  getEndOfDay(date: Date): Date;
}

