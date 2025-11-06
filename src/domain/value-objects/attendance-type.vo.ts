export enum AttendanceType {
  CHECK_IN = 'check_in',
  CHECK_OUT = 'check_out',
}

export class AttendanceTypeVO {
  constructor(private readonly value: AttendanceType) {
    if (!Object.values(AttendanceType).includes(value)) {
      throw new Error(`Invalid attendance type: ${value}`);
    }
  }

  getValue(): AttendanceType {
    return this.value;
  }

  toString(): string {
    return this.value;
  }

  equals(other: AttendanceTypeVO): boolean {
    return this.value === other.value;
  }
}

