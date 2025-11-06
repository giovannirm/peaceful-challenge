/**
 * Constantes de infraestructura
 * Configuración técnica, entornos, protocolos, base de datos, etc.
 * Estas constantes pertenecen a la capa de infraestructura
 */
export const INFRASTRUCTURE_CONSTANTS = {
  ENVIRONMENT: {
    DEVELOPMENT: 'development',
    PRODUCTION: 'production',
    TEST: 'test',
  },
  PROTOCOL: {
    HTTP: 'http',
    HTTPS: 'https',
  },
  DATABASE: {
    TYPE: {
      MSSQL: 'mssql',
    },
  },
  BOOLEAN: {
    TRUE: 'true',
    FALSE: 'false',
  },
  ENV_FILES: {
    PRODUCTION: '.env.production',
    DEFAULT: '.env',
  },
  HOST: {
    LOCALHOST: 'localhost',
  },
} as const;

