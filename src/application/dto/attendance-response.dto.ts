export class AttendanceResponseDto {
  id: number;
  employeeId: number;
  type: string;
  latitude: number;
  longitude: number;
  recordTime: Date;
  createdAt: Date;
}

