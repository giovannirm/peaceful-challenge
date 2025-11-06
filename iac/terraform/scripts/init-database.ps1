# Script PowerShell para ejecutar el script SQL de inicialización en Azure SQL Database
# Uso: .\init-database.ps1 -ServerFQDN <server-fqdn> -DatabaseName <database-name> -Username <username> -Password <password> -SqlFile <sql-file>

param(
    [Parameter(Mandatory=$true)]
    [string]$ServerFQDN,
    
    [Parameter(Mandatory=$true)]
    [string]$DatabaseName,
    
    [Parameter(Mandatory=$true)]
    [string]$Username,
    
    [Parameter(Mandatory=$true)]
    [string]$Password,
    
    [Parameter(Mandatory=$true)]
    [string]$SqlFile
)

if (-not (Test-Path $SqlFile)) {
    Write-Error "El archivo SQL no existe: $SqlFile"
    exit 1
}

Write-Host "Conectando a Azure SQL Database..." -ForegroundColor Green
Write-Host "Servidor: $ServerFQDN"
Write-Host "Base de datos: $DatabaseName"

# Verificar si sqlcmd está instalado
try {
    $null = Get-Command sqlcmd -ErrorAction Stop
} catch {
    Write-Error "sqlcmd no está instalado. Instala SQL Server Command Line Utilities desde: https://aka.ms/sqlcmdsetup"
    exit 1
}

# Construir la cadena de conexión
$connectionString = "Server=tcp:$ServerFQDN,1433;Initial Catalog=$DatabaseName;User ID=$Username;Password=$Password;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;"

try {
    # Ejecutar el script SQL
    sqlcmd -S "$ServerFQDN" `
           -d "$DatabaseName" `
           -U "$Username" `
           -P "$Password" `
           -i "$SqlFile" `
           -l 30 `
           -C
    
    Write-Host "Script SQL ejecutado exitosamente" -ForegroundColor Green
} catch {
    Write-Error "Error al ejecutar el script SQL: $_"
    exit 1
}

