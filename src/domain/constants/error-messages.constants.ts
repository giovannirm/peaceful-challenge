/**
 * Mensajes de error del dominio
 * Centraliza todos los mensajes de error para evitar magic strings
 */
export const ERROR_MESSAGES = {
  EMPLOYEE_NOT_FOUND: (employeeId: number) =>
    `Empleado con ID ${employeeId} no encontrado`,
} as const;

