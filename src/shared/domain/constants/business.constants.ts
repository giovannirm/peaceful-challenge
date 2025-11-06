/**
 * Constantes de negocio
 * Valores relacionados con las reglas de negocio del dominio
 */
export const BUSINESS_CONSTANTS = {
  WORK_SCHEDULE: {
    START_HOUR: 9, // 9:00 AM
    START_MINUTE: 0,
    LATE_THRESHOLD_HOURS: 1, // 1 hora de tolerancia para tardanzas
  },
} as const;
