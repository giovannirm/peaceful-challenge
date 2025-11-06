# Sistema de Control de Asistencia Laboral

Sistema de control de asistencia laboral desarrollado con NestJS y SQL Server, utilizando Arquitectura Hexagonal y completamente dockerizado.

## Reto Técnico

El objetivo de este reto es desarrollar una API RESTful para gestionar la asistencia de los empleados en una empresa. La API debe permitir registrar entradas y salidas, así como consultar los registros de asistencia.

## Inicio Rápido con Docker 🐳

La forma más rápida de ejecutar el proyecto es usando Docker:

```bash
# Opción 1: Usando npm (recomendado)
npm run docker:up

# Opción 2: Usando PowerShell
.\scripts.ps1 up

# Opción 3: Directamente con docker-compose
cd docker && docker-compose -f docker-compose.yml up --build -d
```

Esto iniciará:
- **SQL Server** en `localhost:1433` (si usas Docker local)
- **API NestJS** en `http://localhost:3000`
- **Health Check** en `http://localhost:3000/health`

**Nota**: Para usar Azure SQL Database, primero configura Terraform y genera el archivo `.env` (ver sección de Infraestructura).

Para más detalles sobre Docker, consulta [DOCKER.md](DOCKER.md).

## Arquitectura

Este proyecto utiliza **Arquitectura Hexagonal (Ports and Adapters)** para una mejor separación de responsabilidades y mantenibilidad.

Para más detalles, consulta [ARCHITECTURE.md](ARCHITECTURE.md).

## Infraestructura como Código (IaC)

Este proyecto incluye configuración de Terraform para crear y gestionar una base de datos Azure SQL Database.

### Configuración de Azure SQL Database

**Opción 1: Usando scripts (Recomendado)**

```bash
# 1. Configura las variables de Terraform
cd iac/terraform
Copy-Item terraform.tfvars.example terraform.tfvars
# Edita terraform.tfvars con tus valores

# 2. Inicializa Terraform
terraform init

# 3. Aplica Terraform
terraform apply

# 4. Genera .env automáticamente
cd ../..
.\scripts.ps1 generate-env
# O
npm run generate-env

# 5. Copia el archivo generado
Copy-Item .env.azure .env
```

**Opción 2: Manualmente**

1. Ve al directorio de Terraform:
   ```bash
   cd iac/terraform
   ```

2. Configura las variables:
   ```bash
   cp terraform.tfvars.example terraform.tfvars
   # Edita terraform.tfvars con tus valores
   ```

3. Inicializa y aplica Terraform:
   ```bash
   terraform init
   terraform plan
   terraform apply
   ```

4. Genera el archivo `.env` automáticamente:
   ```powershell
   # Usando script PowerShell:
   .\scripts.ps1 generate-env
   
   # O usando npm:
   npm run generate-env
   
   # O manualmente:
   cd iac/terraform
   .\scripts\generate-env.ps1
   ```

5. Inicializa la base de datos con el esquema:
   ```powershell
   cd iac/terraform
   .\scripts\init-database-automated.ps1
   ```

Para más detalles, consulta el [README de Terraform](iac/terraform/README.md).