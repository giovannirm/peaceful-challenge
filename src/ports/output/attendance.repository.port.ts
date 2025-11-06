import { Attendance } from '../../domain/entities/attendance.entity';

export interface IAttendanceRepository {
  save(attendance: Attendance): Promise<Attendance>;
  findByEmployeeId(employeeId: number): Promise<Attendance[]>;
}

