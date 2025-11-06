import { Attendance } from '../../../domain/entities/attendance.entity';
import { Coordinates } from '../../../domain/value-objects/coordinates.vo';
import { AttendanceTypeOrmEntity } from '../typeorm/entities/attendance.typeorm.entity';

export class AttendanceMapper {
  static toDomain(entity: AttendanceTypeOrmEntity): Attendance {
    const coordinates = new Coordinates(
      Number(entity.latitude),
      Number(entity.longitude),
    );

    return new Attendance(
      entity.id,
      entity.employeeId,
      entity.type,
      coordinates,
      entity.recordTime,
      entity.createdAt,
    );
  }

  static toPersistence(domain: Attendance): Partial<AttendanceTypeOrmEntity> {
    return {
      id: domain.id || undefined,
      employeeId: domain.employeeId,
      type: domain.type,
      latitude: domain.coordinates.latitude,
      longitude: domain.coordinates.longitude,
      recordTime: domain.recordTime,
    };
  }
}

