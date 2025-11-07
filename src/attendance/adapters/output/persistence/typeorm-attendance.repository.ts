import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Attendance } from '@attendance/domain/entities/attendance.entity';
import { IAttendanceRepository } from '@attendance/domain/ports/attendance.repository.port';
import { AttendanceTypeOrmEntity } from '@attendance/infrastructure/persistence/typeorm/entities/attendance.typeorm.entity';
import { AttendanceMapper } from '@attendance/infrastructure/persistence/mappers/attendance.mapper';
import { AttendanceType } from '@shared/domain/value-objects/attendance-type.vo';
import {
  QUERY_ORDER,
  ORDER_BY_FIELDS,
} from '@shared/infrastructure/persistence/constants/query-order.constants';

@Injectable()
export class TypeOrmAttendanceRepository implements IAttendanceRepository {
  constructor(
    @InjectRepository(AttendanceTypeOrmEntity)
    private readonly repository: Repository<AttendanceTypeOrmEntity>,
  ) {}

  async save(attendance: Attendance): Promise<Attendance> {
    const entityData = AttendanceMapper.toPersistence(attendance);
    const entity = this.repository.create(entityData);
    const savedEntity = await this.repository.save(entity);
    return AttendanceMapper.toDomain(savedEntity);
  }

  async findByEmployeeId(employeeId: number): Promise<Attendance[]> {
    const entities = await this.repository.find({
      where: { employeeId },
      order: { [ORDER_BY_FIELDS.RECORD_TIME]: QUERY_ORDER.DESC },
    });
    return entities.map((entity) => AttendanceMapper.toDomain(entity));
  }

  async findLastByEmployeeIdAndType(
    employeeId: number,
    type: AttendanceType,
    date: Date,
  ): Promise<Attendance | null> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const entity = await this.repository.findOne({
      where: {
        employeeId,
        type,
        recordTime: Between(startOfDay, endOfDay),
      },
      order: { [ORDER_BY_FIELDS.RECORD_TIME]: QUERY_ORDER.DESC },
    });

    return entity ? AttendanceMapper.toDomain(entity) : null;
  }

  async findByEmployeeIdAndDateRange(
    employeeId: number,
    startDate: Date,
    endDate: Date,
  ): Promise<Attendance[]> {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const entities = await this.repository.find({
      where: {
        employeeId,
        recordTime: Between(start, end),
      },
      order: { [ORDER_BY_FIELDS.RECORD_TIME]: QUERY_ORDER.ASC },
    });

    return entities.map((entity) => AttendanceMapper.toDomain(entity));
  }

  async findByEmployeeIdAndDate(
    employeeId: number,
    date: Date,
  ): Promise<Attendance[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const entities = await this.repository.find({
      where: {
        employeeId,
        recordTime: Between(startOfDay, endOfDay),
      },
      order: { [ORDER_BY_FIELDS.RECORD_TIME]: QUERY_ORDER.ASC },
    });

    return entities.map((entity) => AttendanceMapper.toDomain(entity));
  }
}
