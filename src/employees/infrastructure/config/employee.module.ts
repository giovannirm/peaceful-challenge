import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeTypeOrmEntity } from '@employees/infrastructure/persistence/typeorm/entities/employee.typeorm.entity';
import { TypeOrmEmployeeRepository } from '@employees/adapters/output/persistence/typeorm-employee.repository';
import { IEmployeeRepository } from '@employees/domain/ports/employee.repository.port';
import { DEPENDENCY_INJECTION_TOKENS } from '@shared/application/config/dependency-injection.tokens';
import { EmployeeController } from '@employees/adapters/input/rest/employee.controller';
import { CreateEmployeeUseCase } from '@employees/application/use-cases/create-employee.use-case';
import { GetEmployeeUseCase } from '@employees/application/use-cases/get-employee.use-case';
import { GetAllEmployeesUseCase } from '@employees/application/use-cases/get-all-employees.use-case';
import { UpdateEmployeeUseCase } from '@employees/application/use-cases/update-employee.use-case';

@Module({
  imports: [TypeOrmModule.forFeature([EmployeeTypeOrmEntity])],
  controllers: [EmployeeController],
  providers: [
    CreateEmployeeUseCase,
    GetEmployeeUseCase,
    GetAllEmployeesUseCase,
    UpdateEmployeeUseCase,
    {
      provide: DEPENDENCY_INJECTION_TOKENS.EMPLOYEE_REPOSITORY,
      useClass: TypeOrmEmployeeRepository,
    },
  ],
  exports: [
    {
      provide: DEPENDENCY_INJECTION_TOKENS.EMPLOYEE_REPOSITORY,
      useClass: TypeOrmEmployeeRepository,
    },
  ],
})
export class EmployeeModule {}

