/**
 * Nombres de variables de entorno
 * Centraliza todos los nombres de variables de entorno para evitar magic strings
 */
export const ENV_VARIABLES = {
  NODE_ENV: 'NODE_ENV',
  PORT: 'PORT',
  HOST: 'HOST',
  DB_HOST: 'DB_HOST',
  DB_PORT: 'DB_PORT',
  DB_USERNAME: 'DB_USERNAME',
  DB_PASSWORD: 'DB_PASSWORD',
  DB_DATABASE: 'DB_DATABASE',
  DB_ENCRYPT: 'DB_ENCRYPT',
  AZURE_SERVICE_BUS_CONNECTION_STRING: 'AZURE_SERVICE_BUS_CONNECTION_STRING',
  AZURE_SERVICE_BUS_QUEUE_NAME: 'AZURE_SERVICE_BUS_QUEUE_NAME',
} as const;
