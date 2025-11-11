import { Employee } from '@employees/domain/entities/employee.entity';
import { EmployeeResponseDto } from '@employees/application/dto/employee-response.dto';

export class EmployeeResponseMapper {
  static toDto(employee: Employee): EmployeeResponseDto {
    return {
      id: employee.id,
      firstName: employee.firstName,
      lastName: employee.lastName,
      fullName: employee.fullName,
      documentNumber: employee.documentNumber,
      email: employee.email,
    };
  }

  static toDtoList(employees: Employee[]): EmployeeResponseDto[] {
    return employees.map((employee) => this.toDto(employee));
  }
}
