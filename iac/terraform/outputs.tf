output "sql_server_name" {
  description = "Nombre del servidor SQL Server"
  value       = azurerm_mssql_server.main.fully_qualified_domain_name
}

output "sql_server_fqdn" {
  description = "FQDN del servidor SQL Server"
  value       = azurerm_mssql_server.main.fully_qualified_domain_name
}

output "database_name" {
  description = "Nombre de la base de datos"
  value       = azurerm_mssql_database.main.name
}

output "connection_string" {
  description = "Cadena de conexión para la base de datos (sin contraseña)"
  value       = "Server=tcp:${azurerm_mssql_server.main.fully_qualified_domain_name},1433;Initial Catalog=${azurerm_mssql_database.main.name};Persist Security Info=False;User ID=${var.sql_admin_username};MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;"
  sensitive   = true
}

output "resource_group_name" {
  description = "Nombre del grupo de recursos"
  value       = azurerm_resource_group.main.name
}

output "sql_server_id" {
  description = "ID del servidor SQL"
  value       = azurerm_mssql_server.main.id
}

output "database_id" {
  description = "ID de la base de datos"
  value       = azurerm_mssql_database.main.id
}

# Service Bus Outputs
output "service_bus_namespace_name" {
  description = "Nombre del namespace de Service Bus"
  value       = azurerm_servicebus_namespace.main.name
}

output "service_bus_namespace_fqdn" {
  description = "FQDN del namespace de Service Bus"
  value       = azurerm_servicebus_namespace.main.default_primary_connection_string
  sensitive   = true
}

output "service_bus_connection_string" {
  description = "Connection string del Service Bus"
  value       = data.azurerm_servicebus_namespace_authorization_rule.main.primary_connection_string
  sensitive   = true
}

output "service_bus_queue_name" {
  description = "Nombre de la cola de notificaciones"
  value       = azurerm_servicebus_queue.late_checkin_notifications.name
}

# Function App Outputs
output "function_app_name" {
  description = "Nombre de la Function App"
  value       = azurerm_linux_function_app.notifications.name
}

output "function_app_default_hostname" {
  description = "URL por defecto de la Function App"
  value       = azurerm_linux_function_app.notifications.default_hostname
}

output "function_app_id" {
  description = "ID de la Function App"
  value       = azurerm_linux_function_app.notifications.id
}

