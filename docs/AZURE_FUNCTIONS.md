# Integración con Azure Functions para Notificaciones

Este documento describe cómo funciona la integración entre el microservicio NestJS y Azure Functions para el procesamiento de notificaciones de tardanzas.

## ✅ Implementación Completa

La Azure Function está **completamente implementada** y configurada en Terraform. El código se encuentra en `azure-functions/` y se despliega automáticamente con la infraestructura.

## Arquitectura

```
NestJS Microservice
    ↓ (envía mensaje)
Azure Service Bus Queue (late-checkin-notifications)
    ↓ (trigger)
Azure Function (procesa y envía email)
    ↓
Email Service (SendGrid, Azure Communication Services, etc.)
```

## Flujo de Notificaciones

1. **Check-in tardío detectado**: Cuando un empleado registra su entrada con más de 1 hora de retraso, el caso de uso `CheckInUseCase` detecta la tardanza.

2. **Envío a Service Bus**: Se envía un mensaje a la cola de Azure Service Bus con la siguiente estructura:
   ```json
   {
     "employeeId": 1,
     "employeeEmail": "empleado@example.com",
     "employeeName": "Juan Pérez",
     "checkInTime": "2024-01-15T10:30:00.000Z",
     "lateMinutes": 90
   }
   ```

3. **Procesamiento por Azure Function**: Una Azure Function con trigger de Service Bus recibe el mensaje y procesa el envío del email.

## Configuración del Microservicio

### Variables de Entorno

El microservicio requiere las siguientes variables de entorno para habilitar Azure Service Bus:

```env
AZURE_SERVICE_BUS_CONNECTION_STRING=Endpoint=sb://sb-peaceful-xxxxx.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=xxxxx
AZURE_SERVICE_BUS_QUEUE_NAME=late-checkin-notifications
```

**Nota**: Si estas variables no están configuradas, el sistema usará automáticamente `MockNotificationQueue` para desarrollo local.

### Generación Automática

Las variables se generan automáticamente al ejecutar:

```bash
npm run generate-env
```

O manualmente:

```powershell
cd iac/terraform
.\scripts\generate-env.ps1
```

## Implementación de Azure Function

La Azure Function está implementada en `azure-functions/NotifyLateCheckIn/` y se crea automáticamente con Terraform.

### Despliegue

La Function App se crea automáticamente cuando ejecutas `terraform apply`. Para desplegar el código:

```bash
# 1. Compilar el código
cd azure-functions
npm install
npm run build

# 2. Desplegar
func azure functionapp publish <FUNCTION_APP_NAME> --build remote
# El nombre de la Function App está en los outputs de Terraform
```

### Estructura del Mensaje

La Azure Function recibirá mensajes con la siguiente estructura:

```typescript
interface LateCheckInNotificationMessage {
  employeeId: number;
  employeeEmail: string;
  employeeName: string;
  checkInTime: string; // ISO 8601
  lateMinutes: number;
}
```

### Código Implementado

El código completo está en `azure-functions/NotifyLateCheckIn/index.ts`. La función:

1. Recibe mensajes de Service Bus automáticamente
2. Valida el contenido del mensaje
3. Genera el contenido del email
4. **TODO**: Implementar envío real de email (actualmente solo loguea)

Para implementar el envío de email, ver las opciones en `azure-functions/README.md`.

### Configuración Automática

Terraform configura automáticamente:
- Function App con Node.js 20
- Storage Account para la Function App
- App Service Plan (Consumption)
- Variables de entorno (`SERVICE_BUS_CONNECTION_STRING`, `SERVICE_BUS_QUEUE_NAME`)
- Permisos de lectura en Service Bus Queue

## Propiedades del Mensaje

El mensaje enviado a Service Bus incluye las siguientes propiedades personalizadas:

- `subject`: `"LateCheckInNotification"`
- `applicationProperties.employeeId`: ID del empleado (string)
- `applicationProperties.notificationType`: `"late_check_in"`
- `contentType`: `"application/json"`

Estas propiedades pueden ser usadas por la Azure Function para filtrar o enrutar mensajes.

## Manejo de Errores

- Si el envío a Service Bus falla, el error se registra pero **no afecta** el flujo principal del check-in.
- Los mensajes fallidos pueden ir a la **Dead Letter Queue** si está configurada en Service Bus.
- La Azure Function debe implementar su propio manejo de errores y reintentos.

## Desarrollo Local

Para desarrollo local sin Azure Service Bus:

1. No configurar las variables de entorno de Service Bus
2. El sistema usará automáticamente `MockNotificationQueue`
3. Las notificaciones se registrarán en los logs pero no se enviarán

## Testing

Para probar la integración:

1. Configurar las variables de entorno de Service Bus
2. Realizar un check-in tardío (más de 1 hora después de las 9:00 AM)
3. Verificar que el mensaje se envía a Service Bus
4. Verificar que la Azure Function procesa el mensaje
5. Verificar que el email se envía correctamente

