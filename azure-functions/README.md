# Azure Function - Notificaciones de Tardanzas

Esta Azure Function procesa mensajes de notificaciones de tardanzas desde Azure Service Bus y envía emails a los empleados.

## Estructura

```
azure-functions/
├── src/
│   └── index.ts           # TODO en un solo archivo (similar a AWS Lambda)
├── host.json              # Configuración global de la Function App
├── package.json           # Dependencias
├── tsconfig.json          # Configuración de TypeScript
└── README.md              # Este archivo
```

**Nota**: Esta Function usa el **Programming Model v4** de Azure Functions, que permite definir toda la lógica en un solo archivo TypeScript, similar a AWS Lambda. No se requiere `function.json` porque la configuración está en el código.

## Desarrollo Local

### Prerrequisitos

1. **Azure Functions Core Tools**:
   ```bash
   npm install -g azure-functions-core-tools@4 --unsafe-perm true
   ```

2. **Node.js** 20.x o superior

### Configuración

1. **Instalar dependencias**:
   ```bash
   cd azure-functions
   npm install
   ```

2. **Configurar variables de entorno local**:
   Crea un archivo `local.settings.json` basado en `local.settings.json.example`:
   ```json
   {
     "IsEncrypted": false,
     "Values": {
       "AzureWebJobsStorage": "UseDevelopmentStorage=true",
       "FUNCTIONS_WORKER_RUNTIME": "node",
       "SERVICE_BUS_CONNECTION_STRING": "Endpoint=sb://...",
       "SERVICE_BUS_QUEUE_NAME": "late-checkin-notifications",
       "EMAIL_USER": "your-email@gmail.com",
       "EMAIL_APP_PASSWORD": "your-app-password-here"
     }
   }
   ```
   
   **Nota**: `EMAIL_USER` y `EMAIL_APP_PASSWORD` son necesarios para el envío de correos usando nodemailer con Gmail.

3. **Compilar TypeScript**:
   ```bash
   npm run build
   ```

4. **Ejecutar localmente**:
   ```bash
   npm start
   ```

## Despliegue

### Opción 1: Desde Terraform (Automático)

La Function App se crea automáticamente con Terraform. Para desplegar el código:

```bash
# 1. Compilar el código
cd azure-functions
npm install
npm run build

# 2. Desplegar usando Azure Functions Core Tools
func azure functionapp publish <FUNCTION_APP_NAME>
```

### Opción 2: Desde Azure Portal

1. Ve a la Function App en Azure Portal
2. Usa "Deployment Center" para conectar con tu repositorio
3. O usa "Advanced Tools (Kudu)" para subir el código manualmente

### Opción 3: Usando Azure CLI

```bash
# Instalar la extensión de Functions
az extension add --name functionapp

# Desplegar
cd azure-functions
func azure functionapp publish <FUNCTION_APP_NAME>
```

## Configuración de Variables de Entorno

Las siguientes variables se configuran automáticamente en Terraform:

- `SERVICE_BUS_CONNECTION_STRING`: Connection string de Service Bus
- `SERVICE_BUS_QUEUE_NAME`: Nombre de la cola (default: `late-checkin-notifications`)
- `FUNCTIONS_WORKER_RUNTIME`: `node`
- `AzureWebJobsStorage`: Connection string de la Storage Account

**Variables adicionales requeridas para el envío de correos** (configurar manualmente en Azure Portal o en `local.settings.json` para desarrollo local):

- `EMAIL_USER`: Dirección de correo Gmail (ej: `your-email@gmail.com`)
- `EMAIL_APP_PASSWORD`: Clave de aplicación de Gmail (obtener desde [Google Account Security](https://myaccount.google.com/apppasswords))

## Implementación de Envío de Email

La función usa **nodemailer** para enviar correos electrónicos a través de Gmail SMTP. El correo se envía en formato HTML con un diseño profesional.

### Configuración de Gmail

1. Habilita la verificación en 2 pasos en tu cuenta de Google
2. Genera una clave de aplicación desde [Google Account Security](https://myaccount.google.com/apppasswords)
3. Usa esa clave como `EMAIL_APP_PASSWORD` (sin espacios)

### Alternativas de Implementación

Si prefieres usar otro servicio de email, puedes reemplazar la implementación:

### Opción 1: Azure Communication Services Email

```typescript
import { EmailClient } from '@azure/communication-email';

const emailClient = new EmailClient(process.env.COMMUNICATION_SERVICES_CONNECTION_STRING);

await emailClient.beginSend({
  senderAddress: 'noreply@yourdomain.com',
  content: {
    subject: emailSubject,
    plainText: emailBody,
  },
  recipients: {
    to: [{ address: message.employeeEmail }],
  },
});
```

### Opción 2: SendGrid

```typescript
import * as sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

await sgMail.send({
  to: message.employeeEmail,
  from: 'noreply@yourdomain.com',
  subject: emailSubject,
  text: emailBody,
});
```

### Opción 3: Microsoft Graph API

```typescript
import { Client } from '@microsoft/microsoft-graph-client';

const client = Client.init({
  authProvider: (done) => {
    done(null, process.env.GRAPH_ACCESS_TOKEN);
  },
});

await client.api('/me/sendMail').post({
  message: {
    subject: emailSubject,
    body: {
      contentType: 'Text',
      content: emailBody,
    },
    toRecipients: [
      {
        emailAddress: {
          address: message.employeeEmail,
        },
      },
    ],
  },
});
```

## Monitoreo

- **Logs**: Disponibles en Azure Portal → Function App → Logs
- **Application Insights**: Se puede configurar para monitoreo avanzado
- **Dead Letter Queue**: Los mensajes fallidos se moverán automáticamente a la DLQ después de los reintentos

## Testing

Para probar la función localmente:

1. Envía un mensaje de prueba a la cola de Service Bus:

```typescript
const message = {
  employeeId: 1,
  employeeEmail: 'test@example.com',
  employeeName: 'Juan Pérez',
  checkInTime: new Date().toISOString(),
  lateMinutes: 90,
};

// Usar Azure Service Bus Explorer o el SDK para enviar el mensaje
```

2. La función se activará automáticamente y procesará el mensaje.

