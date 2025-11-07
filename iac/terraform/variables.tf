variable "resource_group_name" {
  description = "Nombre del grupo de recursos de Azure"
  type        = string
  default     = "rg-peaceful"
}

variable "location" {
  description = "Región de Azure donde se creará la infraestructura"
  type        = string
  default     = "westus2"
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
  description = "SKU de la base de datos. GP_S_Gen5_1 = Serverless General Purpose (tier gratuito: 250 GB durante 12 meses para nuevas cuentas)"
  type        = string
  default     = "GP_S_Gen5_1" # Serverless - se pausa automáticamente cuando no se usa, minimizando costos
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

# Service Bus Variables
variable "service_bus_namespace_name" {
  description = "Nombre base para el namespace de Service Bus (se le agregará un sufijo aleatorio)"
  type        = string
  default     = "sb-peaceful"
}

variable "service_bus_sku" {
  description = "SKU del Service Bus (Basic es el más económico, no hay tier gratuito disponible)"
  type        = string
  default     = "Basic" # Tier más económico disponible (~$0.05 USD por millón de operaciones)
}

variable "service_bus_queue_name" {
  description = "Nombre de la cola de Service Bus para notificaciones de tardanzas"
  type        = string
  default     = "late-checkin-notifications"
}

variable "service_bus_max_delivery_count" {
  description = "Número máximo de intentos de entrega antes de mover el mensaje a la dead letter queue"
  type        = number
  default     = 10
}

variable "service_bus_default_message_ttl" {
  description = "TTL por defecto para mensajes en la cola (en formato ISO 8601, ej: PT1H para 1 hora)"
  type        = string
  default     = "P1D" # 1 día
}

variable "service_bus_lock_duration" {
  description = "Duración del lock de mensajes (en formato ISO 8601, ej: PT30S para 30 segundos)"
  type        = string
  default     = "PT1M" # 1 minuto
}

# Azure Function Variables
variable "function_app_name" {
  description = "Nombre base para la Function App (se le agregará un sufijo aleatorio)"
  type        = string
  default     = "func-peaceful-notifications"
}

variable "function_app_sku" {
  description = "SKU del plan de App Service para la Function App. Y1 = Consumption Plan con tier gratuito (1M ejecuciones/mes gratis)"
  type        = string
  default     = "Y1" # Consumption Plan - incluye tier gratuito: 1M ejecuciones/mes + 400K GB-seg/mes gratis
}

variable "function_app_runtime" {
  description = "Runtime de la Function App (node, python, dotnet, java)"
  type        = string
  default     = "node"
}

variable "function_app_node_version" {
  description = "Versión de Node.js para la Function App (valores válidos: 12, 14, 16, 18, 20)"
  type        = string
  default     = "20"
}

variable "function_app_storage_account_name" {
  description = "Nombre base para la cuenta de almacenamiento de la Function App (se le agregará un sufijo aleatorio)"
  type        = string
  default     = "stpeacefulfunc"
}

