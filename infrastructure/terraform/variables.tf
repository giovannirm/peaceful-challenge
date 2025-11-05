variable "resource_group_name" {
  description = "Nombre del grupo de recursos de Azure"
  type        = string
  default     = "rg-peaceful-db"
}

variable "location" {
  description = "Región de Azure donde se creará la infraestructura"
  type        = string
  default     = "West Europe"
}

variable "sql_server_name" {
  description = "Nombre base para el servidor SQL (se le agregará un sufijo aleatorio)"
  type        = string
  default     = "sql-peaceful"
}

variable "sql_admin_username" {
  description = "Nombre de usuario administrador para SQL Server"
  type        = string
  sensitive   = true
}

variable "sql_admin_password" {
  description = "Contraseña del administrador SQL (mínimo 8 caracteres, mayúsculas, minúsculas, números y caracteres especiales)"
  type        = string
  sensitive   = true
}

variable "database_name" {
  description = "Nombre de la base de datos"
  type        = string
  default     = "peaceful_db"
}

variable "database_sku_name" {
  description = "SKU de la base de datos. Para tier gratuito usar 'Basic' o 'S0' (Serverless). Para Free tier completo, usar 'GP_S_Gen5_1' (Serverless General Purpose)"
  type        = string
  default     = "GP_S_Gen5_1"
}

variable "database_max_size_gb" {
  description = "Tamaño máximo de la base de datos en GB. Para tier gratuito, máximo 32 GB"
  type        = number
  default     = 32
}

variable "auto_pause_delay_in_minutes" {
  description = "Tiempo en minutos antes de pausar automáticamente la base de datos (Serverless). 0 para desactivar auto-pause. Solo aplica para SKUs Serverless"
  type        = number
  default     = 60
}

variable "min_capacity" {
  description = "Capacidad mínima para base de datos Serverless en vCores (0.5, 1, 2, etc.). Solo aplica para SKUs Serverless"
  type        = number
  default     = 0.5
}

variable "client_ip_address" {
  description = "Dirección IP del cliente para permitir acceso (opcional, dejar vacío para no agregar)"
  type        = string
  default     = ""
}

variable "tags" {
  description = "Tags para aplicar a los recursos"
  type        = map(string)
  default = {
    Environment = "development"
    Project     = "peaceful"
    ManagedBy   = "terraform"
  }
}

