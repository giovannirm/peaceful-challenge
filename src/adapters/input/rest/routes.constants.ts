/**
 * Rutas de la API REST
 * Centraliza todas las rutas para evitar magic strings
 * Estas constantes pertenecen a la capa de adapters (REST)
 */
export const API_ROUTES = {
  HEALTH: 'health',
  ATTENDANCE: {
    BASE: 'attendance',
    CHECK_IN: 'check-in',
    CHECK_OUT: 'check-out',
    BY_EMPLOYEE: 'employee/:id',
  },
} as const;
