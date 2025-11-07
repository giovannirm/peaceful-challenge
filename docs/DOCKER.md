# Dockerización del Proyecto

Este proyecto está completamente dockerizado para facilitar el despliegue en producción.

## Estructura Docker

```
.
├── docker/
│   ├── Dockerfile              # Imagen de producción (multi-stage build)
│   ├── docker-compose.yml      # Configuración para producción
│   └── .dockerignore           # Archivos a ignorar en el build
└── scripts.ps1                 # Scripts PowerShell para Windows
```

## Requisitos Previos

- Docker Desktop instalado (Windows/Mac) o Docker Engine (Linux)
- Docker Compose v2 o superior
- Archivo `.env` configurado (ver [CONFIG.md](CONFIG.md))

## Inicio Rápido

```bash
# Opción 1: Usando npm (recomendado)
npm run docker:up

# Opción 2: Usando PowerShell
.\scripts.ps1 up

# Opción 3: Usando docker-compose directamente
cd docker && docker-compose -f docker-compose.yml up --build -d
```

Esto iniciará:
- **SQL Server** en `localhost:1433` (si usas Docker local)
- **Aplicación NestJS** en `localhost:3000`
- **Health Check** en `http://localhost:3000/health`

**Nota**: Para usar Azure SQL Database, configura primero Terraform y genera el archivo `.env`.

## Comandos Útiles

### Usando npm

```bash
npm run docker:up      # Construir e iniciar servicios
npm run docker:down    # Detener servicios
npm run docker:logs    # Ver logs
npm run docker:clean   # Eliminar contenedores y volúmenes
```

### Usando PowerShell

```powershell
.\scripts.ps1 help      # Ver todos los comandos disponibles
.\scripts.ps1 build     # Construir las imágenes Docker
.\scripts.ps1 up        # Construir e iniciar servicios
.\scripts.ps1 down      # Detener todos los servicios
.\scripts.ps1 logs      # Ver logs de todos los servicios
.\scripts.ps1 clean     # Eliminar contenedores y volúmenes
```

### Usando Docker Compose directamente

```bash
cd docker && docker-compose -f docker-compose.yml up -d
cd docker && docker-compose -f docker-compose.yml logs -f
cd docker && docker-compose -f docker-compose.yml down
cd docker && docker-compose -f docker-compose.yml down -v  # Con volúmenes
```

## Configuración

### Variables de Entorno

El proyecto usa variables de entorno para la configuración. Crea un archivo `.env` basado en `env.example`:

```bash
cp env.example .env
```

#### Para Azure SQL Database (Recomendado)

Después de ejecutar Terraform, genera automáticamente el archivo `.env`:

```powershell
npm run generate-env
# O
.\scripts.ps1 generate-env
```

Esto generará el archivo `.env` directamente con los valores correctos.

#### Para Docker Local (Opcional)

Si prefieres usar SQL Server local en Docker, edita `.env`:

```env
DB_HOST=db
DB_PORT=1433
DB_USERNAME=sa
DB_PASSWORD=YourStrong@Passw0rd
DB_DATABASE=peaceful_db
DB_ENCRYPT=false
```

## Servicios

### 1. Base de Datos (db) - Opcional
- **Imagen**: `mcr.microsoft.com/mssql/server:2022-latest`
- **Puerto**: `1433`
- **Usuario**: `sa`
- **Contraseña**: Configurada en `.env` (variable `DB_PASSWORD`)
- **Volumen**: Persistencia de datos en `sqlserver_data`
- **Nota**: Este servicio solo se usa si configuras Docker local. Para Azure SQL, comenta o elimina este servicio.

### 2. Inicialización de BD (db-init)
- **Imagen**: `mcr.microsoft.com/mssql-tools:latest`
- **Función**: Crea la base de datos y ejecuta `init.sql`
- **Se ejecuta**: Una vez al iniciar los servicios

### 3. Aplicación NestJS (app)
- **Puerto**: `3000`
- **Health Check**: `http://localhost:3000/health`
- **Imagen**: Optimizada multi-stage para producción

## Estructura de Redes

Todos los servicios están en la red `peaceful-network`:
- La aplicación se conecta a la BD usando el nombre del servicio: `db`
- Los servicios se comunican internamente sin exponer puertos

## Volúmenes

- `sqlserver_data`: Persistencia de datos de SQL Server (solo si usas Docker local)

## Inicialización de Base de Datos

La base de datos se inicializa automáticamente al iniciar los servicios:

1. Se crea la base de datos `peaceful_db` si no existe
2. Se ejecuta el script `iac/database/init.sql`
3. Se crean las tablas y se insertan datos iniciales

### Ejecutar Inicialización Manualmente

```powershell
# Si necesitas reinicializar la BD, ejecuta directamente:
cd docker
docker-compose -f docker-compose.yml exec db /opt/mssql-tools/bin/sqlcmd `
  -S localhost -U $env:DB_USERNAME -P $env:DB_PASSWORD `
  -d $env:DB_DATABASE -i /docker-entrypoint-initdb.d/init.sql
```

## Troubleshooting

### La base de datos no inicia

```powershell
# Ver logs de la BD
cd docker
docker-compose -f docker-compose.yml logs db

# Verificar que el contenedor esté corriendo
docker-compose -f docker-compose.yml ps

# Reiniciar solo la BD
docker-compose -f docker-compose.yml restart db
```

### La aplicación no se conecta a la BD

1. Verifica que la BD esté healthy:
   ```powershell
   cd docker
   docker-compose -f docker-compose.yml ps
   ```

2. Verifica las variables de entorno:
   ```powershell
   cd docker
   docker-compose -f docker-compose.yml exec app env | Select-String "DB_"
   ```

3. Prueba la conexión desde el contenedor:
   ```powershell
   cd docker
   docker-compose -f docker-compose.yml exec app sh
   # Dentro del contenedor:
   ping db
   ```

### Limpiar todo y empezar de nuevo

```powershell
# Eliminar contenedores, volúmenes y redes
npm run docker:clean
# O
.\scripts.ps1 clean

# Eliminar también las imágenes
cd docker
docker-compose -f docker-compose.yml down -v --rmi all
```

### Ver logs en tiempo real

```powershell
# Todos los servicios
npm run docker:logs
# O
.\scripts.ps1 logs

# Solo la aplicación
cd docker
docker-compose -f docker-compose.yml logs -f app

# Solo la base de datos
cd docker
docker-compose -f docker-compose.yml logs -f db
```

## Producción

El `Dockerfile` usa un build multi-stage que optimiza el tamaño de la imagen:

```powershell
cd docker
docker build -f Dockerfile -t peaceful-app:latest ..
docker run -p 3000:3000 --env-file ..\.env peaceful-app:latest
```

## Integración con Azure SQL

Para usar Azure SQL Database en lugar de SQL Server local:

1. Configura Terraform (ver [README.md](../README.md#infraestructura-como-código-iac))

2. Genera el archivo `.env` automáticamente:
   ```powershell
   npm run generate-env
   # O
   .\scripts.ps1 generate-env
   ```

3. El archivo `.env` se genera automáticamente.

4. Opcionalmente, comenta o elimina el servicio `db` en `docker-compose.yml` si solo usas Azure SQL.

## Próximos Pasos

- [ ] Agregar CI/CD con Docker
- [ ] Configurar Docker Swarm o Kubernetes
- [ ] Agregar monitoreo (Prometheus, Grafana)
- [ ] Configurar backup automático de la BD

