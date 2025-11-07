# Sistema de Control de Asistencia Laboral

Sistema de control de asistencia laboral desarrollado con NestJS y SQL Server, utilizando **Arquitectura Hexagonal** y completamente dockerizado.

## 🚀 Inicio Rápido

### Opción 1: Docker (Recomendado)

```bash
npm run docker:up
```

Esto iniciará:
- **SQL Server** en `localhost:1433` (si usas Docker local)
- **API NestJS** en `http://localhost:3000`
- **Health Check** en `http://localhost:3000/health`

### Opción 2: Desarrollo Local

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp env.example .env
# Edita .env con tus valores

# Iniciar en modo desarrollo
npm run start:dev
```

## 📚 Documentación

- **[Arquitectura](docs/ARCHITECTURE.md)** - Arquitectura Hexagonal y estructura del proyecto
- **[Docker](docs/DOCKER.md)** - Guía completa de Docker y despliegue
- **[Configuración](docs/CONFIG.md)** - Variables de entorno y configuración
- **[Ejemplos de API](docs/API_EXAMPLES.md)** - Ejemplos de uso de la API
- **[Reglas de Desarrollo](docs/DEVELOPMENT_RULES.md)** - Estándares y mejores prácticas
- **[Azure Functions](docs/AZURE_FUNCTIONS.md)** - Integración con Azure Functions para notificaciones

## 🏗️ Infraestructura como Código (IaC)

Este proyecto incluye configuración de Terraform para desplegar recursos en Azure.

### Configuración Rápida de Azure SQL Database

```bash
# 1. Configura Terraform
cd iac/terraform
Copy-Item terraform.tfvars.example terraform.tfvars
# Edita terraform.tfvars con tus valores

# 2. Despliega la infraestructura
terraform init
terraform apply

# 3. Genera el archivo .env automáticamente
cd ../..
npm run generate-env

# 4. Inicializa la base de datos
cd iac/terraform
.\scripts\init-database-automated.ps1
```

Para más detalles, consulta el [README de Terraform](iac/terraform/README.md).

## 🛠️ Scripts Disponibles

```bash
# Docker
npm run docker:up      # Construir e iniciar servicios
npm run docker:down    # Detener servicios
npm run docker:logs    # Ver logs
npm run docker:clean   # Eliminar contenedores y volúmenes

# Desarrollo
npm run start:dev      # Modo desarrollo con hot-reload
npm run start:debug    # Modo debug
npm run start:prod     # Modo producción

# Testing
npm run test           # Tests unitarios
npm run test:e2e       # Tests end-to-end
npm run test:cov       # Coverage

# Utilidades
npm run generate-env   # Generar .env desde Terraform
npm run lint           # Linter
npm run format         # Formatear código
```

## 📋 Características

- ✅ **Arquitectura Hexagonal** - Separación clara de responsabilidades
- ✅ **Dockerizado** - Fácil despliegue y desarrollo
- ✅ **Azure SQL Database** - Soporte para base de datos en la nube
- ✅ **TypeORM** - ORM para SQL Server
- ✅ **Validación** - Validación de datos con class-validator
- ✅ **Swagger** - Documentación automática de la API
- ✅ **Notificaciones** - Integración con Azure Service Bus y Functions
- ✅ **Health Checks** - Endpoint de salud para monitoreo

## 🔧 Tecnologías

- **NestJS** - Framework Node.js
- **TypeScript** - Lenguaje de programación
- **SQL Server** - Base de datos
- **TypeORM** - ORM
- **Docker** - Contenedores
- **Terraform** - Infrastructure as Code
- **Azure** - Cloud provider

## 📖 API Endpoints

### Asistencia

- `POST /attendance/check-in` - Registrar entrada
- `POST /attendance/check-out` - Registrar salida
- `GET /attendance/employee/:id` - Obtener asistencias de un empleado
- `GET /attendance/report/:id` - Generar reporte de asistencia

### Empleados

- `GET /employees` - Listar todos los empleados
- `GET /employees/:id` - Obtener empleado por ID
- `POST /employees` - Crear empleado
- `PATCH /employees/:id` - Actualizar empleado

### Sistema

- `GET /health` - Health check

Para ejemplos detallados, consulta [docs/API_EXAMPLES.md](docs/API_EXAMPLES.md).

## 🏛️ Arquitectura

Este proyecto utiliza **Arquitectura Hexagonal (Ports and Adapters)** para garantizar:

- **Independencia del framework** - El dominio no depende de NestJS
- **Testabilidad** - Fácil creación de mocks y tests
- **Flexibilidad** - Cambiar implementaciones sin afectar el dominio
- **Mantenibilidad** - Código organizado y fácil de entender

Para más detalles, consulta [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## 📝 Reglas de Desarrollo

Este proyecto sigue estrictas reglas de desarrollo:

- ❌ **Prohibición de Magic Strings** - Todas las cadenas deben estar en constantes
- ✅ **Arquitectura Hexagonal** - Respetar las capas y dependencias
- ✅ **Clean Code** - Código limpio y mantenible

Para más detalles, consulta [docs/DEVELOPMENT_RULES.md](docs/DEVELOPMENT_RULES.md).

## 🔐 Variables de Entorno

Las variables de entorno se configuran en el archivo `.env`. Consulta `env.example` para ver todas las variables disponibles.

Para más detalles sobre la configuración, consulta [docs/CONFIG.md](docs/CONFIG.md).

## 📦 Estructura del Proyecto

```
.
├── src/                    # Código fuente
│   ├── attendance/         # Módulo de asistencia
│   ├── employees/          # Módulo de empleados
│   └── shared/             # Código compartido
├── docs/                   # Documentación
├── docker/                 # Configuración Docker
├── iac/                    # Infrastructure as Code
│   ├── terraform/          # Configuración Terraform
│   └── database/           # Scripts SQL
├── test/                   # Tests E2E
└── azure-functions/        # Azure Functions
```

## 🤝 Contribuir

1. Lee las [Reglas de Desarrollo](docs/DEVELOPMENT_RULES.md)
2. Asegúrate de que los tests pasen: `npm run test`
3. Verifica el linter: `npm run lint`
4. Formatea el código: `npm run format`

## 📄 Licencia

UNLICENSED
