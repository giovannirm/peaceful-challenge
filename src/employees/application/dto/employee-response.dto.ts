import { ApiProperty } from '@nestjs/swagger';

export class EmployeeResponseDto {
  @ApiProperty({ description: 'ID del empleado', example: 1 })
  id: number;

  @ApiProperty({ description: 'Nombre del empleado', example: 'Juan' })
  firstName: string;

  @ApiProperty({ description: 'Apellido del empleado', example: 'Pérez' })
  lastName: string;

  @ApiProperty({
    description: 'Nombre completo del empleado',
    example: 'Juan Pérez',
  })
  fullName: string;

  @ApiProperty({
    description: 'Número de documento',
    example: '12345678',
  })
  documentNumber: string;

  @ApiProperty({
    description: 'Correo electrónico',
    example: 'juan.perez@example.com',
    nullable: true,
  })
  email: string | null;
}


