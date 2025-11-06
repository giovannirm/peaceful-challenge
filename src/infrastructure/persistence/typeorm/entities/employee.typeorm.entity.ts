import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { AttendanceTypeOrmEntity } from './attendance.typeorm.entity';
import { Employee } from '../../../../domain/entities/employee.entity';
import { DATABASE } from '../../constants/database.constants';

@Entity(DATABASE.TABLES.EMPLOYEES)
export class EmployeeTypeOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 100,
    name: DATABASE.COLUMNS.EMPLOYEE.FIRST_NAME,
  })
  firstName: string;

  @Column({
    type: 'varchar',
    length: 100,
    name: DATABASE.COLUMNS.EMPLOYEE.LAST_NAME,
  })
  lastName: string;

  @Column({
    type: 'varchar',
    length: 20,
    unique: true,
    name: DATABASE.COLUMNS.EMPLOYEE.DOCUMENT_NUMBER,
  })
  documentNumber: string;

  @OneToMany(() => AttendanceTypeOrmEntity, (attendance) => attendance.employee)
  attendances: AttendanceTypeOrmEntity[];

  static toDomain(entity: EmployeeTypeOrmEntity): Employee {
    return new Employee(
      entity.id,
      entity.firstName,
      entity.lastName,
      entity.documentNumber,
    );
  }

  static fromDomain(domain: Employee): EmployeeTypeOrmEntity {
    const entity = new EmployeeTypeOrmEntity();
    entity.id = domain.id;
    entity.firstName = domain.firstName;
    entity.lastName = domain.lastName;
    entity.documentNumber = domain.documentNumber;
    return entity;
  }
}
