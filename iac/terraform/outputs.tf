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

