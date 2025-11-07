import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { AttendanceTypeOrmEntity } from '@attendance/infrastructure/persistence/typeorm/entities/attendance.typeorm.entity';
import { Employee } from '@employees/domain/entities/employee.entity';
import { DATABASE } from '@shared/infrastructure/persistence/constants/database.constants';

@Entity(DATABASE.TABLES.EMPLOYEES)
export class EmployeeTypeOrmEntity {
  @PrimaryGeneratedColumn()
  id?: number;

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

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    name: DATABASE.COLUMNS.EMPLOYEE.EMAIL,
  })
  email: string | null;

  @OneToMany(() => AttendanceTypeOrmEntity, (attendance) => attendance.employee)
  attendances: AttendanceTypeOrmEntity[];

  static toDomain(entity: EmployeeTypeOrmEntity): Employee {
    // El ID siempre debería existir cuando se convierte desde la BD
    // Si no existe, usar 0 como fallback (aunque no debería pasar)
    return new Employee(
      entity.id ?? 0,
      entity.firstName,
      entity.lastName,
      entity.documentNumber,
      entity.email,
    );
  }

  static fromDomain(domain: Employee): EmployeeTypeOrmEntity {
    const entity = new EmployeeTypeOrmEntity();
    // Solo asignar ID si es mayor que 0 (entidad existente)
    // Si es 0, no asignar el ID para que TypeORM lo trate como nueva entidad
    // y genere un nuevo ID automáticamente
    if (domain.id > 0) entity.id = domain.id;
    // Si domain.id es 0, no asignamos entity.id, dejando que TypeORM lo genere
    entity.firstName = domain.firstName;
    entity.lastName = domain.lastName;
    entity.documentNumber = domain.documentNumber;
    entity.email = domain.email;
    return entity;
  }
}
