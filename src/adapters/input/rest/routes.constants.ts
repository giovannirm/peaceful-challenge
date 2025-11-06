/**
 * Rutas de la API REST
 * Centraliza todas las rutas para evitar magic strings
 */
export const API_ROUTES = {
  ATTENDANCE: {
    BASE: 'attendance',
    CHECK_IN: 'check-in',
    CHECK_OUT: 'check-out',
    BY_EMPLOYEE: 'employee/:id',
  },
} as const;

