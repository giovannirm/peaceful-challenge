import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UpdateEmployeeUseCase } from './update-employee.use-case';
import { Employee } from '@employees/domain/entities/employee.entity';
import { UpdateEmployeeDto } from '@employees/application/dto/update-employee.dto';
import { DEPENDENCY_INJECTION_TOKENS } from '@shared/application/config/dependency-injection.tokens';
import { DuplicateDocumentNumberException } from '@employees/domain/exceptions/employee.exception';
import { ERROR_MESSAGES } from '@shared/domain/constants/error-messages.constants';
import type { IEmployeeRepository } from '@employees/domain/ports/employee.repository.port';

// Helper para asignar id a empleados en tests
function assignEmployeeId(
  employee: Employee,
  id: number,
): Employee & { id: number } {
  return Object.assign(employee, { id });
}

describe('UpdateEmployeeUseCase', () => {
  let useCase: UpdateEmployeeUseCase;
  let employeeRepository: jest.Mocked<IEmployeeRepository>;

  beforeEach(async () => {
    const mockEmployeeRepository = {
      findById: jest.fn(),
      findByDocumentNumber: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
      exists: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateEmployeeUseCase,
        {
          provide: DEPENDENCY_INJECTION_TOKENS.EMPLOYEE_REPOSITORY,
          useValue: mockEmployeeRepository,
        },
      ],
    }).compile();

    useCase = module.get<UpdateEmployeeUseCase>(UpdateEmployeeUseCase);
    employeeRepository = module.get(
      DEPENDENCY_INJECTION_TOKENS.EMPLOYEE_REPOSITORY,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const existingEmployee = assignEmployeeId(
      Employee.create('Juan', 'Pérez', '12345678', 'juan.perez@example.com'),
      1,
    );

    it('debe actualizar un empleado exitosamente', async () => {
      const updateDto: UpdateEmployeeDto = {
        firstName: 'Juan Carlos',
        lastName: 'Pérez García',
      };

      const updatedEmployee = new Employee(
        existingEmployee.id,
        updateDto.firstName!,
        updateDto.lastName!,
        existingEmployee.documentNumber,
        existingEmployee.email,
      );
      const savedEmployee = assignEmployeeId(updatedEmployee, 1);

      employeeRepository.findById.mockResolvedValue(existingEmployee);
      employeeRepository.save.mockResolvedValue(savedEmployee);

      const result = await useCase.execute(1, updateDto);

      expect(employeeRepository.findById).toHaveBeenCalledWith(1);
      expect(employeeRepository.save).toHaveBeenCalled();
      expect(result.firstName).toBe('Juan Carlos');
      expect(result.lastName).toBe('Pérez García');
      expect(result.documentNumber).toBe('12345678');
    });

    it('debe actualizar solo los campos proporcionados', async () => {
      const updateDto: UpdateEmployeeDto = {
        firstName: 'Juan Carlos',
      };

      const updatedEmployee = new Employee(
        existingEmployee.id,
        updateDto.firstName!,
        existingEmployee.lastName,
        existingEmployee.documentNumber,
        existingEmployee.email,
      );
      const savedEmployee = assignEmployeeId(updatedEmployee, 1);

      employeeRepository.findById.mockResolvedValue(existingEmployee);
      employeeRepository.save.mockResolvedValue(savedEmployee);

      const result = await useCase.execute(1, updateDto);

      expect(result.firstName).toBe('Juan Carlos');
      expect(result.lastName).toBe('Pérez');
      expect(result.documentNumber).toBe('12345678');
    });

    it('debe lanzar NotFoundException si el empleado no existe', async () => {
      const updateDto: UpdateEmployeeDto = {
        firstName: 'Juan Carlos',
      };

      employeeRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(999, updateDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(useCase.execute(999, updateDto)).rejects.toThrow(
        ERROR_MESSAGES.EMPLOYEE_NOT_FOUND(999),
      );

      expect(employeeRepository.save).not.toHaveBeenCalled();
    });

    it('debe lanzar DuplicateDocumentNumberException si el documento ya existe en otro empleado', async () => {
      const updateDto: UpdateEmployeeDto = {
        documentNumber: '87654321',
      };

      const otherEmployee = assignEmployeeId(
        Employee.create('Otro', 'Empleado', '87654321', 'otro@example.com'),
        2,
      );

      employeeRepository.findById.mockResolvedValue(existingEmployee);
      employeeRepository.findByDocumentNumber.mockResolvedValue(otherEmployee);

      await expect(useCase.execute(1, updateDto)).rejects.toThrow(
        DuplicateDocumentNumberException,
      );

      expect(employeeRepository.save).not.toHaveBeenCalled();
    });

    it('debe permitir actualizar el documento si es el mismo empleado', async () => {
      const updateDto: UpdateEmployeeDto = {
        documentNumber: '12345678', // Mismo documento
        firstName: 'Juan Carlos',
      };

      const updatedEmployee = new Employee(
        existingEmployee.id,
        updateDto.firstName!,
        existingEmployee.lastName,
        updateDto.documentNumber!,
        existingEmployee.email,
      );
      const savedEmployee = assignEmployeeId(updatedEmployee, 1);

      employeeRepository.findById.mockResolvedValue(existingEmployee);
      employeeRepository.findByDocumentNumber.mockResolvedValue(
        existingEmployee,
      );
      employeeRepository.save.mockResolvedValue(savedEmployee);

      const result = await useCase.execute(1, updateDto);

      expect(result.documentNumber).toBe('12345678');
      expect(employeeRepository.save).toHaveBeenCalled();
    });

    it('debe actualizar el email correctamente', async () => {
      const updateDto: UpdateEmployeeDto = {
        email: 'nuevo.email@example.com',
      };

      const updatedEmployee = new Employee(
        existingEmployee.id,
        existingEmployee.firstName,
        existingEmployee.lastName,
        existingEmployee.documentNumber,
        updateDto.email,
      );
      const savedEmployee = assignEmployeeId(updatedEmployee, 1);

      employeeRepository.findById.mockResolvedValue(existingEmployee);
      employeeRepository.save.mockResolvedValue(savedEmployee);

      const result = await useCase.execute(1, updateDto);

      expect(result.email).toBe('nuevo.email@example.com');
    });

    it('debe actualizar todos los campos si se proporcionan', async () => {
      const updateDto: UpdateEmployeeDto = {
        firstName: 'María',
        lastName: 'García',
        documentNumber: '11223344',
        email: 'maria.garcia@example.com',
      };

      const otherEmployeeCheck = assignEmployeeId(
        Employee.create('Otro', 'Empleado', '11223344', 'otro@example.com'),
        1, // Mismo ID, así que no es duplicado
      );

      const updatedEmployee = new Employee(
        existingEmployee.id,
        updateDto.firstName!,
        updateDto.lastName!,
        updateDto.documentNumber!,
        updateDto.email,
      );
      const savedEmployee = assignEmployeeId(updatedEmployee, 1);

      employeeRepository.findById.mockResolvedValue(existingEmployee);
      employeeRepository.findByDocumentNumber.mockResolvedValue(
        otherEmployeeCheck,
      );
      employeeRepository.save.mockResolvedValue(savedEmployee);

      const result = await useCase.execute(1, updateDto);

      expect(result.firstName).toBe('María');
      expect(result.lastName).toBe('García');
      expect(result.documentNumber).toBe('11223344');
      expect(result.email).toBe('maria.garcia@example.com');
    });
  });
});
