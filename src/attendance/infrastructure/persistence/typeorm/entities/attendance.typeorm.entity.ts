import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { EmployeeTypeOrmEntity } from '@employees/infrastructure/persistence/typeorm/entities/employee.typeorm.entity';
import { AttendanceType } from '@shared/domain/value-objects/attendance-type.vo';
import { DATABASE } from '@shared/infrastructure/persistence/constants/database.constants';

@Entity(DATABASE.TABLES.ATTENDANCES)
export class AttendanceTypeOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: DATABASE.COLUMNS.ATTENDANCE.EMPLOYEE_ID })
  employeeId: number;

  @ManyToOne(() => EmployeeTypeOrmEntity, (employee) => employee.attendances)
  @JoinColumn({ name: DATABASE.COLUMNS.ATTENDANCE.EMPLOYEE_ID })
  employee: EmployeeTypeOrmEntity;

  @Column({
    type: 'varchar',
    length: 20,
  })
  type: AttendanceType;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  longitude: number;

  @Column({ type: 'datetime', name: DATABASE.COLUMNS.ATTENDANCE.RECORD_TIME })
  recordTime: Date;

  @CreateDateColumn({ name: DATABASE.COLUMNS.ATTENDANCE.CREATED_AT })
  createdAt: Date;
}
