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
      prevent_deletion_if_contains_resources = local.provider_config.prevent_deletion_if_contains_resources
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
  length  = local.random_string.sql_server_suffix_length
  special = local.random_string.special_chars
  upper   = local.random_string.uppercase
}

# SQL Server
resource "azurerm_mssql_server" "main" {
  name                         = "${var.sql_server_name}-${random_string.sql_server_suffix.result}"
  resource_group_name          = azurerm_resource_group.main.name
  location                     = azurerm_resource_group.main.location
  version                      = local.sql_server.version
  administrator_login          = var.sql_admin_username
  administrator_login_password = var.sql_admin_password
  minimum_tls_version          = local.sql_server.min_tls_version

  tags = var.tags
}

# Firewall rule to allow Azure services
resource "azurerm_mssql_firewall_rule" "allow_azure_services" {
  name             = local.firewall_rules.allow_azure_services.name
  server_id        = azurerm_mssql_server.main.id
  start_ip_address = local.firewall_rules.allow_azure_services.start_ip_address
  end_ip_address   = local.firewall_rules.allow_azure_services.end_ip_address
}

# Firewall rule for client IP (if provided)
resource "azurerm_mssql_firewall_rule" "allow_client_ip" {
  count            = var.client_ip_address != "" ? 1 : 0
  name             = local.firewall_rules.allow_client_ip.name
  server_id        = azurerm_mssql_server.main.id
  start_ip_address = var.client_ip_address
  end_ip_address   = var.client_ip_address
}

# SQL Database (Free tier - Serverless)
# El SKU "GP_S_Gen5_1" es Serverless General Purpose, que aprovecha la oferta gratuita de Azure
resource "azurerm_mssql_database" "main" {
  name           = var.database_name
  server_id      = azurerm_mssql_server.main.id
  collation      = local.database.collation
  max_size_gb    = var.database_max_size_gb
  sku_name       = var.database_sku_name
  zone_redundant = local.database_config.zone_redundant

  # Configuración Serverless (si está disponible en la versión del proveedor)
  # Estos parámetros se aplican automáticamente con el SKU Serverless
  auto_pause_delay_in_minutes = var.auto_pause_delay_in_minutes
  min_capacity                = var.min_capacity

  tags = var.tags

  lifecycle {
    ignore_changes = [
      long_term_retention_policy,
      short_term_retention_policy,
      threat_detection_policy
    ]
  }
}

# Random string for Service Bus namespace name uniqueness
resource "random_string" "service_bus_suffix" {
  length  = local.random_string.service_bus_suffix_length
  special = local.random_string.special_chars
  upper   = local.random_string.uppercase
}

# Azure Service Bus Namespace
# Nota: Service Bus Basic es el tier más económico disponible
# No hay tier completamente gratuito, pero Basic tiene el costo más bajo
# Costo aproximado: ~$0.05 USD por millón de operaciones
resource "azurerm_servicebus_namespace" "main" {
  name                = "${var.service_bus_namespace_name}-${random_string.service_bus_suffix.result}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  sku                 = var.service_bus_sku # Basic es el más económico

  tags = var.tags
}

# Service Bus Queue for late check-in notifications
resource "azurerm_servicebus_queue" "late_checkin_notifications" {
  name         = var.service_bus_queue_name
  namespace_id = azurerm_servicebus_namespace.main.id

  # Configuración de la cola
  max_delivery_count                  = var.service_bus_max_delivery_count
  default_message_ttl                 = var.service_bus_default_message_ttl
  lock_duration                       = var.service_bus_lock_duration
  dead_lettering_on_message_expiration = local.service_bus_queue.dead_lettering_on_message_expiration
  partitioning_enabled                = local.service_bus_queue.partitioning_enabled
}

# Data source para obtener la regla de autorización por defecto (creada automáticamente por Azure)
data "azurerm_servicebus_namespace_authorization_rule" "main" {
  name         = local.service_bus.authorization_rule_name
  namespace_id = azurerm_servicebus_namespace.main.id
}

# Random string for Function App name uniqueness
resource "random_string" "function_app_suffix" {
  length  = local.random_string.function_app_suffix_length
  special = local.random_string.special_chars
  upper   = local.random_string.uppercase
}

# Random string for Storage Account name uniqueness
resource "random_string" "storage_account_suffix" {
  length  = local.random_string.storage_account_suffix_length
  special = false
  upper   = false
  numeric = true
}

# Storage Account for Function App
# Nota: Azure ofrece 5 GB de almacenamiento gratuito durante 12 meses para nuevas cuentas
# Este Storage Account se usará dentro del tier gratuito si el uso es bajo
resource "azurerm_storage_account" "function_app" {
  name                     = "${var.function_app_storage_account_name}${random_string.storage_account_suffix.result}"
  resource_group_name      = azurerm_resource_group.main.name
  location                 = azurerm_resource_group.main.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
  # LRS (Local Redundant Storage) es la opción más económica
  # Para tier gratuito: 5 GB gratis durante 12 meses

  tags = var.tags
}

# App Service Plan for Function App (Consumption Plan)
# Nota: Consumption Plan (Y1) incluye tier gratuito:
# - 1 millón de ejecuciones gratis por mes
# - 400,000 GB-segundos de tiempo de ejecución gratis por mes
# - Solo pagas por lo que usas después de los límites gratuitos
resource "azurerm_service_plan" "function_app" {
  name                = "${var.function_app_name}-plan-${random_string.function_app_suffix.result}"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  os_type             = "Linux"
  sku_name            = var.function_app_sku # Y1 = Consumption Plan (tier gratuito incluido)

  tags = var.tags
}

# Function App
resource "azurerm_linux_function_app" "notifications" {
  name                = "${var.function_app_name}-${random_string.function_app_suffix.result}"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  service_plan_id     = azurerm_service_plan.function_app.id

  storage_account_name       = azurerm_storage_account.function_app.name
  storage_account_access_key = azurerm_storage_account.function_app.primary_access_key

  site_config {
    application_stack {
      node_version = var.function_app_node_version
    }
  }

  app_settings = {
    FUNCTIONS_WORKER_RUNTIME       = var.function_app_runtime
    AzureWebJobsStorage            = azurerm_storage_account.function_app.primary_connection_string
    SERVICE_BUS_CONNECTION_STRING  = data.azurerm_servicebus_namespace_authorization_rule.main.primary_connection_string
    SERVICE_BUS_QUEUE_NAME         = var.service_bus_queue_name
    WEBSITE_CONTENTAZUREFILECONNECTIONSTRING = azurerm_storage_account.function_app.primary_connection_string
    WEBSITE_CONTENTSHARE           = "${var.function_app_name}-${random_string.function_app_suffix.result}"
  }

  identity {
    type = "SystemAssigned"
  }

  tags = var.tags
}

# Service Bus Queue Authorization Rule for Function App (read access)
resource "azurerm_servicebus_queue_authorization_rule" "function_app" {
  name     = "FunctionAppListenRule"
  queue_id = azurerm_servicebus_queue.late_checkin_notifications.id

  listen = true
  send   = false
  manage = false
}

