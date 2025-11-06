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

# Verificar conectividad con el servidor SQL antes de continuar
Write-Host "`nVerificando conectividad con el servidor SQL..." -ForegroundColor Yellow
try {
    # Intentar hacer un DNS lookup para verificar que el hostname existe
    $dnsResult = Resolve-DnsName -Name $serverFQDN -ErrorAction Stop -Type A
    Write-Host "DNS resuelto correctamente: $($dnsResult[0].IPAddress)" -ForegroundColor Green
} catch {
    Write-Warning "No se pudo resolver el DNS del servidor SQL: $serverFQDN"
    Write-Warning "Esto puede indicar que:"
    Write-Warning "1. El servidor SQL no existe aún (ejecuta 'terraform apply' primero)"
    Write-Warning "2. El nombre del servidor en .env.azure es incorrecto"
    Write-Warning "3. Hay un problema de conectividad de red"
    Write-Host ""
    $continue = Read-Host "¿Deseas continuar de todas formas? (S/N)"
    if ($continue -ne "S" -and $continue -ne "s") {
        Write-Host "Operación cancelada. Ejecuta 'terraform apply' primero para crear el servidor SQL." -ForegroundColor Yellow
        exit 0
    }
}

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
    Write-Error "O puedes inicializar la base de datos manualmente usando Azure Portal o Azure Data Studio."
    exit 1
}

Write-Host "`nEjecutando script de inicializacion..." -ForegroundColor Yellow

try {
    # Intentar conectar primero para verificar credenciales
    Write-Host "Verificando conexión con el servidor..." -ForegroundColor Yellow
    $testQuery = "SELECT 1 AS TestConnection"
    $testResult = sqlcmd -S "$serverFQDN" `
                         -d "$databaseName" `
                         -U "$username" `
                         -P "$password" `
                         -Q "$testQuery" `
                         -l 5 `
                         -C `
                         -b `
                         -W `
                         2>&1
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Red
        Write-Host "ERROR: No se pudo conectar al servidor SQL" -ForegroundColor Red
        Write-Host "========================================" -ForegroundColor Red
        Write-Host ""
        Write-Host "Posibles causas:" -ForegroundColor Yellow
        Write-Host "1. El servidor SQL no existe aún en Azure" -ForegroundColor White
        Write-Host "   → Solución: Ejecuta 'terraform apply' primero para crear los recursos" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "2. Las credenciales son incorrectas" -ForegroundColor White
        Write-Host "   → Verifica el archivo .env.azure o terraform.tfvars" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "3. Tu IP no está permitida en las reglas de firewall" -ForegroundColor White
        Write-Host "   → Verifica las reglas de firewall en Azure Portal" -ForegroundColor Cyan
        Write-Host "   → O ejecuta 'terraform apply' con tu IP actual configurada" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "4. El servidor está en pausa (si es Serverless)" -ForegroundColor White
        Write-Host "   → El servidor se activará automáticamente al conectarse" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Detalles del error:" -ForegroundColor Yellow
        Write-Host $testResult -ForegroundColor Gray
        Write-Host ""
        Write-Host "Puedes inicializar la base de datos más tarde con:" -ForegroundColor Cyan
        Write-Host "  cd iac/terraform" -ForegroundColor White
        Write-Host "  .\scripts\init-database-automated.ps1" -ForegroundColor White
        Write-Host ""
        exit 1
    }
    
    Write-Host "Conexión exitosa. Ejecutando script de inicialización..." -ForegroundColor Green
    
    # Ejecutar el script de inicialización
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
        Write-Error "Verifica que el script SQL no tenga errores y que tengas permisos suficientes."
        exit 1
    }
} catch {
    $errorMessage = $_.Exception.Message
    Write-Error "Error al ejecutar el script SQL: $errorMessage"
    Write-Error ""
    Write-Error "Posibles causas:"
    Write-Error "1. El servidor SQL no existe o no es accesible"
    Write-Error "2. Las credenciales son incorrectas"
    Write-Error "3. Tu IP no está permitida en las reglas de firewall"
    Write-Error "4. El servidor está en pausa (si es Serverless)"
    Write-Error ""
    Write-Error "Solución: Ejecuta 'terraform apply' primero para crear/verificar el servidor SQL."
    exit 1
}
