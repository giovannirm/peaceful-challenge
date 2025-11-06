import { Injectable, Logger } from '@nestjs/common';
import {
  INotificationQueue,
  LateCheckInNotificationMessage,
} from '@attendance/domain/ports/notification.queue.port';

/**
 * Implementación mock para desarrollo y testing
 * Simula el envío de notificaciones sin usar una cola real
 */
@Injectable()
export class MockNotificationQueue implements INotificationQueue {
  private readonly logger = new Logger(MockNotificationQueue.name);

  async sendLateCheckInNotification(
    employeeId: number,
    employeeEmail: string,
    employeeName: string,
    checkInTime: Date,
    lateMinutes: number,
  ): Promise<void> {
    const message: LateCheckInNotificationMessage = {
      employeeId,
      employeeEmail,
      employeeName,
      checkInTime: checkInTime.toISOString(),
      lateMinutes,
    };

    this.logger.log(
      `[MOCK] Notificación de tardanza enviada: ${JSON.stringify(message)}`,
    );
    this.logger.log(
      `[MOCK] Se enviaría un correo a ${employeeEmail} notificando ${lateMinutes} minutos de tardanza`,
    );
  }
}

