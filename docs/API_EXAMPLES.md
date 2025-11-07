# Ejemplos de Uso de la API - Sistema de Control de Asistencia

## 📌 Configuración Base

**URL Base**: `http://localhost:3000`

**Headers Requeridos**:

```
Content-Type: application/json
```

---

## 1️⃣ Marcar Entrada

### Request

```http
POST /attendance/check-in HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "employeeId": 1,
  "type": "check_in",
  "latitude": -12.046374,
  "longitude": -77.042793,
  "recordTime": "2025-10-30T08:00:00Z"
}
```

### Response Success (201 Created)

```json
{
  "employeeId": 1,
  "type": "check_in",
  "latitude": -12.046374,
  "longitude": -77.042793,
  "recordTime": "2025-10-30T08:00:00.000Z",
  "id": 1,
  "createdAt": "2025-10-30T08:00:05.123Z"
}
```

### Response Error - Empleado no encontrado (404)

```json
{
  "statusCode": 404,
  "message": "Empleado con ID 999 no encontrado",
  "error": "Not Found"
}
```

### Response Error - Ya tiene entrada sin salida (400)

```json
{
  "statusCode": 400,
  "message": "El empleado ya tiene una entrada registrada sin salida",
  "error": "Bad Request"
}
```

### Response Error - Validación de datos (400)

```json
{
  "statusCode": 400,
  "message": [
    "employeeId must be a number conforming to the specified constraints",
    "latitude must be a latitude string or number",
    "longitude must be a longitude string or number"
  ],
  "error": "Bad Request"
}
```

---

## 2️⃣ Marcar Salida

### Request

```http
POST /attendance/check-out HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "employeeId": 1,
  "type": "check_out",
  "latitude": -12.046400,
  "longitude": -77.042800,
  "recordTime": "2025-10-30T18:00:00Z"
}
```

### Response Success (201 Created)

```json
{
  "employeeId": 1,
  "type": "check_out",
  "latitude": -12.0464,
  "longitude": -77.0428,
  "recordTime": "2025-10-30T18:00:00.000Z",
  "id": 2,
  "createdAt": "2025-10-30T18:00:02.456Z"
}
```

### Response Error - No hay entrada previa (400)

```json
{
  "statusCode": 400,
  "message": "No hay una entrada registrada para marcar salida",
  "error": "Bad Request"
}
```

### Response Error - Hora de salida inválida (400)

```json
{
  "statusCode": 400,
  "message": "La hora de salida debe ser posterior a la hora de entrada",
  "error": "Bad Request"
}
```

---

## 3️⃣ Obtener Asistencias de un Empleado

### Request

```http
GET /attendance/employee/1 HTTP/1.1
Host: localhost:3000
```

### Response Success (200 OK)

```json
[
  {
    "id": 4,
    "employeeId": 1,
    "type": "check_out",
    "latitude": -12.0464,
    "longitude": -77.0428,
    "recordTime": "2025-10-30T18:00:00.000Z",
    "createdAt": "2025-10-30T18:00:02.456Z"
  },
  {
    "id": 3,
    "employeeId": 1,
    "type": "check_in",
    "latitude": -12.046374,
    "longitude": -77.042793,
    "recordTime": "2025-10-30T08:00:00.000Z",
    "createdAt": "2025-10-30T08:00:05.123Z"
  },
  {
    "id": 2,
    "employeeId": 1,
    "type": "check_out",
    "latitude": -12.046374,
    "longitude": -77.042793,
    "recordTime": "2025-10-29T18:00:00.000Z",
    "createdAt": "2025-10-29T18:00:01.789Z"
  },
  {
    "id": 1,
    "employeeId": 1,
    "type": "check_in",
    "latitude": -12.046374,
    "longitude": -77.042793,
    "recordTime": "2025-10-29T08:00:00.000Z",
    "createdAt": "2025-10-29T08:00:03.234Z"
  }
]
```

### Response Success - Sin asistencias (200 OK)

```json
[]
```

### Response Error - Empleado no encontrado (404)

```json
{
  "statusCode": 404,
  "message": "Empleado con ID 999 no encontrado",
  "error": "Not Found"
}
```

---

## 🧪 Casos de Prueba Completos

### Caso 1: Flujo Normal - Día Completo

#### Paso 1: Marcar entrada

```bash
curl -X POST http://localhost:3000/attendance/check-in \
  -H "Content-Type: application/json" \
  -d '{
    "employeeId": 1,
    "type": "check_in",
    "latitude": -12.046374,
    "longitude": -77.042793,
    "recordTime": "2025-10-30T08:00:00Z"
  }'
```

**Respuesta esperada**: ✅ 201 Created

#### Paso 2: Marcar salida

```bash
curl -X POST http://localhost:3000/attendance/check-out \
  -H "Content-Type: application/json" \
  -d '{
    "employeeId": 1,
    "type": "check_out",
    "latitude": -12.046400,
    "longitude": -77.042800,
    "recordTime": "2025-10-30T18:00:00Z"
  }'
```

**Respuesta esperada**: ✅ 201 Created

---

### Caso 2: Error - Doble Entrada

#### Paso 1: Marcar primera entrada

```bash
curl -X POST http://localhost:3000/attendance/check-in \
  -H "Content-Type: application/json" \
  -d '{
    "employeeId": 2,
    "type": "check_in",
    "latitude": -12.046374,
    "longitude": -77.042793,
    "recordTime": "2025-10-30T08:00:00Z"
  }'
```

**Respuesta esperada**: ✅ 201 Created

#### Paso 2: Intentar marcar segunda entrada sin salida

```bash
curl -X POST http://localhost:3000/attendance/check-in \
  -H "Content-Type: application/json" \
  -d '{
    "employeeId": 2,
    "type": "check_in",
    "latitude": -12.046374,
    "longitude": -77.042793,
    "recordTime": "2025-10-30T09:00:00Z"
  }'
```

**Respuesta esperada**: ❌ 400 Bad Request

```json
{
  "statusCode": 400,
  "message": "El empleado ya tiene una entrada registrada sin salida",
  "error": "Bad Request"
}
```

---

### Caso 3: Error - Salida sin Entrada

```bash
curl -X POST http://localhost:3000/attendance/check-out \
  -H "Content-Type: application/json" \
  -d '{
    "employeeId": 3,
    "type": "check_out",
    "latitude": -12.046374,
    "longitude": -77.042793,
    "recordTime": "2025-10-30T18:00:00Z"
  }'
```

**Respuesta esperada**: ❌ 400 Bad Request

```json
{
  "statusCode": 400,
  "message": "No hay una entrada registrada para marcar salida",
  "error": "Bad Request"
}
```

---

### Caso 4: Error - Coordenadas Inválidas

```bash
curl -X POST http://localhost:3000/attendance/check-in \
  -H "Content-Type: application/json" \
  -d '{
    "employeeId": 1,
    "type": "check_in",
    "latitude": 100,
    "longitude": 200,
    "recordTime": "2025-10-30T08:00:00Z"
  }'
```

**Respuesta esperada**: ❌ 400 Bad Request

```json
{
  "statusCode": 400,
  "message": [
    "latitude must be a latitude string or number",
    "longitude must be a longitude string or number"
  ],
  "error": "Bad Request"
}
```

---

### Caso 5: Error - Hora de Salida Anterior a Entrada

#### Paso 1: Marcar entrada a las 8:00

```bash
curl -X POST http://localhost:3000/attendance/check-in \
  -H "Content-Type: application/json" \
  -d '{
    "employeeId": 4,
    "type": "check_in",
    "latitude": -12.046374,
    "longitude": -77.042793,
    "recordTime": "2025-10-30T08:00:00Z"
  }'
```

#### Paso 2: Intentar marcar salida a las 7:00

```bash
curl -X POST http://localhost:3000/attendance/check-out \
  -H "Content-Type: application/json" \
  -d '{
    "employeeId": 4,
    "type": "check_out",
    "latitude": -12.046374,
    "longitude": -77.042793,
    "recordTime": "2025-10-30T07:00:00Z"
  }'
```

**Respuesta esperada**: ❌ 400 Bad Request

```json
{
  "statusCode": 400,
  "message": "La hora de salida debe ser posterior a la hora de entrada",
  "error": "Bad Request"
}
```

---

## 📍 Coordenadas de Ejemplo (Perú)

```javascript
// Lima - Plaza de Armas
{
  "latitude": -12.046374,
  "longitude": -77.042793
}

// Lima - Miraflores
{
  "latitude": -12.119259,
  "longitude": -77.037525
}

// Arequipa - Plaza de Armas
{
  "latitude": -16.398866,
  "longitude": -71.536961
}

// Cusco - Plaza de Armas
{
  "latitude": -13.516667,
  "longitude": -71.978771
}
```
