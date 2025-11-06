import {
  Injectable,
  Inject,
  Logger,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Employee } from '@employees/domain/entities/employee.entity';
import type { IEmployeeRepository } from '@employees/domain/ports/employee.repository.port';
import { UpdateEmployeeDto } from '@employees/application/dto/update-employee.dto';
import { DEPENDENCY_INJECTION_TOKENS } from '@shared/application/config/dependency-injection.tokens';
import { ERROR_MESSAGES } from '@shared/domain/constants/error-messages.constants';
import {
  DuplicateDocumentNumberException,
} from '@employees/domain/exceptions/employee.exception';

@Injectable()
export class UpdateEmployeeUseCase {
  private readonly logger = new Logger(UpdateEmployeeUseCase.name);

  constructor(
    @Inject(DEPENDENCY_INJECTION_TOKENS.EMPLOYEE_REPOSITORY)
    private readonly employeeRepository: IEmployeeRepository,
  ) {}

  async execute(
    id: number,
    updateEmployeeDto: UpdateEmployeeDto,
  ): Promise<Employee> {
    this.logger.log(`Actualizando empleado con ID: ${id}`);

    // Buscar el empleado existente
    const existingEmployee = await this.employeeRepository.findById(id);

    if (!existingEmployee) {
      this.logger.warn(`Empleado no encontrado: ${id}`);
      throw new NotFoundException(ERROR_MESSAGES.EMPLOYEE_NOT_FOUND(id));
    }

    // Validar que el número de documento no esté duplicado (si se está actualizando)
    if (
      updateEmployeeDto.documentNumber &&
      updateEmployeeDto.documentNumber !== existingEmployee.documentNumber
    ) {
      const employeeWithSameDocument =
        await this.employeeRepository.findByDocumentNumber(
          updateEmployeeDto.documentNumber,
        );

      if (employeeWithSameDocument && employeeWithSameDocument.id !== id) {
        this.logger.warn(
          `Intento de actualizar empleado con documento duplicado: ${updateEmployeeDto.documentNumber}`,
        );
        throw new ConflictException(
          new DuplicateDocumentNumberException(
            updateEmployeeDto.documentNumber,
          ).message,
        );
      }
    }

    // Crear empleado actualizado con los nuevos valores
    const updatedEmployee = new Employee(
      existingEmployee.id,
      updateEmployeeDto.firstName ?? existingEmployee.firstName,
      updateEmployeeDto.lastName ?? existingEmployee.lastName,
      updateEmployeeDto.documentNumber ?? existingEmployee.documentNumber,
      updateEmployeeDto.email ?? existingEmployee.email,
    );

    const savedEmployee = await this.employeeRepository.save(updatedEmployee);

    this.logger.log(
      `Empleado actualizado exitosamente: ${savedEmployee.fullName} (ID: ${savedEmployee.id})`,
    );

    return savedEmployee;
  }
}

