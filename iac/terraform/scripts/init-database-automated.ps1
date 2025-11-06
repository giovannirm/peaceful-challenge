# Script PowerShell automatizado para ejecutar init.sql despues de Terraform
# Este script lee los outputs de Terraform y ejecuta el script SQL de forma automatica

param(
    [string]$TerraformDir = ".",
    [string]$SqlFile = "../database/init.sql"
)

Write-Host "=== Inicializacion Automatica de Base de Datos ===" -ForegroundColor Cyan

# Verificar que Terraform este inicializado
$terraformPath = if ($TerraformDir -eq ".") { ".terraform" } else { Join-Path $TerraformDir ".terraform" }
if (-not (Test-Path $terraformPath)) {
    Write-Error "Terraform no esta inicializado. Ejecuta 'terraform init' primero."
    exit 1
}

# Verificar que el archivo SQL existe
if (-not (Test-Path $SqlFile)) {
    Write-Error "El archivo SQL no existe: $SqlFile"
    exit 1
}

# Guardar ubicacion original
$originalLocation = Get-Location

# Intentar obtener datos desde .env.azure primero (mas confiable)
$serverFQDN = $null
$databaseName = $null

# Buscar .env.azure en la raiz del proyecto (dos niveles arriba desde iac/terraform)
$envAzurePath = Join-Path $originalLocation "..\..\.env.azure"
$envAzurePath = (Resolve-Path $envAzurePath -ErrorAction SilentlyContinue).Path
if (-not $envAzurePath) {
    # Si no se encuentra, intentar en el directorio actual
    $envAzurePath = Join-Path $originalLocation ".env.azure"
}
if (Test-Path $envAzurePath) {
    Write-Host "Leyendo configuracion desde .env.azure..." -ForegroundColor Yellow
    $envContent = Get-Content $envAzurePath -Raw -Encoding UTF8
    if ($envContent -match 'DB_HOST\s*=\s*([^\r\n]+)') {
        $serverFQDN = $matches[1].Trim()
    }
    if ($envContent -match 'DB_DATABASE\s*=\s*([^\r\n]+)') {
        $databaseName = $matches[1].Trim()
    }
}

# Si no se encontraron en .env.azure, intentar desde Terraform outputs
if (-not $serverFQDN -or -not $databaseName) {
    Write-Host "Obteniendo datos de Terraform..." -ForegroundColor Yellow
    
    # Cambiar al directorio de Terraform si es necesario
    $terraformWorkingDir = if ($TerraformDir -eq ".") { Get-Location } else { $TerraformDir }
    if (-not (Test-Path $terraformWorkingDir)) {
        Write-Error "Directorio de Terraform no encontrado: $terraformWorkingDir"
        exit 1
    }
    
    Set-Location $terraformWorkingDir
    
    # Ejecutar terraform output y capturar correctamente
    try {
        if (-not $serverFQDN) {
            $serverFQDNOutput = terraform output -raw sql_server_fqdn 2>&1
            if ($serverFQDNOutput -and -not ($serverFQDNOutput -match "Warning|Error|No outputs found")) {
                $serverFQDN = $serverFQDNOutput.Trim()
            }
        }
        
        if (-not $databaseName) {
            $databaseNameOutput = terraform output -raw database_name 2>&1
            if ($databaseNameOutput -and -not ($databaseNameOutput -match "Warning|Error|No outputs found")) {
                $databaseName = $databaseNameOutput.Trim()
            }
        }
    } catch {
        Write-Warning "Error al obtener outputs de Terraform: $($_.Exception.Message)"
    }
    
    # Volver al directorio original
    Set-Location $originalLocation
}

# Verificar que tengamos los valores necesarios
if ([string]::IsNullOrWhiteSpace($serverFQDN)) {
    Write-Error "No se pudo obtener el servidor SQL. Verifica que:"
    Write-Error "1. El archivo .env.azure existe y tiene DB_HOST configurado"
    Write-Error "2. O ejecuta 'terraform refresh' y 'terraform apply' para actualizar los outputs"
    exit 1
}

if ([string]::IsNullOrWhiteSpace($databaseName)) {
    Write-Error "No se pudo obtener el nombre de la base de datos. Verifica que:"
    Write-Error "1. El archivo .env.azure existe y tiene DB_DATABASE configurado"
    Write-Error "2. O ejecuta 'terraform refresh' y 'terraform apply' para actualizar los outputs"
    exit 1
}

Write-Host "Servidor SQL: $serverFQDN" -ForegroundColor Green
Write-Host "Base de datos: $databaseName" -ForegroundColor Green

# Obtener credenciales desde .env.azure, terraform.tfvars o solicitar al usuario
$username = $null
$password = $null

# Primero intentar leer desde .env.azure (usar la misma ruta que ya encontramos)
if ($envAzurePath -and (Test-Path $envAzurePath)) {
    Write-Host "Leyendo credenciales desde .env.azure..." -ForegroundColor Yellow
    # Leer con codificacion UTF-8 para preservar caracteres especiales
    $envContent = Get-Content $envAzurePath -Raw -Encoding UTF8
    if ($envContent -match 'DB_USERNAME\s*=\s*([^\r\n]+)') {
        $username = $matches[1].Trim()
    }
    if ($envContent -match 'DB_PASSWORD\s*=\s*([^\r\n]+)') {
        $password = $matches[1].Trim()
    }
    if ($username -and $password) {
        Write-Host "Credenciales encontradas en .env.azure" -ForegroundColor Green
    }
}

# Si no se encontraron en .env.azure, intentar desde terraform.tfvars
if (-not $username -or -not $password) {
    # Cambiar al directorio de Terraform para leer terraform.tfvars
    if ($TerraformDir -ne ".") {
        Set-Location $TerraformDir
    }
    $tfvarsPath = "terraform.tfvars"
    if (Test-Path $tfvarsPath) {
        Write-Host "Leyendo credenciales desde terraform.tfvars..." -ForegroundColor Yellow
        # Leer con codificacion UTF-8 para preservar caracteres especiales
        $tfvarsContent = Get-Content $tfvarsPath -Raw -Encoding UTF8
        if (-not $username -and $tfvarsContent -match 'sql_admin_username\s*=\s*"([^"]+)"') {
            $username = $matches[1]
        }
        if (-not $password -and $tfvarsContent -match 'sql_admin_password\s*=\s*"([^"]+)"') {
            $password = $matches[1]
        }
        if ($username -and $password) {
            Write-Host "Credenciales encontradas en terraform.tfvars" -ForegroundColor Green
        }
    }
    # Volver al directorio original
    Set-Location $originalLocation
}

# Si aun no se encontraron, solicitar al usuario
if (-not $username) {
    $username = Read-Host "Ingresa el nombre de usuario de SQL Server"
}

if (-not $password) {
    $securePassword = Read-Host "Ingresa la contrasena de SQL Server" -AsSecureString
    $password = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
        [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
    )
}

# Verificar que sqlcmd este instalado
try {
    $null = Get-Command sqlcmd -ErrorAction Stop
} catch {
    Write-Error "sqlcmd no esta instalado. Instala SQL Server Command Line Utilities desde: https://aka.ms/sqlcmdsetup"
    exit 1
}

Write-Host "`nEjecutando script de inicializacion..." -ForegroundColor Yellow

try {
    sqlcmd -S "$serverFQDN" `
           -d "$databaseName" `
           -U "$username" `
           -P "$password" `
           -i "$SqlFile" `
           -l 30 `
           -C `
           -b
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`nBase de datos inicializada exitosamente!" -ForegroundColor Green
        Write-Host "`nConfigura las siguientes variables de entorno en tu aplicacion:" -ForegroundColor Cyan
        Write-Host "DB_HOST=$serverFQDN" -ForegroundColor White
        Write-Host "DB_PORT=1433" -ForegroundColor White
        Write-Host "DB_USERNAME=$username" -ForegroundColor White
        Write-Host "DB_DATABASE=$databaseName" -ForegroundColor White
    } else {
        Write-Error "Error al ejecutar el script SQL. Codigo de salida: $LASTEXITCODE"
        exit 1
    }
} catch {
    $errorMessage = $_.Exception.Message
    Write-Error "Error al ejecutar el script SQL: $errorMessage"
    exit 1
}
