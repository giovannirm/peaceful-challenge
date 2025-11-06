export class Employee {
  constructor(
    public readonly id: number,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly documentNumber: string,
    public readonly email: string | null = null,
  ) {}

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  hasEmail(): boolean {
    return this.email !== null && this.email.trim() !== '';
  }

  static create(
    firstName: string,
    lastName: string,
    documentNumber: string,
    email: string | null = null,
  ): Employee {
    return new Employee(0, firstName, lastName, documentNumber, email);
  }
}
