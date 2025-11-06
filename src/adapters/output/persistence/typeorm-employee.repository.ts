import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from '../../../domain/entities/employee.entity';
import { IEmployeeRepository } from '../../../ports/output/employee.repository.port';
import { EmployeeTypeOrmEntity } from '../../../infrastructure/persistence/typeorm/entities/employee.typeorm.entity';

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
}

