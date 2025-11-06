/**
 * Mensajes de error del dominio
 * Centraliza todos los mensajes de error para evitar magic strings
 */
export const ERROR_MESSAGES = {
  EMPLOYEE_NOT_FOUND: (employeeId: number) =>
    `Empleado con ID ${employeeId} no encontrado`,
  EMPLOYEE_EMAIL_NOT_FOUND: (employeeId: number) =>
    `El empleado con ID ${employeeId} no tiene un correo electrónico configurado`,
  INVALID_DATE_FORMAT: 'Las fechas deben tener formato válido (YYYY-MM-DD)',
} as const;
