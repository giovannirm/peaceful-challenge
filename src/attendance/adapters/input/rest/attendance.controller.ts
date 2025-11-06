import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  ParseIntPipe,
  Query,
  Logger,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { CheckInUseCase } from '@attendance/application/use-cases/check-in.use-case';
import { CheckOutUseCase } from '@attendance/application/use-cases/check-out.use-case';
import { GetAttendancesByEmployeeUseCase } from '@attendance/application/use-cases/get-attendances-by-employee.use-case';
import { GenerateAttendanceReportUseCase } from '@attendance/application/use-cases/generate-attendance-report.use-case';
import { CheckInDto } from '@attendance/application/dto/check-in.dto';
import { CheckOutDto } from '@attendance/application/dto/check-out.dto';
import { AttendanceResponseDto } from '@attendance/application/dto/attendance-response.dto';
import { AttendanceReportDto } from '@attendance/application/dto/attendance-report.dto';
import { AttendanceResponseMapper } from './attendance-response.mapper';
import { API_ROUTES } from '@shared/adapters/input/rest/routes.constants';
import { SWAGGER_CONSTANTS, API_VERSIONING } from '@shared/adapters/input/rest/swagger.constants';
import { QUERY_PARAMS } from '@shared/adapters/input/rest/query-params.constants';
import { ERROR_MESSAGES } from '@shared/domain/constants/error-messages.constants';

@ApiTags(SWAGGER_CONSTANTS.TAGS.ATTENDANCE)
@Controller({
  path: API_ROUTES.ATTENDANCE.BASE,
  version: API_VERSIONING.DEFAULT_VERSION,
})
export class AttendanceController {
  private readonly logger = new Logger(AttendanceController.name);

  constructor(
    private readonly checkInUseCase: CheckInUseCase,
    private readonly checkOutUseCase: CheckOutUseCase,
    private readonly getAttendancesByEmployeeUseCase: GetAttendancesByEmployeeUseCase,
    private readonly generateAttendanceReportUseCase: GenerateAttendanceReportUseCase,
  ) {}

  @Post(API_ROUTES.ATTENDANCE.CHECK_IN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar hora de ingreso de un empleado' })
  @ApiResponse({
    status: 201,
    description: 'Check-in registrado exitosamente',
    type: AttendanceResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Check-in duplicado o datos inválidos',
  })
  @ApiResponse({ status: 404, description: 'Empleado no encontrado' })
  async checkIn(
    @Body() checkInDto: CheckInDto,
  ): Promise<AttendanceResponseDto> {
    this.logger.log(
      `POST ${API_ROUTES.ATTENDANCE.CHECK_IN} - Empleado: ${checkInDto.employeeId}`,
    );
    const attendance = await this.checkInUseCase.execute(checkInDto);
    return AttendanceResponseMapper.toDto(attendance);
  }

  @Post(API_ROUTES.ATTENDANCE.CHECK_OUT)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar hora de salida de un empleado' })
  @ApiResponse({
    status: 201,
    description: 'Check-out registrado exitosamente',
    type: AttendanceResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Check-out duplicado, falta check-in previo o datos inválidos',
  })
  @ApiResponse({ status: 404, description: 'Empleado no encontrado' })
  async checkOut(
    @Body() checkOutDto: CheckOutDto,
  ): Promise<AttendanceResponseDto> {
    this.logger.log(
      `POST ${API_ROUTES.ATTENDANCE.CHECK_OUT} - Empleado: ${checkOutDto.employeeId}`,
    );
    const attendance = await this.checkOutUseCase.execute(checkOutDto);
    return AttendanceResponseMapper.toDto(attendance);
  }

  @Get(API_ROUTES.ATTENDANCE.BY_EMPLOYEE)
  @ApiOperation({
    summary: 'Obtener todos los registros de asistencia de un empleado',
  })
  @ApiParam({ name: 'id', description: 'ID del empleado', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Lista de registros de asistencia',
    type: [AttendanceResponseDto],
  })
  @ApiResponse({ status: 404, description: 'Empleado no encontrado' })
  async getAttendances(
    @Param('id', ParseIntPipe) employeeId: number,
  ): Promise<AttendanceResponseDto[]> {
    this.logger.log(
      `GET ${API_ROUTES.ATTENDANCE.BY_EMPLOYEE} - Empleado: ${employeeId}`,
    );
    const attendances =
      await this.getAttendancesByEmployeeUseCase.execute(employeeId);
    return AttendanceResponseMapper.toDtoList(attendances);
  }

  @Get(API_ROUTES.ATTENDANCE.REPORT)
  @ApiOperation({
    summary: 'Generar reporte de faltas y tardanzas de un empleado',
    description:
      'Genera un reporte que indica cuántos días un empleado no asistió y cuántas tardanzas tuvo en un rango de fechas',
  })
  @ApiParam({ name: 'id', description: 'ID del empleado', type: Number })
  @ApiQuery({
    name: QUERY_PARAMS.START_DATE,
    description: 'Fecha de inicio (YYYY-MM-DD)',
    example: '2024-01-01',
  })
  @ApiQuery({
    name: QUERY_PARAMS.END_DATE,
    description: 'Fecha de fin (YYYY-MM-DD)',
    example: '2024-01-31',
  })
  @ApiResponse({
    status: 200,
    description: 'Reporte generado exitosamente',
    type: AttendanceReportDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Fechas inválidas o rango incorrecto',
  })
  @ApiResponse({ status: 404, description: 'Empleado no encontrado' })
  async getReport(
    @Param('id', ParseIntPipe) employeeId: number,
    @Query(QUERY_PARAMS.START_DATE) startDateStr: string,
    @Query(QUERY_PARAMS.END_DATE) endDateStr: string,
  ): Promise<AttendanceReportDto> {
    this.logger.log(
      `GET ${API_ROUTES.ATTENDANCE.REPORT.replace(':id', String(employeeId))} - Desde: ${startDateStr}, Hasta: ${endDateStr}`,
    );

    if (!startDateStr || !endDateStr) {
      throw new Error(
        `${QUERY_PARAMS.START_DATE} y ${QUERY_PARAMS.END_DATE} son requeridos`,
      );
    }

    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new Error(ERROR_MESSAGES.INVALID_DATE_FORMAT);
    }

    return this.generateAttendanceReportUseCase.execute(
      employeeId,
      startDate,
      endDate,
    );
  }
}
