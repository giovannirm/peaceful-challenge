/**
 * Constantes de configuración de TypeORM
 * Centraliza valores de configuración de TypeORM
 */
export const TYPEORM_CONSTANTS = {
  RETRY_ATTEMPTS: 10,
  RETRY_DELAY: 3000,
  CONNECT_TIMEOUT: 30000,
  REQUEST_TIMEOUT: 30000,
  LOGGING: {
    DEVELOPMENT: ['error', 'warn', 'migration'] as const,
    PRODUCTION: ['error'] as const,
  },
} as const;
