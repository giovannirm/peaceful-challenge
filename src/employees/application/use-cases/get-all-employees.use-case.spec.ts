import { Test, TestingModule } from '@nestjs/testing';
import { GetAllEmployeesUseCase } from './get-all-employees.use-case';
import { Employee } from '@employees/domain/entities/employee.entity';
import { DEPENDENCY_INJECTION_TOKENS } from '@shared/application/config/dependency-injection.tokens';
import type { IEmployeeRepository } from '@employees/domain/ports/employee.repository.port';

describe('GetAllEmployeesUseCase', () => {
  let useCase: GetAllEmployeesUseCase;
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
        GetAllEmployeesUseCase,
        {
          provide: DEPENDENCY_INJECTION_TOKENS.EMPLOYEE_REPOSITORY,
          useValue: mockEmployeeRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetAllEmployeesUseCase>(GetAllEmployeesUseCase);
    employeeRepository = module.get(
      DEPENDENCY_INJECTION_TOKENS.EMPLOYEE_REPOSITORY,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('debe retornar una lista de empleados', async () => {
      const employees = [
        Employee.create('Juan', 'Pérez', '12345678', 'juan@example.com'),
        Employee.create('María', 'García', '87654321', 'maria@example.com'),
        Employee.create('Pedro', 'Sánchez', '11223344', null),
      ];
      employees.forEach((emp, index) => {
        (emp as any).id = index + 1;
      });

      employeeRepository.findAll.mockResolvedValue(employees);

      const result = await useCase.execute();

      expect(employeeRepository.findAll).toHaveBeenCalled();
      expect(result).toHaveLength(3);
      expect(result[0].firstName).toBe('Juan');
      expect(result[1].firstName).toBe('María');
      expect(result[2].firstName).toBe('Pedro');
    });

    it('debe retornar una lista vacía cuando no hay empleados', async () => {
      employeeRepository.findAll.mockResolvedValue([]);

      const result = await useCase.execute();

      expect(employeeRepository.findAll).toHaveBeenCalled();
      expect(result).toHaveLength(0);
      expect(Array.isArray(result)).toBe(true);
    });
  });
});

