import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeModule } from './infrastructure/config/employee.module';
import { AttendanceModule } from './infrastructure/config/attendance.module';
import { EmployeeTypeOrmEntity } from './infrastructure/persistence/typeorm/entities/employee.typeorm.entity';
import { AttendanceTypeOrmEntity } from './infrastructure/persistence/typeorm/entities/attendance.typeorm.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mssql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '1433', 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [EmployeeTypeOrmEntity, AttendanceTypeOrmEntity],
      synchronize: false,
      options: {
        encrypt: true,
        trustServerCertificate: true,
      },
    }),
    EmployeeModule,
    AttendanceModule,
  ],
})
export class AppModule {}
