import { Attendance } from '@attendance/domain/entities/attendance.entity';
import { AttendanceType } from '@shared/domain/value-objects/attendance-type.vo';

export interface IAttendanceRepository {
  save(attendance: Attendance): Promise<Attendance>;
  findByEmployeeId(employeeId: number): Promise<Attendance[]>;
  findLastByEmployeeIdAndType(
    employeeId: number,
    type: AttendanceType,
    date: Date,
  ): Promise<Attendance | null>;
  findByEmployeeIdAndDateRange(
    employeeId: number,
    startDate: Date,
    endDate: Date,
  ): Promise<Attendance[]>;
  findByEmployeeIdAndDate(
    employeeId: number,
    date: Date,
  ): Promise<Attendance[]>;
}

