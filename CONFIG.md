# Configuración de Variables de Entorno

Este proyecto centraliza todas las variables de entorno en un servicio de configuración para mantener la consistencia y facilitar el mantenimiento.

## Estructura de Configuración

### Servicio de Configuración

El servicio `AppConfigService` está ubicado en:
```
src/infrastructure/config/config.service.ts
```

Este servicio proporciona acceso tipado a todas las variables de entorno del proyecto.

### Variables de Entorno Disponibles

| Variable | Descripción | Valor por Defecto |
|----------|-------------|-------------------|
| `NODE_ENV` | Entorno de ejecución | `development` |
| `PORT` | Puerto de la aplicación | `3000` |
| `HOST` | Host donde se ejecuta la aplicación | `localhost` |
| `DB_HOST` | Host de la base de datos | `localhost` |
| `DB_PORT` | Puerto de la base de datos | `1433` |
| `DB_USERNAME` | Usuario de la base de datos | `sa` |
| `DB_PASSWORD` | Contraseña de la base de datos | *(vacío)* |
| `DB_DATABASE` | Nombre de la base de datos | `peaceful_db` |
| `DB_ENCRYPT` | Habilitar encriptación (Azure SQL) | `false` |

## Uso en el Código

### Obtener el Servicio de Configuración

```typescript
import { AppConfigService } from './infrastructure/config/config.service';

constructor(private configService: AppConfigService) {}

// Acceder a variables
const port = this.configService.port;
const dbHost = this.configService.dbHost;
```

### Propiedades Disponibles

```typescript
// Aplicación
configService.nodeEnv    // string
configService.port       // number
configService.host       // string

// Base de datos
configService.dbHost     // string
configService.dbPort     // number
configService.dbUsername // string
configService.dbPassword // string
configService.dbDatabase // string
configService.dbEncrypt  // boolean

// Configuración completa de TypeORM
configService.typeOrmConfig // objeto completo para TypeORM
```

## Archivos de Configuración

Crea un archivo `.env` basado en `env.example`:

```bash
cp env.example .env
```

## Configuración

### Azure SQL Database (Recomendado)

Para usar Azure SQL Database, genera automáticamente el archivo `.env` desde Terraform:

```powershell
# Después de ejecutar terraform apply
npm run generate-env
# O
.\scripts.ps1 generate-env

# Esto creará .env.azure, luego cópialo:
Copy-Item .env.azure .env
```

El archivo generado contendrá:

```env
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

DB_HOST=sql-peaceful-xxxxx.database.windows.net
DB_PORT=1433
DB_USERNAME=sqladmin  # Coincide con sql_admin_username en terraform.tfvars
DB_PASSWORD=TuContraseñaSegura123!@#  # Coincide con sql_admin_password en terraform.tfvars
DB_DATABASE=peaceful_db
DB_ENCRYPT=true
```

### Docker Local (Opcional)

Si prefieres usar SQL Server local en Docker, edita `.env`:

```env
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

DB_HOST=db
DB_PORT=1433
DB_USERNAME=sa
DB_PASSWORD=YourStrong@Passw0rd
DB_DATABASE=peaceful_db
DB_ENCRYPT=false
```

## Docker Compose

El archivo `docker-compose.yml` está configurado para leer automáticamente el archivo `.env` desde la raíz del proyecto.

Las variables se cargan automáticamente usando `env_file` en cada servicio.

## Prioridad de Carga

1. Variables de entorno del sistema
2. `.env.production` (si existe)
3. `.env` (si existe)

## Seguridad

⚠️ **Importante**: Los archivos `.env*` están en `.gitignore` y **nunca** deben ser commitados al repositorio.

Solo los archivos `*.example` deben estar en el repositorio como plantillas.

