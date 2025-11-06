# Script PowerShell automatizado para ejecutar init-azure.sql después de Terraform
# Este script lee los outputs de Terraform y ejecuta el script SQL automáticamente

param(
    [string]$TerraformDir = ".",
    [string]$SqlFile = "../database/init-azure.sql"
)

Write-Host "=== Inicialización Automática de Base de Datos ===" -ForegroundColor Cyan

# Verificar que Terraform esté inicializado
if (-not (Test-Path "$TerraformDir/.terraform")) {
    Write-Error "Terraform no está inicializado. Ejecuta 'terraform init' primero."
    exit 1
}

# Verificar que el archivo SQL existe
if (-not (Test-Path $SqlFile)) {
    Write-Error "El archivo SQL no existe: $SqlFile"
    exit 1
}

# Obtener outputs de Terraform
Write-Host "Obteniendo información de Terraform..." -ForegroundColor Yellow

$serverFQDN = terraform -chdir=$TerraformDir output -raw sql_server_fqdn
$databaseName = terraform -chdir=$TerraformDir output -raw database_name

if (-not $serverFQDN -or -not $databaseName) {
    Write-Error "No se pudieron obtener los outputs de Terraform. Asegúrate de que 'terraform apply' se haya ejecutado correctamente."
    exit 1
}

Write-Host "Servidor SQL: $serverFQDN" -ForegroundColor Green
Write-Host "Base de datos: $databaseName" -ForegroundColor Green

# Obtener credenciales desde terraform.tfvars o solicitar al usuario
$tfvarsPath = "$TerraformDir/terraform.tfvars"
$username = $null
$password = $null

if (Test-Path $tfvarsPath) {
    $tfvarsContent = Get-Content $tfvarsPath -Raw
    if ($tfvarsContent -match 'sql_admin_username\s*=\s*"([^"]+)"') {
        $username = $matches[1]
    }
    if ($tfvarsContent -match 'sql_admin_password\s*=\s*"([^"]+)"') {
        $password = $matches[1]
    }
}

if (-not $username) {
    $username = Read-Host "Ingresa el nombre de usuario de SQL Server"
}

if (-not $password) {
    $securePassword = Read-Host "Ingresa la contraseña de SQL Server" -AsSecureString
    $password = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
        [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
    )
}

# Verificar que sqlcmd esté instalado
try {
    $null = Get-Command sqlcmd -ErrorAction Stop
} catch {
    Write-Error "sqlcmd no está instalado. Instala SQL Server Command Line Utilities desde: https://aka.ms/sqlcmdsetup"
    exit 1
}

Write-Host "`nEjecutando script de inicialización..." -ForegroundColor Yellow

try {
    sqlcmd -S "$serverFQDN" `
           -d "$databaseName" `
           -U "$username" `
           -P "$password" `
           -i "$SqlFile" `
           -l 30 `
           -C `
           -b
    
    Write-Host "`n✓ Base de datos inicializada exitosamente!" -ForegroundColor Green
    Write-Host "`nConfigura las siguientes variables de entorno en tu aplicación:" -ForegroundColor Cyan
    Write-Host "DB_HOST=$serverFQDN" -ForegroundColor White
    Write-Host "DB_PORT=1433" -ForegroundColor White
    Write-Host "DB_USERNAME=$username" -ForegroundColor White
    Write-Host "DB_DATABASE=$databaseName" -ForegroundColor White
} catch {
    Write-Error "Error al ejecutar el script SQL: $_"
    exit 1
}

