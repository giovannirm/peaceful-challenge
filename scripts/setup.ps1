# Script para configurar y preparar el entorno completo
# Ejecuta: npm run setup

$ErrorActionPreference = "Stop"

function Write-Info {
    param([string]$Message)
    Write-Host $Message -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host $Message -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host $Message -ForegroundColor Yellow
}

function Write-ErrorMsg {
    param([string]$Message)
    Write-Host $Message -ForegroundColor Red
}

Write-Info "Configurando el entorno completo..."

# Paso 0: Eliminar archivos .env existentes para regenerarlos
Write-Info "Limpiando archivos de entorno anteriores..."
if (Test-Path ".env") {
    Remove-Item ".env" -Force
    Write-Success "Archivo .env eliminado"
}
if (Test-Path ".env.azure") {
    Remove-Item ".env.azure" -Force
    Write-Success "Archivo .env.azure eliminado"
}

# Paso 1: Verificar si existe .env (ahora debería no existir)
if (-not (Test-Path ".env")) {
    Write-Warning "Archivo .env no encontrado"
    
    # Intentar generar desde Terraform
    if (Test-Path "iac/terraform/scripts/generate-env.ps1") {
        Write-Info "Generando .env desde Terraform outputs..."
        Set-Location iac/terraform
        if (Test-Path "scripts/generate-env.ps1") {
            & .\scripts\generate-env.ps1 . ..\..\.env.azure
        }
        Set-Location ../..
        
        if (Test-Path ".env.azure") {
            Copy-Item .env.azure .env
            Write-Success "Archivo .env generado desde Terraform"
        } else {
            Write-Warning "No se pudo generar .env.azure desde Terraform"
            Write-Info "Creando .env desde env.example..."
            if (Test-Path "env.example") {
                Copy-Item env.example .env
                Write-Warning "IMPORTANTE: Edita el archivo .env con tus credenciales de Azure SQL"
            } else {
                Write-ErrorMsg "No se hallo env.example"
                exit 1
            }
        }
    } else {
        Write-Info "Creando .env desde env.example..."
        if (Test-Path "env.example") {
            Copy-Item env.example .env
            Write-Warning "IMPORTANTE: Edita el archivo .env con tus credenciales de Azure SQL"
        } else {
            Write-ErrorMsg "No se encontro env.example"
            exit 1
        }
    }
} else {
    Write-Success "Archivo .env ya existe"
}

# Paso 2: Verificar que Terraform este ejecutado (opcional)
Write-Info "Verificando configuracion de Terraform..."
if (Test-Path "iac/terraform/terraform.tfstate") {
    Write-Success "Terraform ya esta ejecutado"
} else {
    Write-Warning "Terraform no parece estar ejecutado"
    Write-Info "Si todavia no has ejecutado Terraform, ejecuta:"
    Write-Info "   cd iac/terraform"
    Write-Info "   terraform init"
    Write-Info "   terraform apply"
    Write-Info ""
    $response = Read-Host "Quieres continuar de todas formas? (S/N)"
    if ($response -ne "S" -and $response -ne "s") {
        Write-Info "Operacion cancelada"
        exit 0
    }
}

# Paso 3: Inicializar base de datos (opcional, solo si el usuario lo quiere)
Write-Info ""
Write-Info "Inicializacion de base de datos"
Write-Info "   La base de datos se puede inicializar de forma automatica con el esquema"
$initDb = Read-Host "Quieres inicializar la base de datos ahora? (S/N)"

if ($initDb -eq "S" -or $initDb -eq "s") {
    if (Test-Path "iac/terraform/scripts/init-database-automated.ps1") {
        Write-Info "Inicializando base de datos..."
        Set-Location iac/terraform
        try {
            & .\scripts\init-database-automated.ps1
            $initExitCode = $LASTEXITCODE
        } catch {
            $initExitCode = 1
            Write-Warning "Error al ejecutar el script de inicialización: $($_.Exception.Message)"
        }
        Set-Location ../..
        if ($initExitCode -eq 0) {
            Write-Success "Base de datos inicializada exitosamente"
        } else {
            Write-Warning ""
            Write-Warning "La inicialización de la base de datos falló o fue cancelada."
            Write-Warning "Esto es normal si el servidor SQL aún no existe en Azure."
            Write-Info ""
            Write-Info "Para crear el servidor SQL, ejecuta:"
            Write-Info "  cd iac/terraform"
            Write-Info "  terraform apply"
            Write-Info ""
            Write-Info "Luego puedes inicializar la base de datos con:"
            Write-Info "  .\scripts\init-database-automated.ps1"
            Write-Info ""
        }
    } else {
        Write-Warning "Script de inicializacion no encontrado"
        Write-Info "Puedes inicializar manualmente mas tarde con:"
        Write-Info "   cd iac/terraform"
        Write-Info "   .\scripts\init-database-automated.ps1"
    }
} else {
    Write-Info "Omitiendo inicializacion de base de datos"
    Write-Info "Puedes inicializar despues con:"
    Write-Info "   cd iac/terraform"
    Write-Info "   .\scripts\init-database-automated.ps1"
}

Write-Info ""
Write-Success "Configuracion completada"
Write-Info ""
Write-Info "Siguientes pasos:"
Write-Info "   1. Si el servidor SQL no existe aún, ejecuta:"
Write-Info "      cd iac/terraform"
Write-Info "      terraform apply"
Write-Info ""
Write-Info "   2. Si la base de datos no se inicializó, ejecuta:"
Write-Info "      cd iac/terraform"
Write-Info "      .\scripts\init-database-automated.ps1"
Write-Info ""
Write-Info "   3. Verifica que el archivo .env tenga las credenciales correctas"
Write-Info "   4. Ejecuta: npm run docker:up"
Write-Info "   5. O ejecuta: npm run start (hace setup + docker:up)"
Write-Info ""
