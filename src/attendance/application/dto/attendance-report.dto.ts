import { ApiProperty } from '@nestjs/swagger';

export class DayAttendanceDto {
  @ApiProperty({ description: 'Fecha del día', example: '2024-01-15' })
  date: string;

  @ApiProperty({
    description: 'Indica si tiene registro de entrada',
    example: true,
  })
  hasCheckIn: boolean;

  @ApiProperty({
    description: 'Indica si tiene registro de salida',
    example: true,
  })
  hasCheckOut: boolean;

  @ApiProperty({
    description: 'Hora de entrada (ISO 8601)',
    example: '2024-01-15T09:00:00.000Z',
    nullable: true,
  })
  checkInTime: string | null;

  @ApiProperty({
    description: 'Hora de salida (ISO 8601)',
    example: '2024-01-15T18:00:00.000Z',
    nullable: true,
  })
  checkOutTime: string | null;

  @ApiProperty({ description: 'Indica si llegó tarde', example: false })
  isLate: boolean;

  @ApiProperty({ description: 'Minutos de tardanza', example: 0 })
  lateMinutes: number;

  @ApiProperty({ description: 'Indica si faltó ese día', example: false })
  isAbsent: boolean;
}

export class AttendanceReportDto {
  @ApiProperty({ description: 'ID del empleado', example: 1 })
  employeeId: number;

  @ApiProperty({
    description: 'Nombre completo del empleado',
    example: 'Juan Pérez',
  })
  employeeName: string;

  @ApiProperty({
    description: 'Fecha de inicio del reporte',
    example: '2024-01-01',
  })
  startDate: string;

  @ApiProperty({
    description: 'Fecha de fin del reporte',
    example: '2024-01-31',
  })
  endDate: string;

  @ApiProperty({ description: 'Total de días en el rango', example: 31 })
  totalDays: number;

  @ApiProperty({ description: 'Días sin asistencia', example: 2 })
  absentDays: number;

  @ApiProperty({ description: 'Días con tardanza', example: 3 })
  lateDays: number;

  @ApiProperty({
    description: 'Detalle de asistencia por día',
    type: [DayAttendanceDto],
  })
  attendances: DayAttendanceDto[];
}
