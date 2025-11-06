import { AttendanceType } from '@shared/domain/value-objects/attendance-type.vo';
import { Coordinates } from '@shared/domain/value-objects/coordinates.vo';

export class Attendance {
  constructor(
    public readonly id: number | null,
    public readonly employeeId: number,
    public readonly type: AttendanceType,
    public readonly coordinates: Coordinates,
    public readonly recordTime: Date,
    public readonly createdAt: Date | null = null,
  ) {}

  static create(
    employeeId: number,
    type: AttendanceType,
    latitude: number,
    longitude: number,
    recordTime: Date,
  ): Attendance {
    const coordinates = new Coordinates(latitude, longitude);
    return new Attendance(null, employeeId, type, coordinates, recordTime);
  }
}

