# Infrastructure as Code (IaC)

Este directorio contiene toda la configuración de Infrastructure as Code (IaC), separada del código de la aplicación.

## Estructura

```
iac/
├── terraform/          # Infrastructure as Code (Terraform)
│   ├── main.tf         # Recursos principales
│   ├── variables.tf    # Variables de configuración
│   ├── outputs.tf      # Outputs de Terraform
│   └── scripts/        # Scripts de inicialización
│
└── database/           # Scripts SQL
    ├── init-azure.sql  # Script de inicialización para Azure SQL
    └── init.sql        # Script de inicialización genérico
```

## Terraform

Configuración de Infrastructure as Code para Azure SQL Database.

### Uso

1. Navega al directorio de Terraform:
   ```bash
   cd terraform
   ```

2. Configura las variables:
   ```bash
   cp terraform.tfvars.example terraform.tfvars
   # Edita terraform.tfvars con tus valores
   ```

3. Inicializa y aplica:
   ```bash
   terraform init
   terraform plan
   terraform apply
   ```

Para más detalles, consulta [terraform/README.md](terraform/README.md).

## Scripts de Base de Datos

Los scripts SQL están organizados por base de datos o proveedor:

- `init-azure.sql`: Script específico para Azure SQL Database
- `init.sql`: Script genérico (puede requerir ajustes según el proveedor)

### Ejecución

Los scripts de inicialización se ejecutan automáticamente después de crear la infraestructura con Terraform:

```bash
cd terraform
./scripts/init-database-automated.sh
```

O manualmente:

```bash
sqlcmd -S <server-fqdn> -d <database> -U <username> -P <password> -i ../database/init-azure.sql
```

## Organización según Arquitectura Hexagonal

Esta carpeta contiene **infraestructura externa** que no forma parte del código de la aplicación:

- **Terraform**: Configuración de IaC para desplegar recursos en la nube
- **Scripts SQL**: Scripts de inicialización y migración de base de datos
- **Scripts de deployment**: Scripts para automatizar el despliegue

Esta separación asegura que:
- El código de la aplicación (`src/`) no depende de estas herramientas
- La infraestructura puede evolucionar independientemente
- Los diferentes entornos (dev, staging, prod) pueden tener configuraciones diferentes

