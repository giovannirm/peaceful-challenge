import { ERROR_MESSAGES } from '@shared/domain/constants/error-messages.constants';

export enum AttendanceType {
  CHECK_IN = 'check_in',
  CHECK_OUT = 'check_out',
}

export class AttendanceTypeVO {
  constructor(private readonly value: AttendanceType) {
    if (!Object.values(AttendanceType).includes(value)) {
      throw new Error(ERROR_MESSAGES.INVALID_ATTENDANCE_TYPE(value));
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

