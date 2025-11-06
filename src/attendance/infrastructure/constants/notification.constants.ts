/**
 * Constantes relacionadas con notificaciones
 * Centraliza valores usados en el sistema de notificaciones
 */
export const NOTIFICATION_CONSTANTS = {
  CONTENT_TYPE: {
    JSON: 'application/json',
  },
  SUBJECT: {
    LATE_CHECK_IN: 'LateCheckInNotification',
  },
  APPLICATION_PROPERTIES: {
    NOTIFICATION_TYPE: {
      LATE_CHECK_IN: 'late_check_in',
    },
  },
} as const;

