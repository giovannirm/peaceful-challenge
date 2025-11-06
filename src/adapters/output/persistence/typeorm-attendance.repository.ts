import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendance } from '../../../domain/entities/attendance.entity';
import { IAttendanceRepository } from '../../../ports/output/attendance.repository.port';
import { AttendanceTypeOrmEntity } from '../../../infrastructure/persistence/typeorm/entities/attendance.typeorm.entity';
import { AttendanceMapper } from '../../../infrastructure/persistence/mappers/attendance.mapper';

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
      order: { recordTime: 'DESC' },
    });
    return entities.map((entity) => AttendanceMapper.toDomain(entity));
  }
}

