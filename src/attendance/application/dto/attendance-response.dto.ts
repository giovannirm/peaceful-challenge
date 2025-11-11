import { ApiProperty } from '@nestjs/swagger';
import { AttendanceType } from '@shared/domain/value-objects/attendance-type.vo';

export class AttendanceResponseDto {
  @ApiProperty({ description: 'ID del registro de asistencia', example: 1 })
  id: number;

  @ApiProperty({ description: 'ID del empleado', example: 1 })
  employeeId: number;

  @ApiProperty({
    description: 'Tipo de registro',
    example: AttendanceType.CHECK_IN,
    enum: AttendanceType,
  })
  type: string;

  @ApiProperty({ description: 'Latitud', example: -12.0464 })
  latitude: number;

  @ApiProperty({ description: 'Longitud', example: -77.0428 })
  longitude: number;

  @ApiProperty({
    description: 'Fecha y hora del registro',
    example: '2024-01-15T09:00:00.000Z',
  })
  recordTime: Date;

  @ApiProperty({
    description: 'Fecha de creación del registro',
    example: '2024-01-15T09:00:00.000Z',
  })
  createdAt: Date;
}
