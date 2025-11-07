import { DomainException } from '@shared/domain/exceptions/domain.exception';
import { ERROR_MESSAGES } from '@shared/domain/constants/error-messages.constants';

/**
 * Excepción lanzada cuando un empleado intenta hacer check-in pero ya tiene uno registrado el mismo día
 */
export class DuplicateCheckInException extends DomainException {
  constructor(employeeId: number, date: Date) {
    super(ERROR_MESSAGES.DUPLICATE_CHECK_IN(employeeId, date));
  }
}

/**
 * Excepción lanzada cuando un empleado intenta hacer check-out sin tener un check-in previo
 */
export class MissingCheckInException extends DomainException {
  constructor(employeeId: number, date: Date) {
    super(ERROR_MESSAGES.MISSING_CHECK_IN(employeeId, date));
  }
}

/**
 * Excepción lanzada cuando un empleado intenta hacer check-out pero ya tiene uno registrado el mismo día
 */
export class DuplicateCheckOutException extends DomainException {
  constructor(employeeId: number, date: Date) {
    super(ERROR_MESSAGES.DUPLICATE_CHECK_OUT(employeeId, date));
  }
}

