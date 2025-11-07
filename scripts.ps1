# Script PowerShell para ejecutar comandos comunes del proyecto
# Uso: .\scripts.ps1 <comando>
# Ejemplo: .\scripts.ps1 up

param(
    [Parameter(Mandatory=$true)]
    [string]$Command
)

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

switch ($Command.ToLower()) {
    "up" {
        Write-Info "Construyendo e iniciando servicios..."
        Set-Location docker
        docker-compose -f docker-compose.yml build
        docker-compose -f docker-compose.yml up -d
        Set-Location ..
        Write-Success "✓ Servicios iniciados"
        Write-Success "API disponible en: http://localhost:3000"
    }
    
    "build" {
        Write-Info "Construyendo imágenes Docker..."
        Set-Location docker
        docker-compose -f docker-compose.yml build
        Set-Location ..
    }
    
    "down" {
        Write-Info "Deteniendo servicios..."
        Set-Location docker
        docker-compose -f docker-compose.yml down
        Set-Location ..
    }
    
    "logs" {
        Write-Info "Mostrando logs..."
        Set-Location docker
        docker-compose -f docker-compose.yml logs -f
        Set-Location ..
    }
    
    "clean" {
        Write-Info "Limpiando contenedores y volúmenes..."
        Set-Location docker
        docker-compose -f docker-compose.yml down -v
        Set-Location ..
    }
    
    "terraform-apply" {
        Write-Info "Aplicando configuración de Terraform..."
        Set-Location iac/terraform
        terraform apply
        Set-Location ../..
    }
    
    "generate-env" {
        Write-Info "Generando archivo .env desde Terraform outputs..."
        Set-Location iac/terraform
        if (Test-Path "scripts/generate-env.ps1") {
            & .\scripts\generate-env.ps1 . ..\..\.env
        } else {
            Write-Warning "Script generate-env.ps1 no encontrado"
        }
        Set-Location ../..
        if (Test-Path ".env") {
            Write-Success "✓ Archivo .env generado exitosamente"
        }
    }
    
    "terraform-setup" {
        Write-Info "Aplicando Terraform y generando .env..."
        Set-Location iac/terraform
        terraform apply
        if (Test-Path "scripts/generate-env.ps1") {
            & .\scripts\generate-env.ps1 . ..\..\.env
        }
        Set-Location ../..
        if (Test-Path ".env") {
            Write-Success "✓ Infraestructura creada y .env generado exitosamente"
        }
    }
    
    "setup" {
        Write-Info "Ejecutando configuración completa..."
        if (Test-Path "scripts/setup.ps1") {
            & .\scripts\setup.ps1
        } else {
            Write-Warning "Script setup.ps1 no encontrado"
        }
    }
    
    "start" {
        Write-Info "🚀 Iniciando proceso completo..."
        Write-Info ""
        
        # Ejecutar setup
        if (Test-Path "scripts/setup.ps1") {
            & .\scripts\setup.ps1
        } else {
            Write-Warning "Script setup.ps1 no encontrado, continuando..."
        }
        
        Write-Info ""
        Write-Info "🐳 Levantando aplicación con Docker..."
        Set-Location docker
        docker-compose -f docker-compose.yml build
        docker-compose -f docker-compose.yml up -d
        Set-Location ..
        
        Write-Success "✅ Proceso completado"
        Write-Success "✓ Aplicación disponible en: http://localhost:3000"
        Write-Success "✓ Health check: http://localhost:3000/health"
        Write-Info ""
        Write-Info "💡 Para ver logs: npm run docker:logs"
    }
    
    "help" {
        Write-Host ""
        Write-Host "Comandos disponibles:" -ForegroundColor Green
        Write-Host ""
        Write-Host "  up               - Construir e iniciar servicios" -ForegroundColor Yellow
        Write-Host "  build            - Construir imágenes Docker" -ForegroundColor Yellow
        Write-Host "  down             - Detener todos los servicios" -ForegroundColor Yellow
        Write-Host "  logs             - Ver logs de todos los servicios" -ForegroundColor Yellow
        Write-Host "  clean            - Eliminar contenedores y volúmenes" -ForegroundColor Yellow
        Write-Host "  terraform-apply  - Aplicar configuración de Terraform" -ForegroundColor Yellow
        Write-Host "  generate-env     - Generar archivo .env desde Terraform" -ForegroundColor Yellow
        Write-Host "  terraform-setup  - Aplicar Terraform y generar .env" -ForegroundColor Yellow
        Write-Host "  setup            - Configurar entorno completo (.env, BD, etc.)" -ForegroundColor Yellow
        Write-Host "  start            - Setup completo + levantar aplicación" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Uso: .\scripts.ps1 <comando>" -ForegroundColor Cyan
        Write-Host "Ejemplo: .\scripts.ps1 up" -ForegroundColor Cyan
        Write-Host ""
    }
    
    default {
        Write-Warning "Comando desconocido: $Command"
        Write-Host ""
        Write-Host "Usa '.\scripts.ps1 help' para ver los comandos disponibles" -ForegroundColor Yellow
        exit 1
    }
}
