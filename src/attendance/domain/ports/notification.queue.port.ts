/**
 * Puerto para envío de notificaciones a través de colas
 */
export interface INotificationQueue {
  sendLateCheckInNotification(
    employeeId: number,
    employeeEmail: string,
    employeeName: string,
    checkInTime: Date,
    lateMinutes: number,
  ): Promise<void>;
}

export interface LateCheckInNotificationMessage {
  employeeId: number;
  employeeEmail: string;
  employeeName: string;
  checkInTime: string; // ISO 8601
  lateMinutes: number;
}
