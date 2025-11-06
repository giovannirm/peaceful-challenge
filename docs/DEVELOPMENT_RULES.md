# Reglas de Desarrollo

Este documento establece las reglas fundamentales que deben seguirse en todo el desarrollo del proyecto.

## 🚫 Prohibición de Magic Strings

**NUNCA uses strings literales directamente en el código.** Todas las cadenas de texto deben estar centralizadas en archivos de constantes.

### Reglas:

1. **Todas las cadenas de texto deben estar en archivos de constantes**
   - ❌ `'check_in'`, `'check_out'`, `'employees'`, `'attendance'`
   - ✅ `ATTENDANCE_TYPE.CHECK_IN`, `API_ROUTES.EMPLOYEES.BASE`

2. **Ubicación de constantes según la capa:**
   - **Dominio**: `src/domain/constants/` - Solo constantes de lógica de negocio
   - **Infraestructura**: `src/infrastructure/constants/` - Constantes técnicas (entornos, protocolos, tipos de DB)
   - **Adapters (REST)**: `src/adapters/input/rest/` - Rutas, query params, Swagger
   - **Terraform**: `iac/terraform/locals.tf` - Valores hardcodeados en IaC

3. **Tipos de constantes:**
   - Rutas de API → `routes.constants.ts`
   - Query parameters → `query-params.constants.ts`
   - Configuración Swagger → `swagger.constants.ts`
   - Mensajes de error → `error-messages.constants.ts`
   - Constantes de negocio → `business.constants.ts`
   - Nombres de tablas/columnas DB → `database.constants.ts`

4. **Excepciones permitidas:**
   - Valores de ejemplo en decoradores `@ApiProperty` (solo para documentación)
   - Logs de desarrollo/debug (pero preferible usar constantes también)

### Ejemplo de violación:

```typescript
// ❌ INCORRECTO
@Controller('attendance')
export class AttendanceController {
  @Get('report/:id')
  getReport(@Query('startDate') startDate: string) {
    if (attendance.type === 'check_in') {
      // ...
    }
  }
}
```

### Ejemplo correcto:

```typescript
// ✅ CORRECTO
import { API_ROUTES } from './routes.constants';
import { QUERY_PARAMS } from './query-params.constants';
import { AttendanceType } from '../../../domain/value-objects/attendance-type.vo';

@Controller(API_ROUTES.ATTENDANCE.BASE)
export class AttendanceController {
  @Get(API_ROUTES.ATTENDANCE.REPORT)
  getReport(@Query(QUERY_PARAMS.START_DATE) startDate: string) {
    if (attendance.type === AttendanceType.CHECK_IN) {
      // ...
    }
  }
}
```

## 🏗️ Arquitectura Hexagonal (Ports and Adapters)

**Siempre respeta la arquitectura hexagonal.** El dominio NO debe depender de infraestructura.

### Reglas:

1. **Flujo de dependencias (de afuera hacia adentro):**
   ```
   Adapters (Input/Output) → Application → Domain
   Infrastructure → Application → Domain
   ```

2. **El dominio es independiente:**
   - ❌ NO importar nada de `infrastructure/` o `adapters/` en `domain/`
   - ❌ NO usar decoradores de NestJS en entidades de dominio
   - ✅ El dominio solo define interfaces (ports) que otros implementan

3. **Estructura de capas:**

   **Domain (Núcleo):**
   - `entities/` - Entidades de negocio
   - `value-objects/` - Objetos de valor
   - `services/` - Servicios de dominio
   - `exceptions/` - Excepciones de dominio
   - `constants/` - Constantes de negocio
   - `ports/` - Interfaces (puertos)

   **Application:**
   - `use-cases/` - Casos de uso
   - `dto/` - Data Transfer Objects
   - `config/` - Configuración de aplicación (tokens DI)

   **Infrastructure:**
   - `persistence/` - Implementaciones de repositorios
   - `queues/` - Implementaciones de colas
   - `config/` - Configuración técnica
   - `constants/` - Constantes técnicas

   **Adapters:**
   - `input/rest/` - Controladores REST
   - `output/persistence/` - Implementaciones de repositorios (TypeORM)

4. **Dependency Injection:**
   - Los tokens de DI deben estar en `application/config/dependency-injection.tokens.ts`
   - Los módulos de NestJS están en `infrastructure/config/`
   - Los casos de uso inyectan puertos (interfaces), no implementaciones

5. **Ejemplo de violación:**

```typescript
// ❌ INCORRECTO - El dominio depende de infraestructura
import { Injectable } from '@nestjs/common';
import { TypeOrmRepository } from '../../infrastructure/persistence/typeorm-repository';

@Injectable()
export class Employee {
  constructor(private repository: TypeOrmRepository) {}
}
```

6. **Ejemplo correcto:**

```typescript
// ✅ CORRECTO - El dominio define la interfaz
// domain/ports/output/employee.repository.port.ts
export interface IEmployeeRepository {
  findById(id: number): Promise<Employee | null>;
}

// infrastructure/persistence/typeorm-employee.repository.ts
@Injectable()
export class TypeOrmEmployeeRepository implements IEmployeeRepository {
  // implementación
}

// application/use-cases/get-employee.use-case.ts
@Injectable()
export class GetEmployeeUseCase {
  constructor(
    @Inject(DEPENDENCY_INJECTION_TOKENS.EMPLOYEE_REPOSITORY)
    private readonly employeeRepository: IEmployeeRepository, // Puerto, no implementación
  ) {}
}
```

## 📋 Checklist antes de hacer commit

Antes de hacer commit, verifica:

- [ ] ¿Hay algún string literal en el código? → Mover a constantes
- [ ] ¿El dominio importa algo de infrastructure/adapters? → Refactorizar
- [ ] ¿Los casos de uso inyectan interfaces o implementaciones? → Debe ser interfaces
- [ ] ¿Las constantes están en la capa correcta? → Verificar ubicación
- [ ] ¿Los DTOs están en `application/`? → Sí, agrupados por feature
- [ ] ¿Los tokens de DI están en `application/config/`? → Sí

## 🔍 Cómo verificar

```bash
# Buscar posibles magic strings (ajustar según necesidad)
grep -r "'[a-z_]*'" src/ --exclude-dir=node_modules | grep -v "example\|Example\|TODO\|FIXME"

# Verificar imports del dominio
grep -r "from.*infrastructure\|from.*adapters" src/domain/
```

## 📚 Referencias

- [Arquitectura Hexagonal](https://alistair.cockburn.us/hexagonal-architecture/)
- [Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

