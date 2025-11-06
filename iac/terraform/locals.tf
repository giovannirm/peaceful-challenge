locals {
  # SQL Server Configuration
  sql_server = {
    version         = "12.0"
    min_tls_version = "1.2"
  }

  # SQL Database Configuration
  database = {
    collation = "SQL_Latin1_General_CP1_CI_AS"
  }

  # Firewall Rules
  firewall_rules = {
    allow_azure_services = {
      name             = "AllowAzureServices"
      start_ip_address = "0.0.0.0"
      end_ip_address   = "0.0.0.0"
    }
    allow_client_ip = {
      name = "AllowClientIP"
    }
  }

  # Service Bus Configuration
  service_bus = {
    authorization_rule_name = "RootManageSharedAccessKey"
  }

  # Random String Configuration
  random_string = {
    sql_server_suffix_length     = 6
    service_bus_suffix_length    = 6
    function_app_suffix_length   = 6
    storage_account_suffix_length = 6
    special_chars                = false
    uppercase                    = false
  }

  # Service Bus Queue Configuration
  service_bus_queue = {
    dead_lettering_on_message_expiration = true
    partitioning_enabled                 = false
  }

  # SQL Database Configuration
  database_config = {
    zone_redundant = false
  }

  # Provider Configuration
  provider_config = {
    prevent_deletion_if_contains_resources = false
  }

  # Azure Function Configuration
  function_app = {
    version = "~4"
  }
}

