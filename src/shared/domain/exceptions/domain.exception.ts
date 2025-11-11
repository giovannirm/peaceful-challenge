/**
 * Excepción base del dominio
 * Todas las excepciones de dominio deben extender de esta clase
 */
export abstract class DomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
