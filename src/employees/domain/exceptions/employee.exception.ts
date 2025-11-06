import { DomainException } from '@shared/domain/exceptions/domain.exception';

/**
 * Excepción lanzada cuando se intenta crear un empleado con un número de documento que ya existe
 */
export class DuplicateDocumentNumberException extends DomainException {
  constructor(documentNumber: string) {
    super(
      `Ya existe un empleado con el número de documento: ${documentNumber}`,
    );
  }
}

