#!/bin/bash

# Script para generar archivo .env desde los outputs de Terraform
# Uso: ./generate-env.sh [output-file]
# Ejemplo: ./generate-env.sh ../../.env.production

set -e

TERRAFORM_DIR="${1:-.}"
OUTPUT_FILE="${2:-../../.env.azure}"

echo "=== Generando archivo .env desde Terraform outputs ==="

# Verificar que Terraform esté inicializado
if [ ! -d "$TERRAFORM_DIR/.terraform" ]; then
    echo "Error: Terraform no está inicializado. Ejecuta 'terraform init' primero."
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

# Intentar obtener credenciales desde terraform.tfvars
USERNAME=""
PASSWORD=""

if [ -f "terraform.tfvars" ]; then
    USERNAME=$(grep -E '^sql_admin_username\s*=' terraform.tfvars | sed -E 's/^[^"]*"([^"]+)".*/\1/' || echo "")
    PASSWORD=$(grep -E '^sql_admin_password\s*=' terraform.tfvars | sed -E 's/^[^"]*"([^"]+)".*/\1/' || echo "")
fi

if [ -z "$USERNAME" ] || [ -z "$PASSWORD" ]; then
    echo "Error: No se pudieron obtener las credenciales de terraform.tfvars"
    echo "Asegúrate de que terraform.tfvars existe y contiene sql_admin_username y sql_admin_password"
    exit 1
fi

echo "Servidor SQL: $SERVER_FQDN"
echo "Base de datos: $DATABASE_NAME"
echo "Usuario: $USERNAME"
echo ""
echo "Generando archivo: $OUTPUT_FILE"

# Generar archivo .env
cat > "$OUTPUT_FILE" << EOF
# Archivo generado automáticamente desde Terraform outputs
# Generado el: $(date)
# NO editar manualmente - regenerar con: ./iac/terraform/scripts/generate-env.sh

# Configuración de la aplicación
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# Configuración de base de datos (Azure SQL)
# Valores obtenidos de Terraform outputs
DB_HOST=$SERVER_FQDN
DB_PORT=1433
DB_USERNAME=$USERNAME
DB_PASSWORD=$PASSWORD
DB_DATABASE=$DATABASE_NAME
DB_ENCRYPT=true
EOF

echo ""
echo "✓ Archivo generado exitosamente: $OUTPUT_FILE"
echo ""
echo "Puedes usarlo con:"
echo "  cp $OUTPUT_FILE .env.production"
echo "  # O directamente:"
echo "  export \$(cat $OUTPUT_FILE | grep -v '^#' | xargs)"
echo ""

