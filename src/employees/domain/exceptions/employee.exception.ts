import { DomainException } from '@shared/domain/exceptions/domain.exception';
import { ERROR_MESSAGES } from '@shared/domain/constants/error-messages.constants';

/**
 * Excepción lanzada cuando se intenta crear un empleado con un número de documento que ya existe
 */
export class DuplicateDocumentNumberException extends DomainException {
  constructor(documentNumber: string) {
    super(ERROR_MESSAGES.DUPLICATE_DOCUMENT_NUMBER(documentNumber));
  }
}
