import { Injectable, NotFoundException, Inject, Logger } from '@nestjs/common';
import { Employee } from '@employees/domain/entities/employee.entity';
import type { IEmployeeRepository } from '@employees/domain/ports/employee.repository.port';
import { DEPENDENCY_INJECTION_TOKENS } from '@shared/application/config/dependency-injection.tokens';
import { ERROR_MESSAGES } from '@shared/domain/constants/error-messages.constants';

@Injectable()
export class GetEmployeeUseCase {
  private readonly logger = new Logger(GetEmployeeUseCase.name);

  constructor(
    @Inject(DEPENDENCY_INJECTION_TOKENS.EMPLOYEE_REPOSITORY)
    private readonly employeeRepository: IEmployeeRepository,
  ) {}

  async execute(id: number): Promise<Employee> {
    this.logger.log(`Buscando empleado con ID: ${id}`);

    const employee = await this.employeeRepository.findById(id);

    if (!employee) {
      this.logger.warn(`Empleado no encontrado: ${id}`);
      throw new NotFoundException(ERROR_MESSAGES.EMPLOYEE_NOT_FOUND(id));
    }

    this.logger.log(`Empleado encontrado: ${employee.fullName} (ID: ${id})`);

    return employee;
  }
}


