import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { GenerateAttendanceReportUseCase } from './generate-attendance-report.use-case';
import { Employee } from '@employees/domain/entities/employee.entity';
import { Attendance } from '@attendance/domain/entities/attendance.entity';
import { AttendanceType } from '@shared/domain/value-objects/attendance-type.vo';
import { DEPENDENCY_INJECTION_TOKENS } from '@shared/application/config/dependency-injection.tokens';
import { ERROR_MESSAGES } from '@shared/domain/constants/error-messages.constants';
import type { IEmployeeRepository } from '@employees/domain/ports/employee.repository.port';
import type { IAttendanceRepository } from '@attendance/domain/ports/attendance.repository.port';
import type { IAttendanceValidator } from '@attendance/domain/ports/attendance-validator.port';

describe('GenerateAttendanceReportUseCase', () => {
  let useCase: GenerateAttendanceReportUseCase;
  let employeeRepository: jest.Mocked<IEmployeeRepository>;
  let attendanceRepository: jest.Mocked<IAttendanceRepository>;
  let attendanceValidator: jest.Mocked<IAttendanceValidator>;

  const mockEmployee: Employee = Employee.create(
    'Juan',
    'Pérez',
    '12345678',
    'juan.perez@example.com',
  );
  (mockEmployee as any).id = 1;

  beforeEach(async () => {
    const mockEmployeeRepository = {
      findById: jest.fn(),
      findByDocumentNumber: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
    };

    const mockAttendanceRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByEmployeeId: jest.fn(),
      findLastByEmployeeIdAndType: jest.fn(),
      findByEmployeeIdAndDateRange: jest.fn(),
      findByEmployeeIdAndDate: jest.fn(),
    };

    const mockAttendanceValidator = {
      isLateCheckIn: jest.fn(),
      calculateLateMinutes: jest.fn(),
      getStartOfDay: jest.fn((date: Date) => {
        const start = new Date(date);
        start.setHours(0, 0, 0, 0);
        return start;
      }),
      getEndOfDay: jest.fn((date: Date) => {
        const end = new Date(date);
        end.setHours(23, 59, 59, 999);
        return end;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GenerateAttendanceReportUseCase,
        {
          provide: DEPENDENCY_INJECTION_TOKENS.EMPLOYEE_REPOSITORY,
          useValue: mockEmployeeRepository,
        },
        {
          provide: DEPENDENCY_INJECTION_TOKENS.ATTENDANCE_REPOSITORY,
          useValue: mockAttendanceRepository,
        },
        {
          provide: DEPENDENCY_INJECTION_TOKENS.ATTENDANCE_VALIDATOR,
          useValue: mockAttendanceValidator,
        },
      ],
    }).compile();

    useCase = module.get<GenerateAttendanceReportUseCase>(
      GenerateAttendanceReportUseCase,
    );
    employeeRepository = module.get(
      DEPENDENCY_INJECTION_TOKENS.EMPLOYEE_REPOSITORY,
    );
    attendanceRepository = module.get(
      DEPENDENCY_INJECTION_TOKENS.ATTENDANCE_REPOSITORY,
    );
    attendanceValidator = module.get(
      DEPENDENCY_INJECTION_TOKENS.ATTENDANCE_VALIDATOR,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const startDate = new Date('2025-11-01T00:00:00Z');
    const endDate = new Date('2025-11-07T23:59:59Z');

    it('debe generar un reporte exitosamente con asistencias', async () => {
      const checkIn = Attendance.create(
        1,
        AttendanceType.CHECK_IN,
        -12.0464,
        -77.0428,
        new Date('2025-11-05T09:00:00Z'),
      );
      const checkOut = Attendance.create(
        1,
        AttendanceType.CHECK_OUT,
        -12.0464,
        -77.0428,
        new Date('2025-11-05T18:00:00Z'),
      );

      employeeRepository.findById.mockResolvedValue(mockEmployee);
      attendanceRepository.findByEmployeeIdAndDateRange.mockResolvedValue([
        checkIn,
        checkOut,
      ]);
      attendanceValidator.isLateCheckIn.mockReturnValue(false);

      const result = await useCase.execute(1, startDate, endDate);

      expect(employeeRepository.findById).toHaveBeenCalledWith(1);
      expect(
        attendanceRepository.findByEmployeeIdAndDateRange,
      ).toHaveBeenCalledWith(1, startDate, endDate);
      expect(result.employeeId).toBe(1);
      expect(result.startDate).toBe('2025-11-01');
      expect(result.endDate).toBe('2025-11-07');
      expect(result.attendances).toBeDefined();
      expect(Array.isArray(result.attendances)).toBe(true);
    });

    it('debe lanzar NotFoundException si el empleado no existe', async () => {
      employeeRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(999, startDate, endDate)).rejects.toThrow(
        NotFoundException,
      );
      await expect(useCase.execute(999, startDate, endDate)).rejects.toThrow(
        ERROR_MESSAGES.EMPLOYEE_NOT_FOUND(999),
      );
    });

    it('debe lanzar BadRequestException si startDate es mayor que endDate', async () => {
      const invalidStartDate = new Date('2025-11-07T00:00:00Z');
      const invalidEndDate = new Date('2025-11-01T23:59:59Z');

      employeeRepository.findById.mockResolvedValue(mockEmployee);

      await expect(
        useCase.execute(1, invalidStartDate, invalidEndDate),
      ).rejects.toThrow(BadRequestException);
      await expect(
        useCase.execute(1, invalidStartDate, invalidEndDate),
      ).rejects.toThrow(ERROR_MESSAGES.INVALID_DATE_RANGE);
    });

    it('debe detectar tardanzas en el reporte', async () => {
      const lateCheckIn = Attendance.create(
        1,
        AttendanceType.CHECK_IN,
        -12.0464,
        -77.0428,
        new Date('2025-11-05T10:30:00Z'), // 1.5 horas tarde
      );

      employeeRepository.findById.mockResolvedValue(mockEmployee);
      attendanceRepository.findByEmployeeIdAndDateRange.mockResolvedValue([
        lateCheckIn,
      ]);
      attendanceValidator.isLateCheckIn.mockReturnValue(true);
      attendanceValidator.calculateLateMinutes.mockReturnValue(30);

      const result = await useCase.execute(1, startDate, endDate);

      expect(attendanceValidator.isLateCheckIn).toHaveBeenCalled();
      expect(attendanceValidator.calculateLateMinutes).toHaveBeenCalled();
      expect(result.attendances).toBeDefined();
      expect(Array.isArray(result.attendances)).toBe(true);
    });

    it('debe generar reporte vacío cuando no hay asistencias', async () => {
      employeeRepository.findById.mockResolvedValue(mockEmployee);
      attendanceRepository.findByEmployeeIdAndDateRange.mockResolvedValue([]);

      const result = await useCase.execute(1, startDate, endDate);

      expect(result.employeeId).toBe(1);
      expect(result.attendances).toBeDefined();
      expect(Array.isArray(result.attendances)).toBe(true);
    });
  });
});

