/**
 * Constantes de configuración de Swagger/OpenAPI
 * Centraliza todas las configuraciones relacionadas con la documentación de la API
 */
export const SWAGGER_CONSTANTS = {
  PATH: 'api',
  VERSION: '1.0',
  TITLE: 'Sistema de Registro de Asistencia',
  DESCRIPTION:
    'API para el registro de asistencia de empleados. Permite registrar entradas y salidas, generar reportes de faltas y tardanzas.',
  TAGS: {
    ATTENDANCE: 'attendance',
    EMPLOYEES: 'employees',
    HEALTH: 'health',
  },
  TAG_DESCRIPTIONS: {
    ATTENDANCE: 'Operaciones relacionadas con el registro de asistencia',
    EMPLOYEES: 'Operaciones relacionadas con empleados',
    HEALTH: 'Endpoints de salud del sistema',
  },
} as const;

/**
 * Constantes de versionamiento de la API
 */
export const API_VERSIONING = {
  DEFAULT_VERSION: '1',
  PREFIX: 'v',
} as const;
