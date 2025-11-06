# Arquitectura Hexagonal (Ports and Adapters)

Este proyecto utiliza **Arquitectura Hexagonal** (también conocida como Ports and Adapters) para separar las preocupaciones y hacer el código más mantenible, testeable y escalable.

## Estructura del Proyecto

```
src/
├── domain/                          # Núcleo del Dominio (Business Logic)
│   ├── entities/                    # Entidades de dominio
│   │   ├── employee.entity.ts
│   │   └── attendance.entity.ts
│   └── value-objects/               # Objetos de valor
│       ├── attendance-type.vo.ts
│       └── coordinates.vo.ts
│
├── application/                     # Capa de Aplicación (Use Cases)
│   ├── use-cases/                   # Casos de uso
│   │   ├── check-in.use-case.ts
│   │   ├── check-out.use-case.ts
│   │   └── get-attendances-by-employee.use-case.ts
│   └── dto/                         # Data Transfer Objects
│       ├── create-attendance.dto.ts
│       └── attendance-response.dto.ts
│
├── ports/                           # Interfaces (Puertos)
│   ├── input/                       # Puertos de entrada (Driving)
│   └── output/                      # Puertos de salida (Driven)
│       ├── employee.repository.port.ts
│       └── attendance.repository.port.ts
│
├── adapters/                        # Implementaciones (Adaptadores)
│   ├── input/                       # Adaptadores de entrada
│   │   └── rest/                    # REST API
│   │       ├── attendance.controller.ts
│   │       └── mappers/
│   │           └── attendance-response.mapper.ts
│   └── output/                      # Adaptadores de salida
│       └── persistence/
│           ├── typeorm-employee.repository.ts
│           └── typeorm-attendance.repository.ts
│
└── infrastructure/                  # Configuración de código (NestJS)
    ├── persistence/
    │   ├── typeorm/
    │   │   └── entities/            # Entidades de TypeORM
    │   │       ├── employee.typeorm.entity.ts
    │   │       └── attendance.typeorm.entity.ts
    │   ├── mappers/                 # Mappers dominio ↔ persistencia
    │   │   └── attendance.mapper.ts
    │   └── constants/               # Constantes de base de datos
    │       └── database.constants.ts
    └── config/                      # Configuración de módulos
        ├── employee.module.ts
        ├── attendance.module.ts
        └── dependency-injection.tokens.ts
```

## Estructura del Proyecto Completa

```
project-root/
├── src/                            # Código de aplicación (runtime)
│   └── [estructura hexagonal arriba]
│
├── iac/                            # Infrastructure as Code (IaC)
│   ├── terraform/                  # Configuración de Terraform
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   ├── terraform.tfvars.example
│   │   └── scripts/                # Scripts de inicialización
│   │       ├── init-database-automated.sh
│   │       └── init-database-automated.ps1
│   └── database/                   # Scripts SQL de inicialización
│       └── init.sql                # Script unificado (compatible con Docker y Azure)
│
├── test/                           # Tests E2E
└── [archivos de configuración del proyecto]
```

## Capas de la Arquitectura

### 1. Domain (Dominio)
El núcleo del negocio, **sin dependencias externas**. Contiene:
- **Entidades**: Modelos de negocio puros (sin anotaciones de TypeORM)
- **Value Objects**: Objetos inmutables que representan conceptos del dominio (Coordinates, AttendanceType)

### 2. Application (Aplicación)
Orquesta los casos de uso del negocio:
- **Use Cases**: Lógica de aplicación que coordina el dominio
- **DTOs**: Objetos de transferencia de datos entre capas

### 3. Ports (Puertos)
Interfaces que definen las interacciones:
- **Input Ports**: Contratos para adaptadores de entrada (controllers)
- **Output Ports**: Contratos para adaptadores de salida (repositories)

### 4. Adapters (Adaptadores)
Implementaciones concretas:
- **Input Adapters**: REST controllers, GraphQL resolvers, etc.
- **Output Adapters**: TypeORM repositories, APIs externas, etc.

### 5. Infrastructure (Infraestructura)
Configuración y detalles técnicos:
- Entidades de TypeORM para persistencia
- Mappers entre dominio y persistencia
- Configuración de módulos NestJS

## Flujo de Datos

```
HTTP Request
    ↓
[Adaptador de Entrada] → REST Controller
    ↓
[Caso de Uso] → Use Case
    ↓
[Puerto] → Interface (Repository)
    ↓
[Adaptador de Salida] → TypeORM Repository
    ↓
[Infraestructura] → Base de Datos
```

## Organización de Infraestructura

### Infraestructura de Código (`src/infrastructure/`)
- **Configuración de NestJS**: Módulos, providers, inyección de dependencias
- **Entidades de Persistencia**: Entidades TypeORM y mappers
- **Constantes**: Constantes relacionadas con la base de datos

### Infrastructure as Code (`iac/`)
- **Terraform**: Configuración de IaC para desplegar recursos en la nube
- **Scripts SQL**: Scripts de inicialización y migración de base de datos
- **Scripts de deployment**: Scripts para automatizar el despliegue

**Nota**: La carpeta `iac/` (Infrastructure as Code) está fuera de `src/` porque no es código que se ejecute en runtime, sino herramientas y configuraciones para el despliegue. Se usa `iac/` en lugar de `infrastructure/` para evitar confusión con `src/infrastructure/` que contiene configuración de código.

## Ventajas

1. **Independencia del Framework**: El dominio no depende de NestJS o TypeORM
2. **Testabilidad**: Fácil crear mocks de repositorios para tests
3. **Flexibilidad**: Cambiar de TypeORM a otro ORM sin tocar el dominio
4. **Separación de Responsabilidades**: Cada capa tiene una responsabilidad clara
5. **Escalabilidad**: Fácil agregar nuevos adaptadores (GraphQL, gRPC, etc.)
6. **Organización Clara**: Separación entre código de aplicación e infraestructura externa

## Ejemplo de Flujo Completo

### 1. Request HTTP
```typescript
POST /attendance/check-in
{
  "employeeId": 1,
  "type": "check_in",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "recordTime": "2024-01-01T09:00:00Z"
}
```

### 2. Controller (Adaptador de Entrada)
```typescript
@Post('check-in')
async checkIn(@Body() dto: CreateAttendanceDto) {
  return this.checkInUseCase.execute(dto);
}
```

### 3. Use Case (Aplicación)
```typescript
async execute(dto: CreateAttendanceDto): Promise<Attendance> {
  // Validar empleado existe
  const exists = await this.employeeRepository.exists(dto.employeeId);
  
  // Crear entidad de dominio
  const attendance = Attendance.create(...);
  
  // Guardar
  return this.attendanceRepository.save(attendance);
}
```

### 4. Repository (Adaptador de Salida)
```typescript
async save(attendance: Attendance): Promise<Attendance> {
  // Mapear dominio → persistencia
  const entity = AttendanceMapper.toPersistence(attendance);
  
  // Guardar en BD
  const saved = await this.repository.save(entity);
  
  // Mapear persistencia → dominio
  return AttendanceMapper.toDomain(saved);
}
```

## Migración desde Arquitectura Tradicional

Los archivos antiguos en `src/attendance/` y `src/employees/` han sido eliminados. La nueva arquitectura hexagonal está completamente implementada y es la única estructura activa del proyecto.

## Próximos Pasos

- [ ] Agregar tests unitarios para casos de uso
- [ ] Agregar tests de integración para repositorios
- [ ] Agregar validaciones de dominio más robustas
- [ ] Implementar eventos de dominio (Domain Events)
- [ ] Agregar GraphQL adapter como ejemplo de múltiples adaptadores

