/**
 * Tokens de inyección de dependencias
 * Centraliza todos los tokens para evitar magic strings
 * Estos tokens pertenecen a la capa de aplicación (no a infraestructura)
 */
export const DEPENDENCY_INJECTION_TOKENS = {
  EMPLOYEE_REPOSITORY: 'IEmployeeRepository',
  ATTENDANCE_REPOSITORY: 'IAttendanceRepository',
  NOTIFICATION_QUEUE: 'INotificationQueue',
  ATTENDANCE_VALIDATOR: 'IAttendanceValidator',
} as const;
