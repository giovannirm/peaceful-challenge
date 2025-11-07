# Infrastructure as Code - Azure SQL Database

Esta configuración de Terraform crea una instancia de Azure SQL Database para el sistema de control de asistencia (peaceful challenge).

## Requisitos Previos

1. **Azure CLI** instalado y configurado
   ```bash
   az login
   az account set --subscription <tu-subscription-id>
   ```

2. **Terraform** instalado (versión >= 1.0)
   - Descarga desde: https://www.terraform.io/downloads

3. **SQL Server Command Line Utilities** (para ejecutar el script de inicialización)
   - Windows: https://aka.ms/sqlcmdsetup
   - Linux/Mac: Instalar desde repositorio según tu distribución

## Configuración

1. **Copia el archivo de variables de ejemplo:**
   ```bash
   cd iac/terraform
   cp terraform.tfvars.example terraform.tfvars
   ```

2. **Edita `terraform.tfvars`** y completa los valores necesarios:
   - `sql_admin_username`: Nombre de usuario para SQL Server
   - `sql_admin_password`: Contraseña segura (mínimo 8 caracteres, mayúsculas, minúsculas, números y caracteres especiales)
   - `client_ip_address`: (Opcional) Tu IP pública para permitir acceso directo
   
   **⚠️ IMPORTANTE**: Las credenciales configuradas aquí (`sql_admin_username` y `sql_admin_password`) 
   deben ser las mismas que uses en las variables de entorno de la aplicación:
   - `DB_USERNAME` debe coincidir con `sql_admin_username`
   - `DB_PASSWORD` debe coincidir con `sql_admin_password`

3. **Inicializa Terraform:**
   ```bash
   terraform init
   ```

4. **Revisa el plan de ejecución:**
   ```bash
   terraform plan
   ```

5. **Aplica la configuración y genera el `.env` automáticamente:**
   
   **Opción 1: Usando scripts (más fácil)**
   ```powershell
   # Desde la raíz del proyecto
   terraform apply
   cd ../..
   .\scripts.ps1 generate-env
   # O
   npm run generate-env
   ```
   
   Esto ejecutará `terraform apply` y luego generará automáticamente el archivo `.env`.
   
   **Opción 2: Manualmente**
   ```bash
   terraform apply
   ```
   
   Esto creará:
   - Un Resource Group
   - Un SQL Server
   - Una SQL Database
   - Reglas de firewall necesarias
   
   Luego genera el `.env`:
   ```powershell
   # Desde la raíz del proyecto
   .\scripts.ps1 generate-env
   # O
   npm run generate-env
   
   # O desde este directorio:
   .\scripts\generate-env.ps1
   ```
   
   Esto generará el archivo `.env` en la raíz del proyecto con todas las variables necesarias.
   
   **Opción 3: Ver outputs manualmente**
   ```bash
   terraform output sql_server_fqdn
   terraform output database_name
   ```
   
   Luego crea tu archivo `.env` manualmente con estos valores.

7. **Inicializa la base de datos con el esquema:**
   
   Después de que Terraform complete la creación, ejecuta el script de inicialización automatizado:

   **Windows (PowerShell):**
   ```powershell
   .\scripts\init-database-automated.ps1
   ```

   **Linux/Mac (Bash):**
   ```bash
   # En Linux/Mac, puedes usar PowerShell Core (pwsh) para ejecutar los scripts .ps1
   # O adaptar los scripts PowerShell a Bash según tus necesidades
   pwsh -File scripts/init-database-automated.ps1
   ```

   El script automatizado obtiene automáticamente los valores desde Terraform outputs o desde el archivo `.env`. También puedes obtener los valores manualmente desde los outputs de Terraform:
   ```bash
   terraform output -json
   ```

## Variables de Entorno para la Aplicación

Después de crear la infraestructura, **la forma más fácil** es usar el script de generación automática:

```powershell
# Desde la raíz del proyecto
.\scripts.ps1 generate-env
# O
npm run generate-env

# O desde este directorio:
.\scripts\generate-env.ps1
```

Esto generará el archivo `.env` directamente con todas las variables correctas.

**O manualmente**, configura las siguientes variables de entorno:

**⚠️ IMPORTANTE**: Las credenciales (`DB_USERNAME` y `DB_PASSWORD`) **DEBEN coincidir** con las configuradas en `terraform.tfvars`:

```env
DB_HOST=<sql-server-fqdn>  # Obtener con: terraform output sql_server_fqdn
DB_PORT=1433
DB_USERNAME=sqladmin  # DEBE ser igual a sql_admin_username en terraform.tfvars
DB_PASSWORD=TuContraseñaSegura123!@#  # DEBE ser igual a sql_admin_password en terraform.tfvars
DB_DATABASE=peaceful_db  # Obtener con: terraform output database_name
DB_ENCRYPT=true
```

## Outputs

Después de ejecutar `terraform apply`, puedes ver los outputs con:

```bash
terraform output
```

Los outputs incluyen:
- `sql_server_fqdn`: FQDN del servidor SQL
- `database_name`: Nombre de la base de datos
- `connection_string`: Cadena de conexión (sin contraseña)

## Destruir la Infraestructura

Para eliminar todos los recursos creados:

```bash
terraform destroy
```

## Notas Importantes

- ⚠️ **Seguridad**: Nunca commitees el archivo `terraform.tfvars` con contraseñas reales
- 💰 **Costos**: Esta configuración usa el tier **GRATUITO** de Azure SQL Database (Serverless). Cada suscripción incluye hasta 10 bases de datos sin servidor con:
  - 100,000 segundos de núcleo virtual de proceso al mes
  - 32 GB de almacenamiento por mes
  - La oferta se renueva mensualmente y no expira
- 🔒 **Firewall**: Por defecto se permite acceso desde servicios de Azure. Si necesitas acceso desde tu IP, configura `client_ip_address` en `terraform.tfvars`
- 📊 **SKU**: El SKU por defecto es "GP_S_Gen5_1" (Serverless General Purpose, tier gratuito). La base de datos se pausa automáticamente después de 60 minutos de inactividad para ahorrar recursos
- ⏸️ **Auto-pause**: La base de datos Serverless se pausa automáticamente cuando no está en uso. La primera conexión después de pausarse puede tardar unos segundos en reanudarse

## Troubleshooting

### Error de conexión
- Verifica que las reglas de firewall estén configuradas correctamente
- Asegúrate de que tu IP esté permitida si intentas conectarte desde fuera de Azure

### Error al ejecutar init.sql
- Verifica que sqlcmd esté instalado y en el PATH
- Asegúrate de que la contraseña no contenga caracteres especiales que requieran escape
- Verifica que el servidor SQL esté completamente provisionado antes de ejecutar el script

### Error de permisos
- Asegúrate de tener permisos de contribuidor en la suscripción de Azure
- Verifica que la suscripción tenga cuotas disponibles para crear recursos

