import { Attendance } from '@attendance/domain/entities/attendance.entity';
import { AttendanceResponseDto } from '@attendance/application/dto/attendance-response.dto';

export class AttendanceResponseMapper {
  static toDto(attendance: Attendance): AttendanceResponseDto {
    return {
      id: attendance.id || 0,
      employeeId: attendance.employeeId,
      type: attendance.type,
      latitude: attendance.coordinates.latitude,
      longitude: attendance.coordinates.longitude,
      recordTime: attendance.recordTime,
      createdAt: attendance.createdAt || new Date(),
    };
  }

  static toDtoList(attendances: Attendance[]): AttendanceResponseDto[] {
    return attendances.map((attendance) => this.toDto(attendance));
  }
}
