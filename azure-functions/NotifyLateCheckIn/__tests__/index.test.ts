import { Context } from '@azure/functions';
import serviceBusQueueTrigger from '../index';
import { EmailService } from '../../shared/services/email.service';
import { ERROR_MESSAGES } from '../../shared/constants/error-messages.constants';

// Mock del EmailService
jest.mock('../../shared/services/email.service');

describe('NotifyLateCheckIn Function', () => {
  let mockContext: Context;
  let mockEmailService: jest.Mocked<EmailService>;

  beforeEach(() => {
    // Crear mock del contexto de Azure Functions
    const mockLog = jest.fn();
    mockContext = {
      log: Object.assign(mockLog, {
        error: jest.fn(),
        warn: jest.fn(),
        info: jest.fn(),
        verbose: jest.fn(),
        trace: jest.fn(),
      }),
      invocationId: 'test-invocation-id',
      executionContext: {
        invocationId: 'test-invocation-id',
        functionName: 'NotifyLateCheckIn',
        functionDirectory: '/test',
      },
      bindings: {},
      bindingData: {},
      bindingDefinitions: [],
    } as unknown as Context;

    // Mock del EmailService
    mockEmailService = {
      sendEmail: jest.fn().mockResolvedValue(undefined),
      verifyConnection: jest.fn().mockResolvedValue(true),
    } as unknown as jest.Mocked<EmailService>;

    (EmailService as jest.MockedClass<typeof EmailService>).mockImplementation(
      () => mockEmailService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Validación de mensajes', () => {
    it('debe procesar correctamente un mensaje válido', async () => {
      const validMessage = {
        employeeId: 1,
        employeeEmail: 'test@example.com',
        employeeName: 'Juan Pérez',
        checkInTime: '2025-11-07T10:30:00Z',
        lateMinutes: 30,
      };

      await serviceBusQueueTrigger(mockContext, validMessage);

      expect(mockContext.log).toHaveBeenCalledWith(
        'Procesando notificación de tardanza para empleado 1',
      );
      expect(mockEmailService.sendEmail).toHaveBeenCalledTimes(1);
      expect(mockEmailService.sendEmail).toHaveBeenCalledWith(
        'test@example.com',
        expect.stringContaining('Notificación de Tardanza - Juan Pérez'),
        expect.stringContaining('Juan Pérez'),
        expect.stringContaining('30 minutos'),
      );
      expect(mockContext.log).toHaveBeenCalledWith(
        'Correo enviado exitosamente a test@example.com',
      );
      expect(mockContext.log).toHaveBeenCalledWith(
        'Notificación de tardanza procesada exitosamente para empleado 1',
      );
    });

    it('debe lanzar error si falta employeeId', async () => {
      const invalidMessage = {
        employeeEmail: 'test@example.com',
        employeeName: 'Juan Pérez',
        checkInTime: '2025-11-07T10:30:00Z',
        lateMinutes: 30,
      };

      await expect(
        serviceBusQueueTrigger(mockContext, invalidMessage as any),
      ).rejects.toThrow(ERROR_MESSAGES.INVALID_MESSAGE);

      expect(mockEmailService.sendEmail).not.toHaveBeenCalled();
      expect(mockContext.log.error).toHaveBeenCalled();
    });

    it('debe lanzar error si falta employeeEmail', async () => {
      const invalidMessage = {
        employeeId: 1,
        employeeName: 'Juan Pérez',
        checkInTime: '2025-11-07T10:30:00Z',
        lateMinutes: 30,
      };

      await expect(
        serviceBusQueueTrigger(mockContext, invalidMessage as any),
      ).rejects.toThrow(ERROR_MESSAGES.INVALID_MESSAGE);

      expect(mockEmailService.sendEmail).not.toHaveBeenCalled();
    });

    it('debe lanzar error si falta employeeName', async () => {
      const invalidMessage = {
        employeeId: 1,
        employeeEmail: 'test@example.com',
        checkInTime: '2025-11-07T10:30:00Z',
        lateMinutes: 30,
      };

      await expect(
        serviceBusQueueTrigger(mockContext, invalidMessage as any),
      ).rejects.toThrow(ERROR_MESSAGES.INVALID_MESSAGE);

      expect(mockEmailService.sendEmail).not.toHaveBeenCalled();
    });

    it('debe lanzar error si falta checkInTime', async () => {
      const invalidMessage = {
        employeeId: 1,
        employeeEmail: 'test@example.com',
        employeeName: 'Juan Pérez',
        lateMinutes: 30,
      };

      await expect(
        serviceBusQueueTrigger(mockContext, invalidMessage as any),
      ).rejects.toThrow(ERROR_MESSAGES.INVALID_MESSAGE);

      expect(mockEmailService.sendEmail).not.toHaveBeenCalled();
    });

    it('debe lanzar error si falta lateMinutes', async () => {
      const invalidMessage = {
        employeeId: 1,
        employeeEmail: 'test@example.com',
        employeeName: 'Juan Pérez',
        checkInTime: '2025-11-07T10:30:00Z',
      };

      await expect(
        serviceBusQueueTrigger(mockContext, invalidMessage as any),
      ).rejects.toThrow(ERROR_MESSAGES.INVALID_MESSAGE);

      expect(mockEmailService.sendEmail).not.toHaveBeenCalled();
    });

    it('debe lanzar error si lateMinutes es undefined', async () => {
      const invalidMessage = {
        employeeId: 1,
        employeeEmail: 'test@example.com',
        employeeName: 'Juan Pérez',
        checkInTime: '2025-11-07T10:30:00Z',
        // lateMinutes está undefined
      };

      await expect(
        serviceBusQueueTrigger(mockContext, invalidMessage as any),
      ).rejects.toThrow(ERROR_MESSAGES.INVALID_MESSAGE);

      expect(mockEmailService.sendEmail).not.toHaveBeenCalled();
    });
  });

  describe('Formato de email', () => {
    it('debe generar el asunto correctamente', async () => {
      const message = {
        employeeId: 1,
        employeeEmail: 'test@example.com',
        employeeName: 'María García',
        checkInTime: '2025-11-07T10:30:00Z',
        lateMinutes: 45,
      };

      await serviceBusQueueTrigger(mockContext, message);

      expect(mockEmailService.sendEmail).toHaveBeenCalledWith(
        'test@example.com',
        'Notificación de Tardanza - María García',
        expect.any(String),
        expect.any(String),
      );
    });

    it('debe incluir los detalles correctos en el email', async () => {
      const message = {
        employeeId: 2,
        employeeEmail: 'employee@example.com',
        employeeName: 'Carlos López',
        checkInTime: '2025-11-07T11:00:00Z',
        lateMinutes: 60,
      };

      await serviceBusQueueTrigger(mockContext, message);

      const callArgs = mockEmailService.sendEmail.mock.calls[0];
      const emailText = callArgs[2];
      const emailHtml = callArgs[3] as string;

      expect(emailText).toContain('Carlos López');
      expect(emailText).toContain('60 minutos');
      expect(emailHtml).toContain('Carlos López');
      expect(emailHtml).toContain('60 minutos');
      expect(emailHtml).toContain('Notificación de Tardanza');
    });

    it('debe formatear correctamente la fecha en el email', async () => {
      const message = {
        employeeId: 3,
        employeeEmail: 'test@example.com',
        employeeName: 'Ana Martínez',
        checkInTime: '2025-11-07T09:15:00Z',
        lateMinutes: 15,
      };

      await serviceBusQueueTrigger(mockContext, message);

      const callArgs = mockEmailService.sendEmail.mock.calls[0];
      const emailText = callArgs[2];

      expect(emailText).toContain('Ana Martínez');
      expect(emailText).toContain('15 minutos');
    });
  });

  describe('Manejo de errores', () => {
    it('debe manejar errores al enviar email y relanzar el error', async () => {
      const message = {
        employeeId: 1,
        employeeEmail: 'test@example.com',
        employeeName: 'Juan Pérez',
        checkInTime: '2025-11-07T10:30:00Z',
        lateMinutes: 30,
      };

      const emailError = new Error('Error de conexión SMTP');
      mockEmailService.sendEmail.mockRejectedValueOnce(emailError);

      await expect(
        serviceBusQueueTrigger(mockContext, message),
      ).rejects.toThrow('Error de conexión SMTP');

      expect(mockContext.log.error).toHaveBeenCalled();
      expect(mockContext.log).toHaveBeenCalledWith(
        'Procesando notificación de tardanza para empleado 1',
      );
    });

    it('debe registrar el error correctamente cuando falla el envío', async () => {
      const message = {
        employeeId: 1,
        employeeEmail: 'test@example.com',
        employeeName: 'Juan Pérez',
        checkInTime: '2025-11-07T10:30:00Z',
        lateMinutes: 30,
      };

      const emailError = new Error('SMTP timeout');
      mockEmailService.sendEmail.mockRejectedValueOnce(emailError);

      try {
        await serviceBusQueueTrigger(mockContext, message);
      } catch (error) {
        // Error esperado
      }

      expect(mockContext.log.error).toHaveBeenCalledWith(
        expect.stringContaining('SMTP timeout'),
      );
    });
  });

  describe('Logs', () => {
    it('debe registrar todos los pasos del proceso', async () => {
      const message = {
        employeeId: 5,
        employeeEmail: 'test@example.com',
        employeeName: 'Pedro Sánchez',
        checkInTime: '2025-11-07T10:30:00Z',
        lateMinutes: 20,
      };

      await serviceBusQueueTrigger(mockContext, message);

      expect(mockContext.log).toHaveBeenCalledWith(
        'Procesando notificación de tardanza para empleado 5',
      );
      expect(mockContext.log).toHaveBeenCalledWith(
        'Enviando correo a test@example.com...',
      );
      expect(mockContext.log).toHaveBeenCalledWith(
        'Correo enviado exitosamente a test@example.com',
      );
      expect(mockContext.log).toHaveBeenCalledWith(
        'Notificación de tardanza procesada exitosamente para empleado 5',
      );
    });
  });
});
