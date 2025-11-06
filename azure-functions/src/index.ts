import {
  app,
  ServiceBusQueueFunctionOptions,
  InvocationContext,
} from '@azure/functions';
import { EmailService } from './services/email.service';
import { EMAIL_CONSTANTS } from './constants/email.constants';
import { ERROR_MESSAGES } from './constants/error-messages.constants';

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
 * Similar a AWS Lambda - toda la lógica en un solo archivo
 */
app.serviceBusQueue('NotifyLateCheckIn', {
  connection: 'SERVICE_BUS_CONNECTION_STRING',
  queueName: '%SERVICE_BUS_QUEUE_NAME%',
  handler: async (
    message: LateCheckInNotificationMessage,
    context: InvocationContext,
  ): Promise<void> => {
    context.log(
      `Procesando notificación de tardanza para empleado ${message.employeeId}`,
    );

    try {
      // Validar que el mensaje tenga todos los campos requeridos
      if (
        !message.employeeId ||
        !message.employeeEmail ||
        !message.employeeName ||
        !message.checkInTime ||
        message.lateMinutes === undefined
      ) {
        throw new Error(ERROR_MESSAGES.INVALID_MESSAGE);
      }

      // Preparar el contenido del email
      const checkInDate = new Date(message.checkInTime);
      const emailSubject = `Notificación de Tardanza - ${message.employeeName}`;

      const emailText = `
Estimado/a ${message.employeeName},

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
- Minutos de tardanza: ${message.lateMinutes} minutos
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
      <p>Estimado/a <strong>${message.employeeName}</strong>,</p>
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
          <li><strong>Minutos de tardanza:</strong> ${message.lateMinutes} minutos</li>
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
      context.log(`Enviando correo a ${message.employeeEmail}...`);

      const emailService = new EmailService();
      await emailService.sendEmail(
        message.employeeEmail,
        emailSubject,
        emailText,
        emailHtml,
      );

      context.log(`Correo enviado exitosamente a ${message.employeeEmail}`);

      context.log(
        `Notificación de tardanza procesada exitosamente para empleado ${message.employeeId}`,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      context.error(ERROR_MESSAGES.PROCESSING_FAILED(errorMessage));
      // El mensaje se moverá a la dead letter queue si falla después de los reintentos
      throw error;
    }
  },
} as ServiceBusQueueFunctionOptions);
