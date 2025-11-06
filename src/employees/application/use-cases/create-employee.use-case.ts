import {
  Injectable,
  Inject,
  Logger,
  ConflictException,
} from '@nestjs/common';
import { Employee } from '@employees/domain/entities/employee.entity';
import type { IEmployeeRepository } from '@employees/domain/ports/employee.repository.port';
import { CreateEmployeeDto } from '@employees/application/dto/create-employee.dto';
import { DEPENDENCY_INJECTION_TOKENS } from '@shared/application/config/dependency-injection.tokens';
import {
  DuplicateDocumentNumberException,
} from '@employees/domain/exceptions/employee.exception';

@Injectable()
export class CreateEmployeeUseCase {
  private readonly logger = new Logger(CreateEmployeeUseCase.name);

  constructor(
    @Inject(DEPENDENCY_INJECTION_TOKENS.EMPLOYEE_REPOSITORY)
    private readonly employeeRepository: IEmployeeRepository,
  ) {}

  async execute(createEmployeeDto: CreateEmployeeDto): Promise<Employee> {
    this.logger.log(
      `Creando empleado: ${createEmployeeDto.firstName} ${createEmployeeDto.lastName} (${createEmployeeDto.documentNumber})`,
    );

    // Validar que no exista un empleado con el mismo número de documento
    const existingEmployee =
      await this.employeeRepository.findByDocumentNumber(
        createEmployeeDto.documentNumber,
      );

    if (existingEmployee) {
      this.logger.warn(
        `Intento de crear empleado con documento duplicado: ${createEmployeeDto.documentNumber}`,
      );
      throw new ConflictException(
        new DuplicateDocumentNumberException(
          createEmployeeDto.documentNumber,
        ).message,
      );
    }

    // Crear el empleado
    const employee = Employee.create(
      createEmployeeDto.firstName,
      createEmployeeDto.lastName,
      createEmployeeDto.documentNumber,
      createEmployeeDto.email || null,
    );

    const savedEmployee = await this.employeeRepository.save(employee);

    this.logger.log(
      `Empleado creado exitosamente con ID: ${savedEmployee.id}`,
    );

    return savedEmployee;
  }
}


