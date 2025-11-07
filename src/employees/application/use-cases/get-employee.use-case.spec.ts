import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GetEmployeeUseCase } from './get-employee.use-case';
import { Employee } from '@employees/domain/entities/employee.entity';
import { DEPENDENCY_INJECTION_TOKENS } from '@shared/application/config/dependency-injection.tokens';
import { ERROR_MESSAGES } from '@shared/domain/constants/error-messages.constants';
import type { IEmployeeRepository } from '@employees/domain/ports/employee.repository.port';

describe('GetEmployeeUseCase', () => {
  let useCase: GetEmployeeUseCase;
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
        GetEmployeeUseCase,
        {
          provide: DEPENDENCY_INJECTION_TOKENS.EMPLOYEE_REPOSITORY,
          useValue: mockEmployeeRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetEmployeeUseCase>(GetEmployeeUseCase);
    employeeRepository = module.get(
      DEPENDENCY_INJECTION_TOKENS.EMPLOYEE_REPOSITORY,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('debe retornar un empleado cuando existe', async () => {
      const employee = Employee.create(
        'Juan',
        'Pérez',
        '12345678',
        'juan.perez@example.com',
      );
      (employee as any).id = 1;

      employeeRepository.findById.mockResolvedValue(employee);

      const result = await useCase.execute(1);

      expect(employeeRepository.findById).toHaveBeenCalledWith(1);
      expect(result).toBeInstanceOf(Employee);
      expect(result.id).toBe(1);
      expect(result.firstName).toBe('Juan');
      expect(result.lastName).toBe('Pérez');
    });

    it('debe lanzar NotFoundException cuando el empleado no existe', async () => {
      employeeRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(999)).rejects.toThrow(NotFoundException);
      await expect(useCase.execute(999)).rejects.toThrow(
        ERROR_MESSAGES.EMPLOYEE_NOT_FOUND(999),
      );
    });

    it('debe retornar empleado sin email si no tiene email configurado', async () => {
      const employee = Employee.create('María', 'García', '87654321', null);
      (employee as any).id = 2;

      employeeRepository.findById.mockResolvedValue(employee);

      const result = await useCase.execute(2);

      expect(result).toBeInstanceOf(Employee);
      expect(result.email).toBeNull();
    });
  });
});

