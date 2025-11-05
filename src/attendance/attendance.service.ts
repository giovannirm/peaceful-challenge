import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendance, AttendanceType } from './entities/attendance.entity';
import { Employee } from '../employees/entities/employee.entity';
import { CreateAttendanceDto } from './dto/create-attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private attendanceRepository: Repository<Attendance>,
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
  ) {}

  async checkIn(createAttendanceDto: CreateAttendanceDto) {
    // Validar que el empleado existe
    const employee = await this.employeeRepository.findOne({
      where: { id: createAttendanceDto.employeeId },
    });

    if (!employee) {
      throw new NotFoundException(
        `Empleado con ID ${createAttendanceDto.employeeId} no encontrado`,
      );
    }

    const attendance = this.attendanceRepository.create({
      employeeId: createAttendanceDto.employeeId,
      type: AttendanceType.CHECK_IN,
      latitude: createAttendanceDto.latitude,
      longitude: createAttendanceDto.longitude,
      recordTime: new Date(createAttendanceDto.recordTime),
    });

    return this.attendanceRepository.save(attendance);
  }

  async checkOut(createAttendanceDto: CreateAttendanceDto) {
    // Validar que el empleado existe
    const employee = await this.employeeRepository.findOne({
      where: { id: createAttendanceDto.employeeId },
    });

    if (!employee) {
      throw new NotFoundException(
        `Empleado con ID ${createAttendanceDto.employeeId} no encontrado`,
      );
    }

    const attendance = this.attendanceRepository.create({
      employeeId: createAttendanceDto.employeeId,
      type: AttendanceType.CHECK_OUT,
      latitude: createAttendanceDto.latitude,
      longitude: createAttendanceDto.longitude,
      recordTime: new Date(createAttendanceDto.recordTime),
    });

    return this.attendanceRepository.save(attendance);
  }

  async getAttendances(employeeId: number) {
    const employee = await this.employeeRepository.findOne({
      where: { id: employeeId },
    });

    if (!employee) {
      throw new NotFoundException(
        `Empleado con ID ${employeeId} no encontrado`,
      );
    }

    return this.attendanceRepository.find({
      where: { employeeId },
      order: { recordTime: 'DESC' },
    });
  }
}
