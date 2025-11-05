# Sistema de Control de Asistencia Laboral

Sistema de control de asistencia laboral desarrollado con NestJS y SQL Server.

## Reto Técnico

El objetivo de este reto es desarrollar una API RESTful para gestionar la asistencia de los empleados en una empresa. La API debe permitir registrar entradas y salidas, así como consultar los registros de asistencia.

## Infraestructura como Código (IaC)

Este proyecto incluye configuración de Terraform para crear y gestionar una base de datos Azure SQL Database.

### Configuración de Azure SQL Database

Para crear la infraestructura en Azure:

1. Ve al directorio de Terraform:
   ```bash
   cd infrastructure/terraform
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

4. Inicializa la base de datos con el esquema:
   
   **Windows:**
   ```powershell
   .\scripts\init-database-automated.ps1
   ```
   
   **Linux/Mac:**
   ```bash
   chmod +x scripts/init-database-automated.sh
   ./scripts/init-database-automated.sh
   ```

Para más detalles, consulta el [README de Terraform](infrastructure/terraform/README.md).