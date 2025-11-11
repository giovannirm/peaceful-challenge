import { Injectable, Inject, Logger } from '@nestjs/common';
import { Employee } from '@employees/domain/entities/employee.entity';
import type { IEmployeeRepository } from '@employees/domain/ports/employee.repository.port';
import { DEPENDENCY_INJECTION_TOKENS } from '@shared/application/config/dependency-injection.tokens';

@Injectable()
export class GetAllEmployeesUseCase {
  private readonly logger = new Logger(GetAllEmployeesUseCase.name);

  constructor(
    @Inject(DEPENDENCY_INJECTION_TOKENS.EMPLOYEE_REPOSITORY)
    private readonly employeeRepository: IEmployeeRepository,
  ) {}

  async execute(): Promise<Employee[]> {
    this.logger.log('Obteniendo lista de todos los empleados');

    const employees: Employee[] = await this.employeeRepository.findAll();

    this.logger.log(`Se encontraron ${employees.length} empleados`);

    return employees;
  }
}
