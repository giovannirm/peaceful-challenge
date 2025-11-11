import { AzureFunction, Context } from '@azure/functions';
import { EmailService } from '../shared/services/email.service';
import { EMAIL_CONSTANTS } from '../shared/constants/email.constants';
import { ERROR_MESSAGES } from '../shared/constants/error-messages.constants';

interface LateCheckInNotificationMessage {
  employeeId: number;
  employeeEmail: string;
  employeeName: string;
  checkInTime: string; // ISO 8601
  lateMinutes: number;
}

/**
 * Azure Function que procesa notificaciones de tardanzas desde Service Bus
 * Esta función se activa cuando se recibe un mensaje en la cola de Service Bus
 */
const serviceBusQueueTrigger: AzureFunction = async function (
  context: Context,
  message: any,
): Promise<void> {
  const startTime = Date.now();
  context.log('[INICIO] Función NotifyLateCheckIn ejecutándose');
  context.log('[DEBUG] Tipo de mensaje recibido:', typeof message);
  context.log(
    '[DEBUG] Mensaje recibido (raw):',
    JSON.stringify(message, null, 2),
  );

  try {
    // Azure Functions puede recibir el mensaje de Service Bus de diferentes formas:
    // 1. Como objeto directo (cuando Azure Functions parsea automáticamente el JSON)
    // 2. Como objeto ServiceBusMessage con propiedad 'body' (objeto o string JSON)
    let notificationMessage: LateCheckInNotificationMessage;

    context.log('[PASO 1] Iniciando parseo del mensaje');

    // Si el mensaje tiene una propiedad 'body', extraer el contenido
    const messageWithBody = message as {
      body?: LateCheckInNotificationMessage | string;
    };
    if (
      message &&
      typeof message === 'object' &&
      'body' in message &&
      messageWithBody.body
    ) {
      context.log('[PASO 1.1] Mensaje tiene propiedad "body"');
      // Si body es un string, parsearlo; si es un objeto, usarlo directamente
      if (typeof messageWithBody.body === 'string') {
        context.log('[PASO 1.2] Body es string, parseando JSON...');
        notificationMessage = JSON.parse(
          messageWithBody.body,
        ) as LateCheckInNotificationMessage;
      } else {
        context.log('[PASO 1.2] Body es objeto, usando directamente');
        notificationMessage = messageWithBody.body;
      }
    } else {
      context.log(
        '[PASO 1.1] Mensaje no tiene propiedad "body", usando mensaje directamente',
      );
      // Si no, usar el mensaje directamente
      notificationMessage = message as LateCheckInNotificationMessage;
    }

    context.log(
      '[PASO 1] Mensaje parseado exitosamente:',
      JSON.stringify(notificationMessage, null, 2),
    );
    context.log(
      `[PASO 2] Procesando notificación de tardanza para empleado ${notificationMessage.employeeId}`,
    );

    // Validar que el mensaje tenga todos los campos requeridos
    context.log('[PASO 3] Validando campos del mensaje...');
    if (
      !notificationMessage.employeeId ||
      !notificationMessage.employeeEmail ||
      !notificationMessage.employeeName ||
      !notificationMessage.checkInTime ||
      notificationMessage.lateMinutes === undefined
    ) {
      context.log('[ERROR] Mensaje inválido - faltan campos requeridos');
      context.log('[ERROR] employeeId:', notificationMessage.employeeId);
      context.log('[ERROR] employeeEmail:', notificationMessage.employeeEmail);
      context.log('[ERROR] employeeName:', notificationMessage.employeeName);
      context.log('[ERROR] checkInTime:', notificationMessage.checkInTime);
      context.log('[ERROR] lateMinutes:', notificationMessage.lateMinutes);
      context.log(
        '[ERROR] Mensaje completo recibido:',
        JSON.stringify(message, null, 2),
      );
      throw new Error(ERROR_MESSAGES.INVALID_MESSAGE);
    }
    context.log(
      '[PASO 3] Validación exitosa - todos los campos están presentes',
    );

    // Preparar el contenido del email
    context.log('[PASO 4] Preparando contenido del email...');
    const checkInDate = new Date(notificationMessage.checkInTime);
    context.log(
      '[PASO 4.1] Fecha de check-in parseada:',
      checkInDate.toISOString(),
    );
    const emailSubject = `Notificación de Tardanza - ${notificationMessage.employeeName}`;
    context.log('[PASO 4.2] Asunto del email:', emailSubject);

    const emailText = `
Estimado/a ${notificationMessage.employeeName},

Le informamos que se ha registrado una tardanza en su entrada del día ${checkInDate.toLocaleDateString(
      EMAIL_CONSTANTS.LOCALE.ES_ES,
      {
        weekday: EMAIL_CONSTANTS.DATE_FORMAT.WEEKDAY,
        year: EMAIL_CONSTANTS.DATE_FORMAT.YEAR,
        month: EMAIL_CONSTANTS.DATE_FORMAT.MONTH,
        day: EMAIL_CONSTANTS.DATE_FORMAT.DAY,
      },
    )}.

Detalles:
- Hora de entrada registrada: ${checkInDate.toLocaleTimeString(EMAIL_CONSTANTS.LOCALE.ES_ES)}
- Minutos de tardanza: ${notificationMessage.lateMinutes} minutos
- Fecha: ${checkInDate.toLocaleDateString(EMAIL_CONSTANTS.LOCALE.ES_ES)}

Por favor, justifique su tardanza según los procedimientos establecidos en la empresa.

Saludos cordiales,
Sistema de Control de Asistencia
    `.trim();

    // Generar versión HTML del correo
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #f4f4f4; padding: 20px; border-radius: 5px; }
    .content { padding: 20px 0; }
    .details { background-color: #f9f9f9; padding: 15px; border-left: 4px solid #007bff; margin: 20px 0; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Notificación de Tardanza</h2>
    </div>
    <div class="content">
      <p>Estimado/a <strong>${notificationMessage.employeeName}</strong>,</p>
      <p>Le informamos que se ha registrado una tardanza en su entrada del día <strong>${checkInDate.toLocaleDateString(
        EMAIL_CONSTANTS.LOCALE.ES_ES,
        {
          weekday: EMAIL_CONSTANTS.DATE_FORMAT.WEEKDAY,
          year: EMAIL_CONSTANTS.DATE_FORMAT.YEAR,
          month: EMAIL_CONSTANTS.DATE_FORMAT.MONTH,
          day: EMAIL_CONSTANTS.DATE_FORMAT.DAY,
        },
      )}</strong>.</p>
      
      <div class="details">
        <h3>Detalles:</h3>
        <ul>
          <li><strong>Hora de entrada registrada:</strong> ${checkInDate.toLocaleTimeString(EMAIL_CONSTANTS.LOCALE.ES_ES)}</li>
          <li><strong>Minutos de tardanza:</strong> ${notificationMessage.lateMinutes} minutos</li>
          <li><strong>Fecha:</strong> ${checkInDate.toLocaleDateString(EMAIL_CONSTANTS.LOCALE.ES_ES)}</li>
        </ul>
      </div>
      
      <p>Por favor, justifique su tardanza según los procedimientos establecidos en la empresa.</p>
    </div>
    <div class="footer">
      <p>Saludos cordiales,<br>Sistema de Control de Asistencia</p>
    </div>
  </div>
</body>
</html>
    `.trim();

    // Enviar correo usando nodemailer
    context.log('[PASO 5] Preparando envío de correo...');
    context.log(
      `[PASO 5.1] Destinatario: ${notificationMessage.employeeEmail}`,
    );

    // Verificar variables de entorno antes de crear EmailService
    context.log('[PASO 5.2] Verificando variables de entorno...');
    const emailUser = process.env.EMAIL_USER;
    const emailAppPassword = process.env.EMAIL_APP_PASSWORD;
    context.log(
      '[PASO 5.2.1] EMAIL_USER configurado:',
      emailUser ? 'Sí' : 'No',
    );
    context.log(
      '[PASO 5.2.2] EMAIL_APP_PASSWORD configurado:',
      emailAppPassword ? 'Sí' : 'No',
    );

    context.log('[PASO 5.3] Creando instancia de EmailService...');
    const emailService = new EmailService();
    context.log('[PASO 5.3] EmailService creado exitosamente');

    context.log('[PASO 5.4] Enviando correo...');
    await emailService.sendEmail(
      notificationMessage.employeeEmail,
      emailSubject,
      emailText,
      emailHtml,
    );

    context.log(
      `[PASO 5.4] Correo enviado exitosamente a ${notificationMessage.employeeEmail}`,
    );

    const duration = Date.now() - startTime;
    context.log(
      `[EXITO] Notificación de tardanza procesada exitosamente para empleado ${notificationMessage.employeeId} en ${duration}ms`,
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    context.log('[ERROR] ============================================');
    context.log('[ERROR] Error capturado en la función');
    context.log('[ERROR] Duración hasta el error:', `${duration}ms`);

    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack =
      error instanceof Error ? error.stack : 'No stack trace disponible';
    const errorName = error instanceof Error ? error.name : typeof error;

    context.log('[ERROR] Tipo de error:', errorName);
    context.log('[ERROR] Mensaje de error:', errorMessage);
    context.log('[ERROR] Stack trace:', errorStack);

    // Log del mensaje original para debugging
    try {
      context.log(
        '[ERROR] Mensaje original que causó el error:',
        JSON.stringify(message, null, 2),
      );
    } catch {
      context.log('[ERROR] No se pudo serializar el mensaje original');
    }

    const fullErrorMessage = ERROR_MESSAGES.PROCESSING_FAILED(errorMessage);
    context.log('[ERROR] Mensaje de error completo:', fullErrorMessage);
    context.log('[ERROR] ============================================');

    // El mensaje se moverá a la dead letter queue si falla después de los reintentos
    throw error;
  }
};

export default serviceBusQueueTrigger;
