/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GetAttendancesByEmployeeUseCase } from './get-attendances-by-employee.use-case';
import { Attendance } from '@attendance/domain/entities/attendance.entity';
import { AttendanceType } from '@shared/domain/value-objects/attendance-type.vo';
import { DEPENDENCY_INJECTION_TOKENS } from '@shared/application/config/dependency-injection.tokens';
import { ERROR_MESSAGES } from '@shared/domain/constants/error-messages.constants';
import type { IEmployeeRepository } from '@employees/domain/ports/employee.repository.port';
import type { IAttendanceRepository } from '@attendance/domain/ports/attendance.repository.port';

describe('GetAttendancesByEmployeeUseCase', () => {
  let useCase: GetAttendancesByEmployeeUseCase;
  let employeeRepository: jest.Mocked<IEmployeeRepository>;
  let attendanceRepository: jest.Mocked<IAttendanceRepository>;

  beforeEach(async () => {
    const mockEmployeeRepository = {
      findById: jest.fn(),
      findByDocumentNumber: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
      exists: jest.fn(),
    };

    const mockAttendanceRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByEmployeeId: jest.fn(),
      findLastByEmployeeIdAndType: jest.fn(),
      findByEmployeeIdAndDateRange: jest.fn(),
      findByEmployeeIdAndDate: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetAttendancesByEmployeeUseCase,
        {
          provide: DEPENDENCY_INJECTION_TOKENS.EMPLOYEE_REPOSITORY,
          useValue: mockEmployeeRepository,
        },
        {
          provide: DEPENDENCY_INJECTION_TOKENS.ATTENDANCE_REPOSITORY,
          useValue: mockAttendanceRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetAttendancesByEmployeeUseCase>(
      GetAttendancesByEmployeeUseCase,
    );
    employeeRepository = module.get(
      DEPENDENCY_INJECTION_TOKENS.EMPLOYEE_REPOSITORY,
    );
    attendanceRepository = module.get(
      DEPENDENCY_INJECTION_TOKENS.ATTENDANCE_REPOSITORY,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('debe retornar una lista de asistencias cuando el empleado existe', async () => {
      const employeeId = 1;
      const attendances = [
        Attendance.create(
          employeeId,
          AttendanceType.CHECK_IN,
          -12.0464,
          -77.0428,
          new Date('2025-11-07T09:00:00Z'),
        ),
        Attendance.create(
          employeeId,
          AttendanceType.CHECK_OUT,
          -12.0464,
          -77.0428,
          new Date('2025-11-07T18:00:00Z'),
        ),
      ];

      employeeRepository.exists.mockResolvedValue(true);
      attendanceRepository.findByEmployeeId.mockResolvedValue(attendances);

      const result = await useCase.execute(employeeId);

      expect(employeeRepository.exists).toHaveBeenCalledWith(employeeId);
      expect(attendanceRepository.findByEmployeeId).toHaveBeenCalledWith(
        employeeId,
      );
      expect(result).toEqual(attendances);
      expect(result.length).toBe(2);
    });

    it('debe retornar una lista vacía si el empleado no tiene asistencias', async () => {
      const employeeId = 1;

      employeeRepository.exists.mockResolvedValue(true);
      attendanceRepository.findByEmployeeId.mockResolvedValue([]);

      const result = await useCase.execute(employeeId);

      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });

    it('debe lanzar NotFoundException si el empleado no existe', async () => {
      const employeeId = 999;

      employeeRepository.exists.mockResolvedValue(false);

      await expect(useCase.execute(employeeId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(useCase.execute(employeeId)).rejects.toThrow(
        ERROR_MESSAGES.EMPLOYEE_NOT_FOUND(employeeId),
      );

      expect(attendanceRepository.findByEmployeeId).not.toHaveBeenCalled();
    });

    it('debe retornar múltiples asistencias de diferentes días', async () => {
      const employeeId = 1;
      const attendances = [
        Attendance.create(
          employeeId,
          AttendanceType.CHECK_IN,
          -12.0464,
          -77.0428,
          new Date('2025-11-07T09:00:00Z'),
        ),
        Attendance.create(
          employeeId,
          AttendanceType.CHECK_OUT,
          -12.0464,
          -77.0428,
          new Date('2025-11-07T18:00:00Z'),
        ),
        Attendance.create(
          employeeId,
          AttendanceType.CHECK_IN,
          -12.0464,
          -77.0428,
          new Date('2025-11-08T09:00:00Z'),
        ),
        Attendance.create(
          employeeId,
          AttendanceType.CHECK_OUT,
          -12.0464,
          -77.0428,
          new Date('2025-11-08T18:00:00Z'),
        ),
      ];

      employeeRepository.exists.mockResolvedValue(true);
      attendanceRepository.findByEmployeeId.mockResolvedValue(attendances);

      const result = await useCase.execute(employeeId);

      expect(result.length).toBe(4);
      expect(result[0].type).toBe(AttendanceType.CHECK_IN);
      expect(result[1].type).toBe(AttendanceType.CHECK_OUT);
    });
  });
});
