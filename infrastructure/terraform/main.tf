terraform {
  required_version = ">= 1.0"
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
  }
}

provider "azurerm" {
  features {
    resource_group {
      prevent_deletion_if_contains_resources = false
    }
  }
}

# Resource Group
resource "azurerm_resource_group" "main" {
  name     = var.resource_group_name
  location = var.location

  tags = var.tags
}

# Random string for SQL server name uniqueness
resource "random_string" "sql_server_suffix" {
  length  = 6
  special = false
  upper   = false
}

# SQL Server
resource "azurerm_mssql_server" "main" {
  name                         = "${var.sql_server_name}-${random_string.sql_server_suffix.result}"
  resource_group_name          = azurerm_resource_group.main.name
  location                     = azurerm_resource_group.main.location
  version                      = "12.0"
  administrator_login          = var.sql_admin_username
  administrator_login_password = var.sql_admin_password
  minimum_tls_version          = "1.2"

  tags = var.tags
}

# Firewall rule to allow Azure services
resource "azurerm_mssql_firewall_rule" "allow_azure_services" {
  name             = "AllowAzureServices"
  server_id        = azurerm_mssql_server.main.id
  start_ip_address = "0.0.0.0"
  end_ip_address   = "0.0.0.0"
}

# Firewall rule for client IP (if provided)
resource "azurerm_mssql_firewall_rule" "allow_client_ip" {
  count            = var.client_ip_address != "" ? 1 : 0
  name             = "AllowClientIP"
  server_id        = azurerm_mssql_server.main.id
  start_ip_address = var.client_ip_address
  end_ip_address   = var.client_ip_address
}

# SQL Database (Free tier - Serverless)
# El SKU "GP_S_Gen5_1" es Serverless General Purpose, que aprovecha la oferta gratuita de Azure
resource "azurerm_mssql_database" "main" {
  name           = var.database_name
  server_id      = azurerm_mssql_server.main.id
  collation      = "SQL_Latin1_General_CP1_CI_AS"
  license_type   = "LicenseIncluded"
  max_size_gb    = var.database_max_size_gb
  sku_name       = var.database_sku_name
  zone_redundant = false

  # Configuración Serverless (si está disponible en la versión del proveedor)
  # Estos parámetros se aplican automáticamente con el SKU Serverless
  auto_pause_delay_in_minutes = var.auto_pause_delay_in_minutes
  min_capacity                = var.min_capacity

  tags = var.tags
}


