import {
  IsNotEmpty,
  IsNumber,
  IsDateString,
  IsLatitude,
  IsLongitude,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CheckInDto {
  @ApiProperty({
    description: 'ID del empleado',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  employeeId: number;

  @ApiProperty({
    description: 'Latitud de la ubicación',
    example: -12.0464,
  })
  @IsNotEmpty()
  @IsLatitude()
  latitude: number;

  @ApiProperty({
    description: 'Longitud de la ubicación',
    example: -77.0428,
  })
  @IsNotEmpty()
  @IsLongitude()
  longitude: number;

  @ApiProperty({
    description: 'Fecha y hora del registro (ISO 8601)',
    example: '2024-01-15T09:00:00.000Z',
  })
  @IsNotEmpty()
  @IsDateString()
  recordTime: string;
}

