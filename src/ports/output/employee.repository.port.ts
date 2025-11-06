import { Employee } from '../../domain/entities/employee.entity';

export interface IEmployeeRepository {
  findById(id: number): Promise<Employee | null>;
  exists(id: number): Promise<boolean>;
}

