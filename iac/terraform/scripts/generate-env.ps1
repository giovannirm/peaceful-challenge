# Script PowerShell para generar archivo .env desde los outputs de Terraform
# Uso: .\generate-env.ps1 [TerraformDir] [OutputFile]
# Ejemplo: .\generate-env.ps1 . ..\..\.env.production

param(
    [string]$TerraformDir = ".",
    [string]$OutputFile = "..\..\.env.azure"
)

Write-Host "=== Generando archivo .env desde Terraform outputs ===" -ForegroundColor Cyan

# Verificar que Terraform este inicializado
$terraformPath = if ($TerraformDir -eq ".") { ".terraform" } else { Join-Path $TerraformDir ".terraform" }
if (-not (Test-Path $terraformPath)) {
    Write-Error "Terraform no esta inicializado. Ejecuta 'terraform init' primero."
    exit 1
}

# Obtener outputs de Terraform
Write-Host "Obteniendo datos de Terraform..." -ForegroundColor Yellow

# Cambiar al directorio de Terraform si es necesario
$originalLocation = Get-Location
if ($TerraformDir -ne ".") {
    Set-Location $TerraformDir
}

$serverFQDN = $null
$databaseName = $null
$serviceBusConnectionString = $null
$serviceBusQueueName = $null

# Intentar obtener desde Terraform outputs
try {
    $serverFQDNOutput = terraform output -raw sql_server_fqdn 2>&1
    if ($serverFQDNOutput -and -not ($serverFQDNOutput -match "Error|Warning|No outputs found")) {
        $serverFQDN = $serverFQDNOutput.Trim()
    }
    
    $databaseNameOutput = terraform output -raw database_name 2>&1
    if ($databaseNameOutput -and -not ($databaseNameOutput -match "Error|Warning|No outputs found")) {
        $databaseName = $databaseNameOutput.Trim()
    }
    
    $serviceBusConnectionStringOutput = terraform output -raw service_bus_connection_string 2>&1
    if ($serviceBusConnectionStringOutput -and -not ($serviceBusConnectionStringOutput -match "Error|Warning|No outputs found")) {
        $serviceBusConnectionString = $serviceBusConnectionStringOutput.Trim()
    }
    
    $serviceBusQueueNameOutput = terraform output -raw service_bus_queue_name 2>&1
    if ($serviceBusQueueNameOutput -and -not ($serviceBusQueueNameOutput -match "Error|Warning|No outputs found")) {
        $serviceBusQueueName = $serviceBusQueueNameOutput.Trim()
    }
} catch {
    Write-Warning "Error al obtener outputs de Terraform: $($_.Exception.Message)"
}

# Si no se obtuvieron los outputs, intentar desde Azure CLI
if (-not $serverFQDN -or -not $databaseName) {
    Write-Host "Outputs de Terraform no disponibles. Intentando obtener desde Azure CLI..." -ForegroundColor Yellow
    
    # Leer terraform.tfvars para obtener el resource group name
    $tfvarsPath = if ($TerraformDir -eq ".") { "terraform.tfvars" } else { Join-Path $TerraformDir "terraform.tfvars" }
    $resourceGroupName = $null
    
    if (Test-Path $tfvarsPath) {
        $tfvarsContent = Get-Content $tfvarsPath -Raw -Encoding UTF8
        if ($tfvarsContent -match 'resource_group_name\s*=\s*"([^"]+)"') {
            $resourceGroupName = $matches[1]
        }
    }
    
    if ($resourceGroupName) {
        try {
            # Obtener el servidor SQL usando Azure CLI
            $sqlServer = az sql server list --resource-group $resourceGroupName --query "[0]" -o json 2>&1 | ConvertFrom-Json
            if ($sqlServer -and $sqlServer.fullyQualifiedDomainName) {
                $serverFQDN = $sqlServer.fullyQualifiedDomainName
                Write-Host "Servidor SQL obtenido desde Azure CLI: $serverFQDN" -ForegroundColor Green
            }
            
            # Obtener el nombre de la base de datos
            if (-not $databaseName) {
                if ($tfvarsContent -match 'database_name\s*=\s*"([^"]+)"') {
                    $databaseName = $matches[1]
                }
            }
        } catch {
            Write-Warning "No se pudo obtener desde Azure CLI: $($_.Exception.Message)"
        }
    }
}

# Volver al directorio original
Set-Location $originalLocation

if (-not $serverFQDN) {
    Write-Warning "No se pudo obtener el servidor SQL desde Terraform o Azure CLI."
    Write-Host ""
    Write-Host "Opciones:" -ForegroundColor Yellow
    Write-Host "1. Ejecuta 'terraform apply' para crear/actualizar los recursos y generar los outputs" -ForegroundColor Cyan
    Write-Host "2. O proporciona manualmente el FQDN del servidor SQL:" -ForegroundColor Cyan
    $serverFQDN = Read-Host "Ingresa el FQDN del servidor SQL (ej: sql-peaceful-xxxxx.database.windows.net)"
    
    if ([string]::IsNullOrWhiteSpace($serverFQDN)) {
        Write-Error "Se requiere el FQDN del servidor SQL para continuar."
        exit 1
    }
}

if (-not $databaseName) {
    Write-Warning "No se pudo obtener el nombre de la base de datos."
    Write-Host "Proporciona manualmente el nombre de la base de datos:" -ForegroundColor Cyan
    $databaseName = Read-Host "Nombre de la base de datos"
    
    if ([string]::IsNullOrWhiteSpace($databaseName)) {
        Write-Error "Se requiere el nombre de la base de datos para continuar."
        exit 1
    }
}

# Obtener credenciales desde terraform.tfvars
$tfvarsPath = if ($TerraformDir -eq ".") { "terraform.tfvars" } else { Join-Path $TerraformDir "terraform.tfvars" }
$username = $null
$password = $null

if (Test-Path $tfvarsPath) {
    # Leer con codificacion UTF-8 para preservar caracteres especiales
    $tfvarsContent = Get-Content $tfvarsPath -Raw -Encoding UTF8
    if ($tfvarsContent -match 'sql_admin_username\s*=\s*"([^"]+)"') {
        $username = $matches[1]
    }
    if ($tfvarsContent -match 'sql_admin_password\s*=\s*"([^"]+)"') {
        $password = $matches[1]
    }
}

if (-not $username -or -not $password) {
    Write-Error "No se pudieron obtener las credenciales de terraform.tfvars. Verifica que el archivo existe y contiene sql_admin_username y sql_admin_password"
    exit 1
}

Write-Host "Servidor SQL: $serverFQDN" -ForegroundColor Green
Write-Host "Base de datos: $databaseName" -ForegroundColor Green
Write-Host "Usuario: $username" -ForegroundColor Green
Write-Host ""
Write-Host "Generando archivo: $OutputFile" -ForegroundColor Yellow

# Generar archivo .env
$serviceBusSection = ""
if ($serviceBusConnectionString -and $serviceBusQueueName) {
    $serviceBusSection = @"

# Configuracion de Azure Service Bus (para notificaciones)
# Valores extraidos de Terraform outputs
AZURE_SERVICE_BUS_CONNECTION_STRING=$serviceBusConnectionString
AZURE_SERVICE_BUS_QUEUE_NAME=$serviceBusQueueName
"@
}

$envContent = @"
# Archivo generado de forma automatica desde Terraform outputs
# Generado el: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
# NO editar manualmente - regenerar con: .\iac\terraform\scripts\generate-env.ps1

# Configuracion de la aplicacion
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# Configuracion de base de datos (Azure SQL)
# Valores extraidos de Terraform outputs
DB_HOST=$serverFQDN
DB_PORT=1433
DB_USERNAME=$username
DB_PASSWORD=$password
DB_DATABASE=$databaseName
DB_ENCRYPT=true
$serviceBusSection
"@

# Escribir con UTF-8 sin BOM para compatibilidad con archivos .env
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
$outputPath = if ([System.IO.Path]::IsPathRooted($OutputFile)) {
    $OutputFile
} else {
    Join-Path (Get-Location) $OutputFile
}
# Asegurar que el directorio existe
$outputDir = Split-Path $outputPath -Parent
if ($outputDir -and -not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
}
[System.IO.File]::WriteAllText($outputPath, $envContent, $utf8NoBom)

Write-Host ""
Write-Host "Archivo generado exitosamente: $OutputFile" -ForegroundColor Green
Write-Host ""
Write-Host "Puedes usarlo con:" -ForegroundColor Cyan
Write-Host "  Copy-Item '$OutputFile' .env" -ForegroundColor White
Write-Host ""
