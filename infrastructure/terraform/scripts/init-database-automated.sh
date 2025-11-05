#!/bin/bash

# Script Bash automatizado para ejecutar init-azure.sql después de Terraform
# Este script lee los outputs de Terraform y ejecuta el script SQL automáticamente

set -e

TERRAFORM_DIR="${1:-.}"
SQL_FILE="${2:-../../database/init-azure.sql}"

echo "=== Inicialización Automática de Base de Datos ==="

# Verificar que Terraform esté inicializado
if [ ! -d "$TERRAFORM_DIR/.terraform" ]; then
    echo "Error: Terraform no está inicializado. Ejecuta 'terraform init' primero."
    exit 1
fi

# Verificar que el archivo SQL existe
if [ ! -f "$SQL_FILE" ]; then
    echo "Error: El archivo SQL no existe: $SQL_FILE"
    exit 1
fi

# Obtener outputs de Terraform
echo "Obteniendo información de Terraform..."
cd "$TERRAFORM_DIR"

SERVER_FQDN=$(terraform output -raw sql_server_fqdn 2>/dev/null || echo "")
DATABASE_NAME=$(terraform output -raw database_name 2>/dev/null || echo "")

if [ -z "$SERVER_FQDN" ] || [ -z "$DATABASE_NAME" ]; then
    echo "Error: No se pudieron obtener los outputs de Terraform."
    echo "Asegúrate de que 'terraform apply' se haya ejecutado correctamente."
    exit 1
fi

echo "Servidor SQL: $SERVER_FQDN"
echo "Base de datos: $DATABASE_NAME"

# Intentar obtener credenciales desde terraform.tfvars
USERNAME=""
PASSWORD=""

if [ -f "terraform.tfvars" ]; then
    USERNAME=$(grep -E '^sql_admin_username\s*=' terraform.tfvars | sed -E 's/^[^"]*"([^"]+)".*/\1/' || echo "")
    PASSWORD=$(grep -E '^sql_admin_password\s*=' terraform.tfvars | sed -E 's/^[^"]*"([^"]+)".*/\1/' || echo "")
fi

# Solicitar credenciales si no se encontraron
if [ -z "$USERNAME" ]; then
    read -p "Ingresa el nombre de usuario de SQL Server: " USERNAME
fi

if [ -z "$PASSWORD" ]; then
    read -sp "Ingresa la contraseña de SQL Server: " PASSWORD
    echo
fi

# Verificar que sqlcmd esté instalado
if ! command -v sqlcmd &> /dev/null; then
    echo "Error: sqlcmd no está instalado"
    echo "Instala el SQL Server Command Line Utilities:"
    echo "  https://docs.microsoft.com/en-us/sql/linux/sql-server-linux-setup-tools"
    exit 1
fi

echo ""
echo "Ejecutando script de inicialización..."

# Ejecutar el script SQL
if sqlcmd -S "$SERVER_FQDN" \
          -d "$DATABASE_NAME" \
          -U "$USERNAME" \
          -P "$PASSWORD" \
          -i "$SQL_FILE" \
          -l 30 \
          -C \
          -b; then
    echo ""
    echo "✓ Base de datos inicializada exitosamente!"
    echo ""
    echo "Configura las siguientes variables de entorno en tu aplicación:"
    echo "DB_HOST=$SERVER_FQDN"
    echo "DB_PORT=1433"
    echo "DB_USERNAME=$USERNAME"
    echo "DB_DATABASE=$DATABASE_NAME"
else
    echo "Error: Falló la ejecución del script SQL"
    exit 1
fi

