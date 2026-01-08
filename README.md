# 🔔 Socket.IO Notification System

Sistema completo de notificaciones en tiempo real con Socket.IO y TypeScript.

## 🚀 Inicio Rápido

```bash
# Instalar dependencias
npm install

# Iniciar servidor
npm start
```

El servidor estará disponible en `http://localhost:3333`

## 📂 Estructura del Proyecto

```
socket-backend-typescript/
├── src/
│   ├── server.ts              # Servidor HTTP + Socket.IO
│   └── socket/
│       ├── index.ts           # Inicialización de Socket.IO
│       ├── auth.middleware.ts # Middleware de autenticación
│       ├── events.ts          # Eventos de notificaciones y salas
│       └── types.ts           # Tipos TypeScript
├── test-client.html           # Cliente web de prueba
├── test-api.sh               # Script de prueba (Linux/Mac)
├── test-api.ps1              # Script de prueba (Windows)
├── NOTIFICATION_TESTS.md      # Guía de notificaciones
└── USERS_AND_ROOMS.md        # Guía de usuarios y salas
```

## ✨ Características

### 🔔 Notificaciones
- ✅ Broadcast (todos los usuarios)
- ✅ Envío a usuario específico (por Socket ID)
- ✅ Envío a sala específica
- ✅ 4 tipos de alertas: success, error, info, warning
- ✅ Acknowledgments (confirmaciones)

### 👥 Gestión de Usuarios y Salas
- ✅ Consultar usuarios conectados
- ✅ Consultar salas activas
- ✅ Ver miembros de una sala
- ✅ Unirse/salir de salas
- ✅ API HTTP y eventos Socket.IO

## 📡 Eventos Socket.IO

### Notificaciones

```typescript
// Enviar notificación (genérica)
socket.emit('notification:send', {
  message: 'Mensaje',
  title: 'Título',
  type: 'success', // 'success' | 'error' | 'info' | 'warning'
  targetUserId?: 'socket-id',  // Opcional: enviar a usuario específico
  room?: 'nombre-sala'         // Opcional: enviar a sala específica
})

// Atajos por tipo
socket.emit('notification:success', { message: '...', title: '...' })
socket.emit('notification:error', { message: '...', title: '...' })
socket.emit('notification:info', { message: '...', title: '...' })
socket.emit('notification:warning', { message: '...', title: '...' })

// Recibir notificación
socket.on('notification:receive', (alert) => {
  console.log(alert) // { id, message, title, type }
})
```

### Salas

```typescript
// Unirse a sala
socket.emit('room:join', 'admins', (response) => {
  console.log(response.success) // true
})

// Salir de sala
socket.emit('room:leave', 'admins', (response) => {
  console.log(response.success) // true
})

// Ver miembros de sala
socket.emit('room:members', 'admins', (response) => {
  console.log(response.members) // [{ id, user, allRooms }]
})
```

### Consultas

```typescript
// Listar usuarios conectados
socket.emit('users:list', (response) => {
  console.log(response.users) // [{ id, user, rooms }]
})

// Listar salas activas
socket.emit('rooms:list', (response) => {
  console.log(response.rooms) // [{ name, memberCount, members }]
})
```

## 🌐 API HTTP

### Notificaciones

```bash
# Broadcast a todos
POST http://localhost:3333/api/notify/broadcast
Content-Type: application/json

{
  "message": "Mensaje para todos",
  "title": "Título",
  "type": "info"
}

# Enviar a usuario específico
POST http://localhost:3333/api/notify/user/:socketId
Content-Type: application/json

{
  "message": "Mensaje privado",
  "type": "success"
}

# Enviar a sala
POST http://localhost:3333/api/notify/room/:roomName
Content-Type: application/json

{
  "message": "Mensaje para la sala",
  "type": "warning"
}
```

### Consultas

```bash
# Ver usuarios conectados
GET http://localhost:3333/api/sockets

# Ver salas activas
GET http://localhost:3333/api/rooms

# Ver miembros de sala específica
GET http://localhost:3333/api/rooms/admins/members

# Health check
GET http://localhost:3333/health
```

## 🧪 Probar el Sistema

### Opción 1: Cliente Web (Recomendado)

1. Inicia el servidor: `npm start`
2. Abre `test-client.html` en tu navegador
3. Abre múltiples pestañas para simular varios usuarios
4. Prueba diferentes escenarios:
   - Enviar notificaciones broadcast
   - Unirse a salas
   - Enviar mensajes privados
   - Ver usuarios y salas en tiempo real

### Opción 2: Scripts de Terminal

**Linux/Mac:**
```bash
chmod +x test-api.sh
./test-api.sh
```

**Windows (PowerShell):**
```powershell
.\test-api.ps1
```

### Opción 3: curl

```bash
# Ver usuarios
curl http://localhost:3333/api/sockets

# Ver salas
curl http://localhost:3333/api/rooms

# Enviar notificación broadcast
curl -X POST http://localhost:3333/api/notify/broadcast \
  -H "Content-Type: application/json" \
  -d '{"message":"Hola a todos","type":"info"}'
```

## 📖 Documentación

- **[NOTIFICATION_TESTS.md](NOTIFICATION_TESTS.md)** - Guía completa de notificaciones
- **[USERS_AND_ROOMS.md](USERS_AND_ROOMS.md)** - Guía de consulta de usuarios y salas

## 🎯 Casos de Uso

### 1. Notificación Global
Enviar un mensaje a todos los usuarios conectados:

```typescript
socket.emit('notification:warning', {
  message: 'Mantenimiento programado en 5 minutos',
  title: 'Atención'
})
```

### 2. Notificación a Administradores
Enviar mensaje solo a usuarios en sala "admins":

```typescript
socket.emit('notification:send', {
  room: 'admins',
  message: 'Nuevo usuario registrado',
  type: 'info'
})
```

### 3. Mensaje Privado
Enviar notificación a un usuario específico:

```typescript
socket.emit('notification:send', {
  targetUserId: 'abc123xyz',
  message: 'Tu pedido ha sido procesado',
  type: 'success'
})
```

### 4. Dashboard de Admin
Mostrar usuarios conectados en tiempo real:

```typescript
useEffect(() => {
  socket.emit('users:list', (response) => {
    setUsers(response.users)
  })
  
  const interval = setInterval(() => {
    socket.emit('users:list', (response) => {
      setUsers(response.users)
    })
  }, 10000) // Actualizar cada 10 segundos
  
  return () => clearInterval(interval)
}, [socket])
```

## 🔧 Integración con Frontend

### React + Redux

```typescript
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { showAlert } from '@/features/shared/slices/ui.slice'
import { useSocket } from '@/hooks/useSocket'

export const NotificationListener = () => {
  const socket = useSocket()
  const dispatch = useDispatch()

  useEffect(() => {
    // Escuchar notificaciones
    socket.on('notification:receive', (alert) => {
      // Despachar directamente a Redux
      dispatch(showAlert(alert))
    })

    return () => {
      socket.off('notification:receive')
    }
  }, [socket, dispatch])

  return null
}
```

### Vue + Pinia

```typescript
import { defineStore } from 'pinia'

export const useNotificationStore = defineStore('notifications', {
  state: () => ({
    alerts: []
  }),
  actions: {
    addAlert(alert) {
      this.alerts.push(alert)
    }
  }
})

// En tu componente
const notificationStore = useNotificationStore()

socket.on('notification:receive', (alert) => {
  notificationStore.addAlert(alert)
})
```

## 🛠️ Desarrollo

```bash
# Instalar dependencias
npm install

# Modo desarrollo
npm run dev

# Compilar TypeScript
npm run build

# Iniciar producción
npm start
```

## 📊 Endpoints Disponibles

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/api/sockets` | Listar usuarios conectados |
| GET | `/api/rooms` | Listar salas activas |
| GET | `/api/rooms/:roomName/members` | Miembros de una sala |
| POST | `/api/notify/broadcast` | Notificación a todos |
| POST | `/api/notify/user/:socketId` | Notificación a usuario |
| POST | `/api/notify/room/:roomName` | Notificación a sala |

## 🔐 Autenticación

El sistema incluye un middleware de autenticación básico. Configúralo en `src/socket/auth.middleware.ts`:

```typescript
socket.on('connect', () => {
  socket.auth.token // Token del cliente
  socket.data.user  // Datos del usuario autenticado
})
```

## 🌟 Características Avanzadas

- ✅ Acknowledgments para confirmación de entrega
- ✅ Soporte para salas (rooms) múltiples
- ✅ IDs únicos para cada notificación
- ✅ Compatible con Redux/Pinia out-of-the-box
- ✅ TypeScript con tipado completo
- ✅ CORS configurado
- ✅ Websockets + Polling como fallback

## 📝 Licencia

MIT

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

---

Hecho con ❤️ usando Socket.IO y TypeScript
