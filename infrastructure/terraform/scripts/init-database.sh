#!/bin/bash

# Script para ejecutar el script SQL de inicialización en Azure SQL Database
# Uso: ./init-database.sh <server-fqdn> <database-name> <username> <password> <sql-file>

set -e

SERVER_FQDN=$1
DATABASE_NAME=$2
USERNAME=$3
PASSWORD=$4
SQL_FILE=$5

if [ -z "$SERVER_FQDN" ] || [ -z "$DATABASE_NAME" ] || [ -z "$USERNAME" ] || [ -z "$PASSWORD" ] || [ -z "$SQL_FILE" ]; then
    echo "Error: Faltan parámetros"
    echo "Uso: $0 <server-fqdn> <database-name> <username> <password> <sql-file>"
    exit 1
fi

if [ ! -f "$SQL_FILE" ]; then
    echo "Error: El archivo SQL no existe: $SQL_FILE"
    exit 1
fi

echo "Conectando a Azure SQL Database..."
echo "Servidor: $SERVER_FQDN"
echo "Base de datos: $DATABASE_NAME"

# Verificar si sqlcmd está instalado
if ! command -v sqlcmd &> /dev/null; then
    echo "Error: sqlcmd no está instalado"
    echo "Instala el SQL Server Command Line Utilities:"
    echo "  Windows: https://aka.ms/sqlcmdsetup"
    echo "  Linux: https://docs.microsoft.com/en-us/sql/linux/sql-server-linux-setup-tools"
    exit 1
fi

# Ejecutar el script SQL
sqlcmd -S "$SERVER_FQDN" \
       -d "$DATABASE_NAME" \
       -U "$USERNAME" \
       -P "$PASSWORD" \
       -i "$SQL_FILE" \
       -l 30 \
       -C

echo "Script SQL ejecutado exitosamente"

