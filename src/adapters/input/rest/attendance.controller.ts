import { Controller, Post, Get, Body, Param, ParseIntPipe } from '@nestjs/common';
import { CheckInUseCase } from '../../../application/use-cases/check-in.use-case';
import { CheckOutUseCase } from '../../../application/use-cases/check-out.use-case';
import { GetAttendancesByEmployeeUseCase } from '../../../application/use-cases/get-attendances-by-employee.use-case';
import { CreateAttendanceDto } from '../../../application/dto/create-attendance.dto';
import { AttendanceResponseDto } from '../../../application/dto/attendance-response.dto';
import { AttendanceResponseMapper } from './mappers/attendance-response.mapper';
import { API_ROUTES } from './routes.constants';

@Controller(API_ROUTES.ATTENDANCE.BASE)
export class AttendanceController {
  constructor(
    private readonly checkInUseCase: CheckInUseCase,
    private readonly checkOutUseCase: CheckOutUseCase,
    private readonly getAttendancesByEmployeeUseCase: GetAttendancesByEmployeeUseCase,
  ) {}

  @Post(API_ROUTES.ATTENDANCE.CHECK_IN)
  async checkIn(@Body() createAttendanceDto: CreateAttendanceDto): Promise<AttendanceResponseDto> {
    const attendance = await this.checkInUseCase.execute(createAttendanceDto);
    return AttendanceResponseMapper.toDto(attendance);
  }

  @Post(API_ROUTES.ATTENDANCE.CHECK_OUT)
  async checkOut(@Body() createAttendanceDto: CreateAttendanceDto): Promise<AttendanceResponseDto> {
    const attendance = await this.checkOutUseCase.execute(createAttendanceDto);
    return AttendanceResponseMapper.toDto(attendance);
  }

  @Get(API_ROUTES.ATTENDANCE.BY_EMPLOYEE)
  async getAttendances(@Param('id', ParseIntPipe) employeeId: number): Promise<AttendanceResponseDto[]> {
    const attendances = await this.getAttendancesByEmployeeUseCase.execute(employeeId);
    return AttendanceResponseMapper.toDtoList(attendances);
  }
}

