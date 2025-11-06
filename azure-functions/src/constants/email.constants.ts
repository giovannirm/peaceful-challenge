/**
 * Constantes relacionadas con el envío de correos
 * Centraliza valores usados en el sistema de notificaciones por email
 */
export const EMAIL_CONSTANTS = {
  LOCALE: {
    ES_ES: 'es-ES',
  },
  DATE_FORMAT: {
    WEEKDAY: 'long',
    YEAR: 'numeric',
    MONTH: 'long',
    DAY: 'numeric',
  },
  SMTP: {
    GMAIL_HOST: 'smtp.gmail.com',
    GMAIL_PORT: 587,
  },
} as const;
