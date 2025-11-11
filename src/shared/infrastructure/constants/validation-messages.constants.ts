/**
 * Mensajes de validación de variables de entorno
 * Centraliza todos los mensajes de validación para evitar magic strings
 */
export const VALIDATION_MESSAGES = {
  NODE_ENV_REQUIRED: 'NODE_ENV es requerido',
  NODE_ENV_INVALID: (validValues: string) => `NODE_ENV debe ser ${validValues}`,
  PORT_REQUIRED: 'PORT es requerido',
  PORT_INVALID_NUMBER: 'PORT debe ser un número',
  PORT_INVALID_RANGE: 'PORT debe ser un puerto válido (1-65535)',
  HOST_INVALID_STRING: 'HOST debe ser una cadena de texto',
  DB_HOST_REQUIRED: 'DB_HOST es requerido',
  DB_HOST_INVALID_STRING: 'DB_HOST debe ser una cadena de texto',
  DB_PORT_REQUIRED: 'DB_PORT es requerido',
  DB_PORT_INVALID_NUMBER: 'DB_PORT debe ser un número',
  DB_PORT_INVALID_RANGE: 'DB_PORT debe ser un puerto válido (1-65535)',
  DB_USERNAME_REQUIRED: 'DB_USERNAME es requerido',
  DB_USERNAME_INVALID_STRING: 'DB_USERNAME debe ser una cadena de texto',
  DB_PASSWORD_REQUIRED: 'DB_PASSWORD es requerido',
  DB_PASSWORD_INVALID_STRING: 'DB_PASSWORD debe ser una cadena de texto',
  DB_DATABASE_REQUIRED: 'DB_DATABASE es requerido',
  DB_DATABASE_INVALID_STRING: 'DB_DATABASE debe ser una cadena de texto',
  DB_ENCRYPT_INVALID: (validValues: string) =>
    `DB_ENCRYPT debe ser "${validValues}"`,
  AZURE_SERVICE_BUS_CONNECTION_STRING_INVALID_STRING:
    'AZURE_SERVICE_BUS_CONNECTION_STRING debe ser una cadena de texto',
  AZURE_SERVICE_BUS_QUEUE_NAME_INVALID_STRING:
    'AZURE_SERVICE_BUS_QUEUE_NAME debe ser una cadena de texto',
  ENV_VARIABLES_MISSING: (missingVars: string) =>
    `Las siguientes variables de entorno son requeridas pero no están definidas: ${missingVars}`,
} as const;
