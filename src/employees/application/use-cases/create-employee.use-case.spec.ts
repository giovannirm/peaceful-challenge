import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { CreateEmployeeUseCase } from './create-employee.use-case';
import { Employee } from '@employees/domain/entities/employee.entity';
import { DEPENDENCY_INJECTION_TOKENS } from '@shared/application/config/dependency-injection.tokens';
import { DuplicateDocumentNumberException } from '@employees/domain/exceptions/employee.exception';
import type { IEmployeeRepository } from '@employees/domain/ports/employee.repository.port';

describe('CreateEmployeeUseCase', () => {
  let useCase: CreateEmployeeUseCase;
  let employeeRepository: jest.Mocked<IEmployeeRepository>;

  beforeEach(async () => {
    const mockEmployeeRepository = {
      findById: jest.fn(),
      findByDocumentNumber: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateEmployeeUseCase,
        {
          provide: DEPENDENCY_INJECTION_TOKENS.EMPLOYEE_REPOSITORY,
          useValue: mockEmployeeRepository,
        },
      ],
    }).compile();

    useCase = module.get<CreateEmployeeUseCase>(CreateEmployeeUseCase);
    employeeRepository = module.get(
      DEPENDENCY_INJECTION_TOKENS.EMPLOYEE_REPOSITORY,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const createEmployeeDto = {
      firstName: 'Juan',
      lastName: 'Pérez',
      documentNumber: '12345678',
      email: 'juan.perez@example.com',
    };

    it('debe crear un empleado exitosamente', async () => {
      const savedEmployee = Employee.create(
        createEmployeeDto.firstName,
        createEmployeeDto.lastName,
        createEmployeeDto.documentNumber,
        createEmployeeDto.email,
      );
      (savedEmployee as any).id = 1;

      employeeRepository.findByDocumentNumber.mockResolvedValue(null);
      employeeRepository.save.mockResolvedValue(savedEmployee);

      const result = await useCase.execute(createEmployeeDto);

      expect(employeeRepository.findByDocumentNumber).toHaveBeenCalledWith(
        '12345678',
      );
      expect(employeeRepository.save).toHaveBeenCalled();
      expect(result).toBeInstanceOf(Employee);
      expect(result.firstName).toBe('Juan');
      expect(result.lastName).toBe('Pérez');
      expect(result.documentNumber).toBe('12345678');
    });

    it('debe crear un empleado sin email si no se proporciona', async () => {
      const createEmployeeDtoWithoutEmail = {
        firstName: 'María',
        lastName: 'García',
        documentNumber: '87654321',
      };

      const savedEmployee = Employee.create(
        createEmployeeDtoWithoutEmail.firstName,
        createEmployeeDtoWithoutEmail.lastName,
        createEmployeeDtoWithoutEmail.documentNumber,
        null,
      );
      (savedEmployee as any).id = 2;

      employeeRepository.findByDocumentNumber.mockResolvedValue(null);
      employeeRepository.save.mockResolvedValue(savedEmployee);

      const result = await useCase.execute(createEmployeeDtoWithoutEmail as any);

      expect(result).toBeInstanceOf(Employee);
      expect(result.email).toBeNull();
    });

    it('debe lanzar ConflictException si el número de documento ya existe', async () => {
      const existingEmployee = Employee.create(
        'Pedro',
        'Sánchez',
        '12345678',
        'pedro@example.com',
      );
      (existingEmployee as any).id = 1;

      employeeRepository.findByDocumentNumber.mockResolvedValue(
        existingEmployee,
      );

      await expect(useCase.execute(createEmployeeDto)).rejects.toThrow(
        ConflictException,
      );

      expect(employeeRepository.save).not.toHaveBeenCalled();
    });

    it('debe validar que el número de documento sea único', async () => {
      const existingEmployee = Employee.create(
        'Otro',
        'Empleado',
        '12345678',
        'otro@example.com',
      );
      (existingEmployee as any).id = 5;

      employeeRepository.findByDocumentNumber.mockResolvedValue(
        existingEmployee,
      );

      await expect(useCase.execute(createEmployeeDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });
});

