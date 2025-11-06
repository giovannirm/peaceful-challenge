import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ServiceBusClient, ServiceBusSender } from '@azure/service-bus';
import {
  INotificationQueue,
  LateCheckInNotificationMessage,
} from '@attendance/domain/ports/notification.queue.port';
import { AppConfigService } from '@shared/infrastructure/config/config.service';
import { NOTIFICATION_CONSTANTS } from '@attendance/infrastructure/constants/notification.constants';

/**
 * Implementación de notificación usando Azure Service Bus
 * Los mensajes se envían a la cola y serán procesados por una Azure Function
 */
@Injectable()
export class AzureServiceBusNotificationQueue
  implements INotificationQueue, OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(AzureServiceBusNotificationQueue.name);
  private serviceBusClient: ServiceBusClient | null = null;
  private sender: ServiceBusSender | null = null;

  constructor(private readonly configService: AppConfigService) {}

  onModuleInit(): void {
    const connectionString = this.configService.serviceBusConnectionString;
    const queueName = this.configService.serviceBusQueueName;

    if (!connectionString || !queueName) {
      this.logger.warn(
        'Azure Service Bus no está configurado. Las notificaciones no se enviarán.',
      );
      return;
    }

    try {
      // TypeScript type narrowing: después del if sabemos que son strings
      this.serviceBusClient = new ServiceBusClient(connectionString as string);
      this.sender = this.serviceBusClient.createSender(queueName as string);
      this.logger.log(`Azure Service Bus inicializado. Cola: ${queueName}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Error al inicializar Azure Service Bus: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  async onModuleDestroy(): Promise<void> {
    try {
      if (this.sender) {
        await this.sender.close();
        this.logger.log('Sender de Azure Service Bus cerrado');
      }
      if (this.serviceBusClient) {
        await this.serviceBusClient.close();
        this.logger.log('Cliente de Azure Service Bus cerrado');
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Error al cerrar conexión de Azure Service Bus: ${errorMessage}`,
        errorStack,
      );
    }
  }

  async sendLateCheckInNotification(
    employeeId: number,
    employeeEmail: string,
    employeeName: string,
    checkInTime: Date,
    lateMinutes: number,
  ): Promise<void> {
    if (!this.sender) {
      this.logger.warn(
        'Azure Service Bus no está inicializado. No se puede enviar la notificación.',
      );
      return;
    }

    this.logger.log(
      `Enviando notificación de tardanza a Azure Service Bus para empleado ${employeeId}`,
    );

    const message: LateCheckInNotificationMessage = {
      employeeId,
      employeeEmail,
      employeeName,
      checkInTime: checkInTime.toISOString(),
      lateMinutes,
    };

    try {
      await this.sender.sendMessages({
        body: message,
        contentType: NOTIFICATION_CONSTANTS.CONTENT_TYPE.JSON,
        subject: NOTIFICATION_CONSTANTS.SUBJECT.LATE_CHECK_IN,
        applicationProperties: {
          employeeId: employeeId.toString(),
          notificationType:
            NOTIFICATION_CONSTANTS.APPLICATION_PROPERTIES.NOTIFICATION_TYPE
              .LATE_CHECK_IN,
        },
      });

      this.logger.log(
        `Notificación de tardanza enviada exitosamente a Azure Service Bus para empleado ${employeeId}. ` +
          `El mensaje será procesado por una Azure Function.`,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Error al enviar notificación a Azure Service Bus: ${errorMessage}`,
        errorStack,
      );
      // No lanzamos el error para que no afecte el flujo principal
      // El mensaje puede ir a dead letter queue si está configurado
      throw error;
    }
  }
}
