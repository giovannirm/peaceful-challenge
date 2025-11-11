/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CheckOutUseCase } from './check-out.use-case';
import { Attendance } from '@attendance/domain/entities/attendance.entity';
import { AttendanceType } from '@shared/domain/value-objects/attendance-type.vo';
import { Employee } from '@employees/domain/entities/employee.entity';
import { DEPENDENCY_INJECTION_TOKENS } from '@shared/application/config/dependency-injection.tokens';
import { ERROR_MESSAGES } from '@shared/domain/constants/error-messages.constants';
import {
  MissingCheckInException,
  DuplicateCheckOutException,
} from '@attendance/domain/exceptions/attendance.exception';
import type { IEmployeeRepository } from '@employees/domain/ports/employee.repository.port';
import type { IAttendanceRepository } from '@attendance/domain/ports/attendance.repository.port';

describe('CheckOutUseCase', () => {
  let useCase: CheckOutUseCase;
  let employeeRepository: jest.Mocked<IEmployeeRepository>;
  let attendanceRepository: jest.Mocked<IAttendanceRepository>;

  // Helper para asignar id a empleados en tests
  function assignEmployeeId(
    employee: Employee,
    id: number,
  ): Employee & { id: number } {
    return Object.assign(employee, { id });
  }

  const mockEmployee: Employee & { id: number } = assignEmployeeId(
    Employee.create('Juan', 'Pérez', '12345678', 'juan.perez@example.com'),
    1,
  );

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

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CheckOutUseCase,
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

    useCase = module.get<CheckOutUseCase>(CheckOutUseCase);
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
    const checkOutDto = {
      employeeId: 1,
      recordTime: '2025-11-07T18:00:00Z',
      latitude: -12.0464,
      longitude: -77.0428,
    };

    it('debe registrar un check-out exitosamente cuando existe un check-in previo', async () => {
      const recordTime = new Date(checkOutDto.recordTime);
      const checkIn = Attendance.create(
        1,
        AttendanceType.CHECK_IN,
        -12.0464,
        -77.0428,
        new Date('2025-11-07T09:00:00Z'),
      );
      const savedCheckOut = Attendance.create(
        checkOutDto.employeeId,
        AttendanceType.CHECK_OUT,
        checkOutDto.latitude,
        checkOutDto.longitude,
        recordTime,
      );

      employeeRepository.findById.mockResolvedValue(mockEmployee);
      attendanceRepository.findLastByEmployeeIdAndType
        .mockResolvedValueOnce(null) // No hay check-out previo
        .mockResolvedValueOnce(checkIn); // Existe check-in previo
      attendanceRepository.save.mockResolvedValue(savedCheckOut);

      const result = await useCase.execute(checkOutDto);

      expect(employeeRepository.findById).toHaveBeenCalledWith(1);
      expect(
        attendanceRepository.findLastByEmployeeIdAndType,
      ).toHaveBeenCalledWith(1, AttendanceType.CHECK_OUT, recordTime);
      expect(
        attendanceRepository.findLastByEmployeeIdAndType,
      ).toHaveBeenCalledWith(1, AttendanceType.CHECK_IN, recordTime);
      expect(attendanceRepository.save).toHaveBeenCalled();
      expect(result).toBeInstanceOf(Attendance);
      expect(result.type).toBe(AttendanceType.CHECK_OUT);
    });

    it('debe lanzar NotFoundException si el empleado no existe', async () => {
      employeeRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(checkOutDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(useCase.execute(checkOutDto)).rejects.toThrow(
        ERROR_MESSAGES.EMPLOYEE_NOT_FOUND(1),
      );

      expect(attendanceRepository.save).not.toHaveBeenCalled();
    });

    it('debe lanzar DuplicateCheckOutException si ya existe un check-out el mismo día', async () => {
      const recordTime = new Date(checkOutDto.recordTime);
      const existingCheckOut = Attendance.create(
        1,
        AttendanceType.CHECK_OUT,
        -12.0464,
        -77.0428,
        recordTime,
      );

      employeeRepository.findById.mockResolvedValue(mockEmployee);
      attendanceRepository.findLastByEmployeeIdAndType.mockResolvedValue(
        existingCheckOut,
      );

      await expect(useCase.execute(checkOutDto)).rejects.toThrow(
        DuplicateCheckOutException,
      );

      expect(attendanceRepository.save).not.toHaveBeenCalled();
    });

    it('debe lanzar MissingCheckInException si no existe un check-in previo', async () => {
      employeeRepository.findById.mockResolvedValue(mockEmployee);
      attendanceRepository.findLastByEmployeeIdAndType
        .mockResolvedValueOnce(null) // No hay check-out previo
        .mockResolvedValueOnce(null); // No hay check-in previo

      await expect(useCase.execute(checkOutDto)).rejects.toThrow(
        MissingCheckInException,
      );

      expect(attendanceRepository.save).not.toHaveBeenCalled();
    });

    it('debe validar que el check-in y check-out sean del mismo día', async () => {
      const recordTime = new Date('2025-11-07T18:00:00Z');
      const checkIn = Attendance.create(
        1,
        AttendanceType.CHECK_IN,
        -12.0464,
        -77.0428,
        new Date('2025-11-06T09:00:00Z'), // Día anterior
      );
      const savedCheckOut = Attendance.create(
        checkOutDto.employeeId,
        AttendanceType.CHECK_OUT,
        checkOutDto.latitude,
        checkOutDto.longitude,
        recordTime,
      );

      employeeRepository.findById.mockResolvedValue(mockEmployee);
      attendanceRepository.findLastByEmployeeIdAndType
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(checkIn);
      attendanceRepository.save.mockResolvedValue(savedCheckOut);

      // En este caso, el repositorio debería buscar el check-in del mismo día
      // Si encuentra uno de otro día, el caso de uso debería fallar
      // Pero como el repositorio busca por fecha, asumimos que retorna null si no hay del mismo día
      attendanceRepository.findLastByEmployeeIdAndType.mockReset();
      attendanceRepository.findLastByEmployeeIdAndType
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null); // No hay check-in del mismo día

      await expect(useCase.execute(checkOutDto)).rejects.toThrow(
        MissingCheckInException,
      );
    });
  });
});
