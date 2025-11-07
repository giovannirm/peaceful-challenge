import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from '@employees/domain/entities/employee.entity';
import { IEmployeeRepository } from '@employees/domain/ports/employee.repository.port';
import { EmployeeTypeOrmEntity } from '@employees/infrastructure/persistence/typeorm/entities/employee.typeorm.entity';
import {
  QUERY_ORDER,
  ORDER_BY_FIELDS,
} from '@shared/infrastructure/persistence/constants/query-order.constants';

@Injectable()
export class TypeOrmEmployeeRepository implements IEmployeeRepository {
  constructor(
    @InjectRepository(EmployeeTypeOrmEntity)
    private readonly repository: Repository<EmployeeTypeOrmEntity>,
  ) {}

  async findById(id: number): Promise<Employee | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? EmployeeTypeOrmEntity.toDomain(entity) : null;
  }

  async exists(id: number): Promise<boolean> {
    const count = await this.repository.count({ where: { id } });
    return count > 0;
  }

  async save(employee: Employee): Promise<Employee> {
    const entity = EmployeeTypeOrmEntity.fromDomain(employee);
    const savedEntity = await this.repository.save(entity);
    return EmployeeTypeOrmEntity.toDomain(savedEntity);
  }

  async findAll(): Promise<Employee[]> {
    const entities = await this.repository.find({
      order: { [ORDER_BY_FIELDS.ID]: QUERY_ORDER.ASC },
    });
    return entities.map((entity) => EmployeeTypeOrmEntity.toDomain(entity));
  }

  async findByDocumentNumber(
    documentNumber: string,
  ): Promise<Employee | null> {
    const entity = await this.repository.findOne({
      where: { documentNumber },
    });
    return entity ? EmployeeTypeOrmEntity.toDomain(entity) : null;
  }
}

