import {
  IsNotEmpty,
  IsNumber,
  IsDateString,
  IsEnum,
  IsLatitude,
  IsLongitude,
} from 'class-validator';
import { AttendanceType } from '../entities/attendance.entity';

export class CreateAttendanceDto {
  @IsNotEmpty()
  @IsNumber()
  employeeId: number;

  @IsNotEmpty()
  @IsEnum(AttendanceType)
  type: AttendanceType;

  @IsNotEmpty()
  @IsLatitude()
  latitude: number;

  @IsNotEmpty()
  @IsLongitude()
  longitude: number;

  @IsNotEmpty()
  @IsDateString()
  recordTime: string;
}
