import { AttendanceValidatorService } from './attendance-validator.service';
import { BUSINESS_CONSTANTS } from '@shared/domain/constants/business.constants';

describe('AttendanceValidatorService', () => {
  let service: AttendanceValidatorService;

  beforeEach(() => {
    service = new AttendanceValidatorService();
  });

  describe('isLateCheckIn', () => {
    it('debe retornar false si el check-in es antes de la hora de inicio', () => {
      // 8:00 AM - antes de las 9:00 AM
      const checkInTime = new Date('2025-11-07T08:00:00');
      expect(service.isLateCheckIn(checkInTime)).toBe(false);
    });

    it('debe retornar false si el check-in es exactamente a la hora de inicio', () => {
      // 9:00 AM - hora de inicio
      const checkInTime = new Date('2025-11-07T09:00:00');
      expect(service.isLateCheckIn(checkInTime)).toBe(false);
    });

    it('debe retornar false si el check-in es dentro de la tolerancia (1 hora)', () => {
      // 9:30 AM - dentro de la tolerancia (antes de las 10:00 AM)
      const checkInTime = new Date('2025-11-07T09:30:00');
      expect(service.isLateCheckIn(checkInTime)).toBe(false);
    });

    it('debe retornar false si el check-in es exactamente en el umbral de tolerancia', () => {
      // 10:00 AM - exactamente en el umbral (9:00 + 1 hora)
      const checkInTime = new Date('2025-11-07T10:00:00');
      expect(service.isLateCheckIn(checkInTime)).toBe(false);
    });

    it('debe retornar true si el check-in es después del umbral de tolerancia', () => {
      // 10:01 AM - después del umbral
      const checkInTime = new Date('2025-11-07T10:01:00');
      expect(service.isLateCheckIn(checkInTime)).toBe(true);
    });

    it('debe retornar true si el check-in es mucho después del umbral', () => {
      // 11:00 AM - 2 horas después del inicio
      const checkInTime = new Date('2025-11-07T11:00:00');
      expect(service.isLateCheckIn(checkInTime)).toBe(true);
    });
  });

  describe('calculateLateMinutes', () => {
    it('debe retornar 0 si el check-in es antes de la hora de inicio', () => {
      const checkInTime = new Date('2025-11-07T08:00:00');
      expect(service.calculateLateMinutes(checkInTime)).toBe(0);
    });

    it('debe retornar 0 si el check-in es exactamente a la hora de inicio', () => {
      const checkInTime = new Date('2025-11-07T09:00:00');
      expect(service.calculateLateMinutes(checkInTime)).toBe(0);
    });

    it('debe retornar 0 si el check-in está dentro de la tolerancia', () => {
      const checkInTime = new Date('2025-11-07T09:30:00');
      expect(service.calculateLateMinutes(checkInTime)).toBe(0);
    });

    it('debe retornar 0 si el check-in es exactamente en el umbral', () => {
      const checkInTime = new Date('2025-11-07T10:00:00');
      expect(service.calculateLateMinutes(checkInTime)).toBe(0);
    });

    it('debe calcular correctamente los minutos de tardanza', () => {
      // 10:15 AM - 15 minutos después del umbral
      const checkInTime = new Date('2025-11-07T10:15:00');
      expect(service.calculateLateMinutes(checkInTime)).toBe(15);
    });

    it('debe calcular correctamente 30 minutos de tardanza', () => {
      // 10:30 AM - 30 minutos después del umbral
      const checkInTime = new Date('2025-11-07T10:30:00');
      expect(service.calculateLateMinutes(checkInTime)).toBe(30);
    });

    it('debe calcular correctamente 60 minutos de tardanza', () => {
      // 11:00 AM - 60 minutos después del umbral
      const checkInTime = new Date('2025-11-07T11:00:00');
      expect(service.calculateLateMinutes(checkInTime)).toBe(60);
    });

    it('debe redondear hacia abajo los minutos de tardanza', () => {
      // 10:15:30 AM - 15 minutos y 30 segundos
      const checkInTime = new Date('2025-11-07T10:15:30');
      expect(service.calculateLateMinutes(checkInTime)).toBe(15);
    });
  });

  describe('getStartOfDay', () => {
    it('debe retornar el inicio del día (00:00:00)', () => {
      const date = new Date('2025-11-07T14:30:45');
      const startOfDay = service.getStartOfDay(date);

      expect(startOfDay.getHours()).toBe(0);
      expect(startOfDay.getMinutes()).toBe(0);
      expect(startOfDay.getSeconds()).toBe(0);
      expect(startOfDay.getMilliseconds()).toBe(0);
      expect(startOfDay.getDate()).toBe(7);
      expect(startOfDay.getMonth()).toBe(10); // Noviembre (0-indexed)
      expect(startOfDay.getFullYear()).toBe(2025);
    });

    it('debe retornar el mismo día pero a las 00:00:00', () => {
      const date = new Date('2025-11-07T23:59:59');
      const startOfDay = service.getStartOfDay(date);

      expect(startOfDay.getDate()).toBe(7);
      expect(startOfDay.getHours()).toBe(0);
    });
  });

  describe('getEndOfDay', () => {
    it('debe retornar el final del día (23:59:59.999)', () => {
      const date = new Date('2025-11-07T14:30:45');
      const endOfDay = service.getEndOfDay(date);

      expect(endOfDay.getHours()).toBe(23);
      expect(endOfDay.getMinutes()).toBe(59);
      expect(endOfDay.getSeconds()).toBe(59);
      expect(endOfDay.getMilliseconds()).toBe(999);
      expect(endOfDay.getDate()).toBe(7);
      expect(endOfDay.getMonth()).toBe(10); // Noviembre (0-indexed)
      expect(endOfDay.getFullYear()).toBe(2025);
    });

    it('debe retornar el mismo día pero a las 23:59:59.999', () => {
      const date = new Date('2025-11-07T00:00:00');
      const endOfDay = service.getEndOfDay(date);

      expect(endOfDay.getDate()).toBe(7);
      expect(endOfDay.getHours()).toBe(23);
      expect(endOfDay.getMinutes()).toBe(59);
      expect(endOfDay.getSeconds()).toBe(59);
      expect(endOfDay.getMilliseconds()).toBe(999);
    });
  });

  describe('Integración con constantes de negocio', () => {
    it('debe usar la hora de inicio correcta de BUSINESS_CONSTANTS', () => {
      const checkInTime = new Date('2025-11-07T09:00:00');
      expect(service.isLateCheckIn(checkInTime)).toBe(false);

      const checkInTime2 = new Date('2025-11-07T10:01:00');
      expect(service.isLateCheckIn(checkInTime2)).toBe(true);
    });

    it('debe usar la tolerancia correcta de BUSINESS_CONSTANTS', () => {
      // El umbral es 9:00 + 1 hora = 10:00
      const atThreshold = new Date('2025-11-07T10:00:00');
      expect(service.isLateCheckIn(atThreshold)).toBe(false);

      const afterThreshold = new Date('2025-11-07T10:01:00');
      expect(service.isLateCheckIn(afterThreshold)).toBe(true);
    });
  });
});
