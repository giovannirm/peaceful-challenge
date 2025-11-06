import {
  app,
  ServiceBusQueueFunctionOptions,
  InvocationContext,
} from '@azure/functions';

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
        throw new Error('Mensaje inválido: faltan campos requeridos');
      }

      // Preparar el contenido del email
      const checkInDate = new Date(message.checkInTime);
      const emailSubject = `Notificación de Tardanza - ${message.employeeName}`;
      const emailBody = `
Estimado/a ${message.employeeName},

Le informamos que se ha registrado una tardanza en su entrada del día ${checkInDate.toLocaleDateString(
        'es-ES',
        {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        },
      )}.

Detalles:
- Hora de entrada registrada: ${checkInDate.toLocaleTimeString('es-ES')}
- Minutos de tardanza: ${message.lateMinutes} minutos
- Fecha: ${checkInDate.toLocaleDateString('es-ES')}

Por favor, justifique su tardanza según los procedimientos establecidos en la empresa.

Saludos cordiales,
Sistema de Control de Asistencia
      `.trim();

      // TODO: Implementar envío real de email
      // Opciones:
      // 1. Azure Communication Services Email
      // 2. SendGrid
      // 3. Office 365 / Microsoft Graph API
      // 4. SMTP directo

      // Por ahora, solo logueamos el email que se enviaría
      context.log('=== EMAIL A ENVIAR ===');
      context.log(`Para: ${message.employeeEmail}`);
      context.log(`Asunto: ${emailSubject}`);
      context.log(`Cuerpo:\n${emailBody}`);
      context.log('======================');

      // Simular envío de email (reemplazar con implementación real)
      // Cuando se implemente, descomentar y usar await:
      // await sendEmail({
      //   to: message.employeeEmail,
      //   subject: emailSubject,
      //   body: emailBody,
      // });

      // Simular procesamiento asíncrono para evitar warning de función async sin await
      await Promise.resolve();

      context.log(
        `Notificación de tardanza procesada exitosamente para empleado ${message.employeeId}`,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      context.error(
        `Error al procesar notificación de tardanza: ${errorMessage}`,
      );
      // El mensaje se moverá a la dead letter queue si falla después de los reintentos
      throw error;
    }
  },
} as ServiceBusQueueFunctionOptions);
