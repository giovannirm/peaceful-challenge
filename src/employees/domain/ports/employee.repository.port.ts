import { Employee } from '@employees/domain/entities/employee.entity';

export interface IEmployeeRepository {
  findById(id: number): Promise<Employee | null>;
  exists(id: number): Promise<boolean>;
  save(employee: Employee): Promise<Employee>;
  findAll(): Promise<Employee[]>;
  findByDocumentNumber(documentNumber: string): Promise<Employee | null>;
}

