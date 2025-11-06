import { DomainException } from '@shared/domain/exceptions/domain.exception';

/**
 * Excepción lanzada cuando un empleado intenta hacer check-in pero ya tiene uno registrado el mismo día
 */
export class DuplicateCheckInException extends DomainException {
  constructor(employeeId: number, date: Date) {
    super(
      `El empleado con ID ${employeeId} ya tiene un registro de entrada para el día ${date.toLocaleDateString()}`,
    );
  }
}

/**
 * Excepción lanzada cuando un empleado intenta hacer check-out sin tener un check-in previo
 */
export class MissingCheckInException extends DomainException {
  constructor(employeeId: number, date: Date) {
    super(
      `El empleado con ID ${employeeId} no tiene un registro de entrada para el día ${date.toLocaleDateString()}`,
    );
  }
}

/**
 * Excepción lanzada cuando un empleado intenta hacer check-out pero ya tiene uno registrado el mismo día
 */
export class DuplicateCheckOutException extends DomainException {
  constructor(employeeId: number, date: Date) {
    super(
      `El empleado con ID ${employeeId} ya tiene un registro de salida para el día ${date.toLocaleDateString()}`,
    );
  }
}

