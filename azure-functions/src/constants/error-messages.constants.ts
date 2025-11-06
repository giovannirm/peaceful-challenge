/**
 * Mensajes de error
 * Centraliza todos los mensajes de error para evitar magic strings
 */
export const ERROR_MESSAGES = {
  INVALID_MESSAGE: 'Mensaje inválido: faltan campos requeridos',
  EMAIL_SEND_FAILED: (error: string) => `Error al enviar el correo: ${error}`,
  PROCESSING_FAILED: (error: string) =>
    `Error al procesar notificación de tardanza: ${error}`,
} as const;
