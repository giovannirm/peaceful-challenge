import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeTypeOrmEntity } from '../persistence/typeorm/entities/employee.typeorm.entity';
import { TypeOrmEmployeeRepository } from '../../adapters/output/persistence/typeorm-employee.repository';
import { IEmployeeRepository } from '../../ports/output/employee.repository.port';
import { DEPENDENCY_INJECTION_TOKENS } from './dependency-injection.tokens';

@Module({
  imports: [TypeOrmModule.forFeature([EmployeeTypeOrmEntity])],
  providers: [
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

