# Documentación del Proyecto

Bienvenido a la documentación del Sistema de Control de Asistencia Laboral. Esta carpeta contiene toda la documentación técnica del proyecto.

## 📚 Índice de Documentación

### 🏗️ Arquitectura y Diseño

- **[Arquitectura Hexagonal](ARCHITECTURE.md)** - Explicación detallada de la arquitectura del proyecto, estructura de capas, flujo de datos y principios de diseño.

### 🐳 Despliegue y Docker

- **[Docker](DOCKER.md)** - Guía completa sobre Docker, docker-compose, configuración de servicios, troubleshooting y despliegue en producción.

### ⚙️ Configuración

- **[Configuración](CONFIG.md)** - Variables de entorno, servicio de configuración, y cómo configurar el proyecto para diferentes entornos (local, Docker, Azure).

### 📡 API y Ejemplos

- **[Ejemplos de API](API_EXAMPLES.md)** - Ejemplos completos de uso de la API, casos de prueba, requests/responses y coordenadas de ejemplo.

### 🔧 Desarrollo

- **[Reglas de Desarrollo](DEVELOPMENT_RULES.md)** - Estándares de código, prohibición de magic strings, arquitectura hexagonal, y checklist antes de hacer commit.

### ☁️ Azure e Integraciones

- **[Azure Functions](AZURE_FUNCTIONS.md)** - Integración con Azure Functions para notificaciones, configuración de Service Bus, y flujo de notificaciones de tardanzas.

## 🚀 Inicio Rápido

Para comenzar con el proyecto, consulta el [README principal](../README.md) en la raíz del repositorio.

## 📖 Estructura de Documentación

```
docs/
├── README.md              # Este archivo - Índice de documentación
├── ARCHITECTURE.md        # Arquitectura del proyecto
├── DOCKER.md              # Guía de Docker
├── CONFIG.md              # Configuración y variables de entorno
├── API_EXAMPLES.md        # Ejemplos de uso de la API
├── DEVELOPMENT_RULES.md   # Reglas y estándares de desarrollo
└── AZURE_FUNCTIONS.md     # Integración con Azure Functions
```

## 🔍 Búsqueda Rápida

- **¿Cómo inicio el proyecto?** → [README principal](../README.md#-inicio-rápido)
- **¿Cómo funciona la arquitectura?** → [ARCHITECTURE.md](ARCHITECTURE.md)
- **¿Cómo despliego con Docker?** → [DOCKER.md](DOCKER.md)
- **¿Cómo configuro las variables de entorno?** → [CONFIG.md](CONFIG.md)
- **¿Cómo uso la API?** → [API_EXAMPLES.md](API_EXAMPLES.md)
- **¿Cuáles son las reglas de desarrollo?** → [DEVELOPMENT_RULES.md](DEVELOPMENT_RULES.md)
- **¿Cómo funcionan las notificaciones?** → [AZURE_FUNCTIONS.md](AZURE_FUNCTIONS.md)

