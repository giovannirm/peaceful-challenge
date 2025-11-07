import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CheckInUseCase } from './check-in.use-case';
import { Attendance } from '@attendance/domain/entities/attendance.entity';
import { AttendanceType } from '@shared/domain/value-objects/attendance-type.vo';
import { Employee } from '@employees/domain/entities/employee.entity';
import { DEPENDENCY_INJECTION_TOKENS } from '@shared/application/config/dependency-injection.tokens';
import { ERROR_MESSAGES } from '@shared/domain/constants/error-messages.constants';
import { DuplicateCheckInException } from '@attendance/domain/exceptions/attendance.exception';
import type { IEmployeeRepository } from '@employees/domain/ports/employee.repository.port';
import type { IAttendanceRepository } from '@attendance/domain/ports/attendance.repository.port';
import type { INotificationQueue } from '@attendance/domain/ports/notification.queue.port';
import type { IAttendanceValidator } from '@attendance/domain/ports/attendance-validator.port';

describe('CheckInUseCase', () => {
  let useCase: CheckInUseCase;
  let employeeRepository: jest.Mocked<IEmployeeRepository>;
  let attendanceRepository: jest.Mocked<IAttendanceRepository>;
  let notificationQueue: jest.Mocked<INotificationQueue>;
  let attendanceValidator: jest.Mocked<IAttendanceValidator>;

  const mockEmployee: Employee = Employee.create(
    'Juan',
    'Pérez',
    '12345678',
    'juan.perez@example.com',
  );
  // Asignar un ID al empleado mock
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

    const mockNotificationQueue = {
      sendLateCheckInNotification: jest.fn(),
    };

    const mockAttendanceValidator = {
      isLateCheckIn: jest.fn(),
      calculateLateMinutes: jest.fn(),
      getStartOfDay: jest.fn(),
      getEndOfDay: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CheckInUseCase,
        {
          provide: DEPENDENCY_INJECTION_TOKENS.EMPLOYEE_REPOSITORY,
          useValue: mockEmployeeRepository,
        },
        {
          provide: DEPENDENCY_INJECTION_TOKENS.ATTENDANCE_REPOSITORY,
          useValue: mockAttendanceRepository,
        },
        {
          provide: DEPENDENCY_INJECTION_TOKENS.NOTIFICATION_QUEUE,
          useValue: mockNotificationQueue,
        },
        {
          provide: DEPENDENCY_INJECTION_TOKENS.ATTENDANCE_VALIDATOR,
          useValue: mockAttendanceValidator,
        },
      ],
    }).compile();

    useCase = module.get<CheckInUseCase>(CheckInUseCase);
    employeeRepository = module.get(
      DEPENDENCY_INJECTION_TOKENS.EMPLOYEE_REPOSITORY,
    );
    attendanceRepository = module.get(
      DEPENDENCY_INJECTION_TOKENS.ATTENDANCE_REPOSITORY,
    );
    notificationQueue = module.get(
      DEPENDENCY_INJECTION_TOKENS.NOTIFICATION_QUEUE,
    );
    attendanceValidator = module.get(
      DEPENDENCY_INJECTION_TOKENS.ATTENDANCE_VALIDATOR,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const checkInDto = {
      employeeId: 1,
      recordTime: '2025-11-07T09:00:00Z',
      latitude: -12.0464,
      longitude: -77.0428,
    };

    it('debe registrar un check-in exitosamente', async () => {
      const recordTime = new Date(checkInDto.recordTime);
      const savedAttendance = Attendance.create(
        checkInDto.employeeId,
        AttendanceType.CHECK_IN,
        checkInDto.latitude,
        checkInDto.longitude,
        recordTime,
      );

      employeeRepository.findById.mockResolvedValue(mockEmployee);
      attendanceRepository.findLastByEmployeeIdAndType.mockResolvedValue(null);
      attendanceRepository.save.mockResolvedValue(savedAttendance);
      attendanceValidator.isLateCheckIn.mockReturnValue(false);

      const result = await useCase.execute(checkInDto);

      expect(employeeRepository.findById).toHaveBeenCalledWith(1);
      expect(
        attendanceRepository.findLastByEmployeeIdAndType,
      ).toHaveBeenCalledWith(1, AttendanceType.CHECK_IN, recordTime);
      expect(attendanceRepository.save).toHaveBeenCalled();
      expect(result).toBeInstanceOf(Attendance);
      expect(result.type).toBe(AttendanceType.CHECK_IN);
    });

    it('debe lanzar NotFoundException si el empleado no existe', async () => {
      employeeRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(checkInDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(useCase.execute(checkInDto)).rejects.toThrow(
        ERROR_MESSAGES.EMPLOYEE_NOT_FOUND(1),
      );

      expect(attendanceRepository.save).not.toHaveBeenCalled();
    });

    it('debe lanzar BadRequestException si ya existe un check-in el mismo día', async () => {
      const recordTime = new Date(checkInDto.recordTime);
      const existingCheckIn = Attendance.create(
        1,
        AttendanceType.CHECK_IN,
        -12.0464,
        -77.0428,
        recordTime,
      );

      employeeRepository.findById.mockResolvedValue(mockEmployee);
      attendanceRepository.findLastByEmployeeIdAndType.mockResolvedValue(
        existingCheckIn,
      );

      await expect(useCase.execute(checkInDto)).rejects.toThrow(
        BadRequestException,
      );

      expect(attendanceRepository.save).not.toHaveBeenCalled();
    });

    it('debe enviar notificación si el check-in es tardío y el empleado tiene email', async () => {
      const recordTime = new Date('2025-11-07T10:30:00Z');
      const lateCheckInDto = {
        ...checkInDto,
        recordTime: recordTime.toISOString(),
      };
      const savedAttendance = Attendance.create(
        checkInDto.employeeId,
        AttendanceType.CHECK_IN,
        checkInDto.latitude,
        checkInDto.longitude,
        recordTime,
      );

      employeeRepository.findById.mockResolvedValue(mockEmployee);
      attendanceRepository.findLastByEmployeeIdAndType.mockResolvedValue(null);
      attendanceRepository.save.mockResolvedValue(savedAttendance);
      attendanceValidator.isLateCheckIn.mockReturnValue(true);
      attendanceValidator.calculateLateMinutes.mockReturnValue(30);

      await useCase.execute(lateCheckInDto);

      expect(attendanceValidator.isLateCheckIn).toHaveBeenCalledWith(recordTime);
      expect(attendanceValidator.calculateLateMinutes).toHaveBeenCalledWith(
        recordTime,
      );
      expect(notificationQueue.sendLateCheckInNotification).toHaveBeenCalledWith(
        1,
        'juan.perez@example.com',
        'Juan Pérez',
        recordTime,
        30,
      );
    });

    it('no debe enviar notificación si el check-in no es tardío', async () => {
      const recordTime = new Date('2025-11-07T09:00:00Z');
      const savedAttendance = Attendance.create(
        checkInDto.employeeId,
        AttendanceType.CHECK_IN,
        checkInDto.latitude,
        checkInDto.longitude,
        recordTime,
      );

      employeeRepository.findById.mockResolvedValue(mockEmployee);
      attendanceRepository.findLastByEmployeeIdAndType.mockResolvedValue(null);
      attendanceRepository.save.mockResolvedValue(savedAttendance);
      attendanceValidator.isLateCheckIn.mockReturnValue(false);

      await useCase.execute(checkInDto);

      expect(notificationQueue.sendLateCheckInNotification).not.toHaveBeenCalled();
    });

    it('no debe enviar notificación si el empleado no tiene email', async () => {
      const employeeWithoutEmail = Employee.create(
        'María',
        'García',
        '87654321',
        null,
      );
      (employeeWithoutEmail as any).id = 2;

      const recordTime = new Date('2025-11-07T10:30:00Z');
      const lateCheckInDto = {
        employeeId: 2,
        recordTime: recordTime.toISOString(),
        latitude: -12.0464,
        longitude: -77.0428,
      };
      const savedAttendance = Attendance.create(
        2,
        AttendanceType.CHECK_IN,
        lateCheckInDto.latitude,
        lateCheckInDto.longitude,
        recordTime,
      );

      employeeRepository.findById.mockResolvedValue(employeeWithoutEmail);
      attendanceRepository.findLastByEmployeeIdAndType.mockResolvedValue(null);
      attendanceRepository.save.mockResolvedValue(savedAttendance);
      attendanceValidator.isLateCheckIn.mockReturnValue(true);
      attendanceValidator.calculateLateMinutes.mockReturnValue(30);

      await useCase.execute(lateCheckInDto);

      expect(notificationQueue.sendLateCheckInNotification).not.toHaveBeenCalled();
    });

    it('no debe fallar el caso de uso si falla el envío de notificación', async () => {
      const recordTime = new Date('2025-11-07T10:30:00Z');
      const lateCheckInDto = {
        ...checkInDto,
        recordTime: recordTime.toISOString(),
      };
      const savedAttendance = Attendance.create(
        checkInDto.employeeId,
        AttendanceType.CHECK_IN,
        checkInDto.latitude,
        checkInDto.longitude,
        recordTime,
      );

      employeeRepository.findById.mockResolvedValue(mockEmployee);
      attendanceRepository.findLastByEmployeeIdAndType.mockResolvedValue(null);
      attendanceRepository.save.mockResolvedValue(savedAttendance);
      attendanceValidator.isLateCheckIn.mockReturnValue(true);
      attendanceValidator.calculateLateMinutes.mockReturnValue(30);
      notificationQueue.sendLateCheckInNotification.mockRejectedValue(
        new Error('Queue error'),
      );

      const result = await useCase.execute(lateCheckInDto);

      expect(result).toBeInstanceOf(Attendance);
      expect(attendanceRepository.save).toHaveBeenCalled();
    });
  });
});

