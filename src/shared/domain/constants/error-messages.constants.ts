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
  INVALID_DATE_RANGE: 'La fecha de inicio debe ser anterior a la fecha de fin',
  INVALID_ATTENDANCE_TYPE: (value: string) =>
    `Invalid attendance type: ${value}`,
  // Mensajes de excepciones de asistencia
  DUPLICATE_CHECK_IN: (employeeId: number, date: Date) =>
    `El empleado con ID ${employeeId} ya tiene un registro de entrada para el día ${date.toLocaleDateString()}`,
  MISSING_CHECK_IN: (employeeId: number, date: Date) =>
    `El empleado con ID ${employeeId} no tiene un registro de entrada para el día ${date.toLocaleDateString()}`,
  DUPLICATE_CHECK_OUT: (employeeId: number, date: Date) =>
    `El empleado con ID ${employeeId} ya tiene un registro de salida para el día ${date.toLocaleDateString()}`,
  // Mensajes de excepciones de empleados
  DUPLICATE_DOCUMENT_NUMBER: (documentNumber: string) =>
    `Ya existe un empleado con el número de documento: ${documentNumber}`,
} as const;
