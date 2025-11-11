import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsOptional,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEmployeeDto {
  @ApiProperty({
    description: 'Nombre del empleado',
    example: 'Juan',
    minLength: 1,
    maxLength: 100,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  firstName: string;

  @ApiProperty({
    description: 'Apellido del empleado',
    example: 'Pérez',
    minLength: 1,
    maxLength: 100,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  lastName: string;

  @ApiProperty({
    description: 'Número de documento del empleado (debe ser único)',
    example: '12345678',
    minLength: 1,
    maxLength: 20,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  documentNumber: string;

  @ApiProperty({
    description: 'Correo electrónico del empleado (opcional)',
    example: 'juan.perez@example.com',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;
}
