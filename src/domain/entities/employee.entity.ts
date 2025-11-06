export class Employee {
  constructor(
    public readonly id: number,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly documentNumber: string,
  ) {}

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}

