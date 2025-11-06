/**
 * Tokens de inyección de dependencias
 * Centraliza todos los tokens para evitar magic strings
 */
export const DEPENDENCY_INJECTION_TOKENS = {
  EMPLOYEE_REPOSITORY: 'IEmployeeRepository',
  ATTENDANCE_REPOSITORY: 'IAttendanceRepository',
} as const;

