import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  ParseIntPipe,
  Logger,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CreateEmployeeUseCase } from '@employees/application/use-cases/create-employee.use-case';
import { GetEmployeeUseCase } from '@employees/application/use-cases/get-employee.use-case';
import { GetAllEmployeesUseCase } from '@employees/application/use-cases/get-all-employees.use-case';
import { UpdateEmployeeUseCase } from '@employees/application/use-cases/update-employee.use-case';
import { CreateEmployeeDto } from '@employees/application/dto/create-employee.dto';
import { UpdateEmployeeDto } from '@employees/application/dto/update-employee.dto';
import { EmployeeResponseDto } from '@employees/application/dto/employee-response.dto';
import { EmployeeResponseMapper } from './employee-response.mapper';
import { API_ROUTES } from '@shared/adapters/input/rest/routes.constants';
import {
  SWAGGER_CONSTANTS,
  API_VERSIONING,
} from '@shared/adapters/input/rest/swagger.constants';

@ApiTags(SWAGGER_CONSTANTS.TAGS.EMPLOYEES)
@Controller({
  path: API_ROUTES.EMPLOYEES.BASE,
  version: API_VERSIONING.DEFAULT_VERSION,
})
export class EmployeeController {
  private readonly logger = new Logger(EmployeeController.name);

  constructor(
    private readonly createEmployeeUseCase: CreateEmployeeUseCase,
    private readonly getEmployeeUseCase: GetEmployeeUseCase,
    private readonly getAllEmployeesUseCase: GetAllEmployeesUseCase,
    private readonly updateEmployeeUseCase: UpdateEmployeeUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo empleado' })
  @ApiResponse({
    status: 201,
    description: 'Empleado creado exitosamente',
    type: EmployeeResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos',
  })
  @ApiResponse({
    status: 409,
    description: 'Ya existe un empleado con el mismo número de documento',
  })
  async create(
    @Body() createEmployeeDto: CreateEmployeeDto,
  ): Promise<EmployeeResponseDto> {
    this.logger.log(
      `POST ${API_ROUTES.EMPLOYEES.BASE} - Creando empleado: ${createEmployeeDto.firstName} ${createEmployeeDto.lastName}`,
    );
    const employee =
      await this.createEmployeeUseCase.execute(createEmployeeDto);
    return EmployeeResponseMapper.toDto(employee);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los empleados' })
  @ApiResponse({
    status: 200,
    description: 'Lista de empleados',
    type: [EmployeeResponseDto],
  })
  async findAll(): Promise<EmployeeResponseDto[]> {
    this.logger.log(
      `GET ${API_ROUTES.EMPLOYEES.BASE} - Obteniendo todos los empleados`,
    );
    const employees = await this.getAllEmployeesUseCase.execute();
    return EmployeeResponseMapper.toDtoList(employees);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un empleado por ID' })
  @ApiParam({ name: 'id', description: 'ID del empleado', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Empleado encontrado',
    type: EmployeeResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Empleado no encontrado' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<EmployeeResponseDto> {
    this.logger.log(
      `GET ${API_ROUTES.EMPLOYEES.BASE}/${id} - Buscando empleado`,
    );
    const employee = await this.getEmployeeUseCase.execute(id);
    return EmployeeResponseMapper.toDto(employee);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar un empleado' })
  @ApiParam({ name: 'id', description: 'ID del empleado', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Empleado actualizado exitosamente',
    type: EmployeeResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Empleado no encontrado' })
  @ApiResponse({
    status: 409,
    description: 'Ya existe un empleado con el mismo número de documento',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
  ): Promise<EmployeeResponseDto> {
    this.logger.log(
      `PUT ${API_ROUTES.EMPLOYEES.BASE}/${id} - Actualizando empleado`,
    );
    const employee = await this.updateEmployeeUseCase.execute(
      id,
      updateEmployeeDto,
    );
    return EmployeeResponseMapper.toDto(employee);
  }
}
