# 🔔 Sistema de Notificaciones - Guía de Pruebas

## 📋 Tabla de Contenidos
- [Eventos Socket.IO](#eventos-socketio)
- [Endpoints HTTP](#endpoints-http)
- [Consulta de Usuarios y Salas](#consulta-de-usuarios-y-salas)
- [Ejemplos de Prueba](#ejemplos-de-prueba)

> 💡 **Nuevo:** Para ver cómo consultar usuarios conectados y salas activas, consulta [USERS_AND_ROOMS.md](USERS_AND_ROOMS.md)

---

## 🔌 Eventos Socket.IO

### Cliente → Servidor

#### 1. `notification:send` - Enviar notificación genérica
```typescript
socket.emit('notification:send', {
  message: 'Este es un mensaje de prueba',
  title: 'Título opcional',
  type: 'success', // 'success' | 'error' | 'info' | 'warning'
  targetUserId?: 'socket-id-especifico', // Opcional
  room?: 'nombre-sala' // Opcional
}, (response) => {
  console.log('ACK:', response) // { success: true, alertId: '...' }
})
```

#### 2. `notification:success` - Atajo para notificaciones de éxito
```typescript
socket.emit('notification:success', {
  message: '¡Operación completada!',
  title: 'Éxito'
}, (response) => {
  console.log('ACK:', response)
})
```

#### 3. `notification:error` - Atajo para notificaciones de error
```typescript
socket.emit('notification:error', {
  message: 'Algo salió mal',
  title: 'Error'
})
```

#### 4. `notification:info` - Atajo para notificaciones informativas
```typescript
socket.emit('notification:info', {
  message: 'Nueva actualización disponible',
  title: 'Información'
})
```

#### 5. `notification:warning` - Atajo para advertencias
```typescript
socket.emit('notification:warning', {
  message: 'Ten cuidado con esta acción',
  title: 'Advertencia'
})
```

#### 6. `room:join` - Unirse a una sala
```typescript
socket.emit('room:join', 'admins', (response) => {
  console.log('Joined room:', response.room)
})
```

#### 7. `room:leave` - Salir de una sala
```typescript
socket.emit('room:leave', 'admins', (response) => {
  console.log('Left room:', response.room)
})
```

### Servidor → Cliente

#### `notification:receive` - Recibir notificación
```typescript
socket.on('notification:receive', (alert) => {
  console.log('Nueva notificación:', alert)
  // alert = {
  //   id: 'alert-1234567890-abc123',
  //   message: 'Mensaje de la notificación',
  //   title: 'Título opcional',
  //   type: 'success' | 'error' | 'info' | 'warning'
  // }
  
  // En tu frontend, despachar a Redux:
  // dispatch(showAlert(alert))
})
```

---

## 🌐 Endpoints HTTP

### 1. Broadcast a todos los clientes
```bash
POST http://localhost:3333/api/notify/broadcast
Content-Type: application/json

{
  "message": "Mantenimiento programado en 5 minutos",
  "title": "Atención",
  "type": "warning"
}
```

### 2. Enviar a usuario específico
```bash
POST http://localhost:3333/api/notify/user/{socketId}
Content-Type: application/json

{
  "message": "Tu pedido ha sido procesado",
  "title": "¡Listo!",
  "type": "success"
}
```

### 3. Enviar a sala específica
```bash
POST http://localhost:3333/api/notify/room/admins
Content-Type: application/json

{
  "message": "Nuevo usuario registrado",
  "title": "Notificación de administrador",
  "type": "info"
}
```

### 4. Ver sockets conectados
```bash
GET http://localhost:3333/api/sockets
```

### 5. Ver salas activas
```bash
GET http://localhost:3333/api/rooms
```

### 6. Ver miembros de una sala
```bash
GET http://localhost:3333/api/rooms/admins/members
```

---

## 🔍 Consulta de Usuarios y Salas

Para obtener información sobre usuarios conectados y salas activas, tienes varias opciones:

### Eventos Socket.IO:
- `users:list` - Obtener todos los usuarios conectados
- `rooms:list` - Obtener todas las salas activas
- `room:members` - Obtener miembros de una sala específica

### Endpoints HTTP:
- `GET /api/sockets` - Usuarios conectados
- `GET /api/rooms` - Salas activas
- `GET /api/rooms/:roomName/members` - Miembros de sala

**📖 Ver guía completa:** [USERS_AND_ROOMS.md](USERS_AND_ROOMS.md)

**🧪 Scripts de prueba:**
- Linux/Mac: `./test-api.sh`
- Windows: `.\test-api.ps1`

---

## 🧪 Ejemplos de Prueba

### Escenario 1: Notificación Broadcast (Todos los usuarios)

**Desde el cliente Socket.IO:**
```typescript
// Usuario A emite
socket.emit('notification:success', {
  message: '¡Nueva versión disponible!',
  title: 'Actualización'
})

// Usuario B, C, D... reciben
socket.on('notification:receive', (alert) => {
  dispatch(showAlert(alert))
})
```

**Desde HTTP (curl):**
```bash
curl -X POST http://localhost:3333/api/notify/broadcast \
  -H "Content-Type: application/json" \
  -d '{
    "message": "El servidor se reiniciará en 2 minutos",
    "title": "Mantenimiento",
    "type": "warning"
  }'
```

---

### Escenario 2: Notificación a Usuario Específico

**Paso 1: Obtener socket IDs**
```bash
curl http://localhost:3333/api/sockets
```

Respuesta:
```json
{
  "count": 3,
  "sockets": [
    {
      "id": "abc123xyz",
      "user": { "name": "Alice" },
      "rooms": []
    },
    {
      "id": "def456uvw",
      "user": { "name": "Bob" },
      "rooms": ["admins"]
    }
  ]
}
```

**Paso 2: Enviar notificación a Alice**
```bash
curl -X POST http://localhost:3333/api/notify/user/abc123xyz \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Tu reporte está listo",
    "title": "Reporte",
    "type": "success"
  }'
```

---

### Escenario 3: Notificaciones por Salas

**Cliente 1: Admin se une a sala**
```typescript
socket.emit('room:join', 'admins', (response) => {
  console.log('✅ Joined:', response.room)
})
```

**Cliente 2: Otro admin se une**
```typescript
socket.emit('room:join', 'admins')
```

**Servidor envía notificación solo a admins:**
```bash
curl -X POST http://localhost:3333/api/notify/room/admins \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Revisión pendiente requerida",
    "title": "Admin Alert",
    "type": "info"
  }'
```

**Cliente regular (no admin) NO recibe la notificación** ✅

---

### Escenario 4: Múltiples Tipos de Notificaciones

```typescript
// Success
socket.emit('notification:success', {
  message: 'Archivo subido correctamente',
  title: 'Upload Complete'
})

// Error
socket.emit('notification:error', {
  message: 'No se pudo conectar al servidor',
  title: 'Connection Error'
})

// Info
socket.emit('notification:info', {
  message: 'Tienes 3 mensajes nuevos',
  title: 'Messages'
})

// Warning
socket.emit('notification:warning', {
  message: 'Tu sesión expirará en 5 minutos',
  title: 'Session Warning'
})
```

---

### Escenario 5: Con Acknowledgments (ACK)

```typescript
socket.emit('notification:send', {
  message: 'Test notification',
  type: 'info'
}, (response) => {
  if (response.success) {
    console.log('✅ Notification sent with ID:', response.alertId)
    // Puedes guardar el alertId para referencia futura
  }
})
```

---

## 🎯 Integración con Redux (Frontend)

```typescript
// En tu componente o hook de Socket.IO
useEffect(() => {
  socket.on('notification:receive', (alert: Alert) => {
    // Despachar directamente a Redux
    dispatch(showAlert(alert))
  })

  return () => {
    socket.off('notification:receive')
  }
}, [socket, dispatch])
```

---

## 🔧 Probar con Thunder Client / Postman

### Collection de Pruebas

**1. Broadcast Success**
```
POST http://localhost:3333/api/notify/broadcast
{
  "message": "¡Bienvenidos a la nueva versión!",
  "title": "Welcome",
  "type": "success"
}
```

**2. Broadcast Error**
```
POST http://localhost:3333/api/notify/broadcast
{
  "message": "Error de conexión detectado",
  "title": "System Error",
  "type": "error"
}
```

**3. Broadcast Info**
```
POST http://localhost:3333/api/notify/broadcast
{
  "message": "Actualización de términos de servicio",
  "title": "Terms Update",
  "type": "info"
}
```

**4. Broadcast Warning**
```
POST http://localhost:3333/api/notify/broadcast
{
  "message": "Mantenimiento programado para mañana",
  "title": "Scheduled Maintenance",
  "type": "warning"
}
```

---

## 📊 Verificar Logs del Servidor

Al enviar notificaciones, verás en consola:
```
🔔 Notification received: { message: '...', type: 'success', ... }
📤 Notification broadcast to all users
```

---

## ✅ Checklist de Pruebas

- [ ] Cliente puede enviar notificación broadcast
- [ ] Cliente puede enviar notificación a usuario específico
- [ ] Cliente puede enviar notificación a sala específica
- [ ] Servidor HTTP puede enviar notificación broadcast
- [ ] Servidor HTTP puede enviar notificación a usuario específico
- [ ] Servidor HTTP puede enviar notificación a sala específica
- [ ] Los 4 tipos de alertas funcionan (success, error, info, warning)
- [ ] Acknowledgments funcionan correctamente
- [ ] Join/Leave rooms funcionan
- [ ] Frontend recibe y procesa notificaciones en Redux

---

## 🚀 Inicio Rápido

1. **Iniciar servidor:**
```bash
npm start
```

2. **Conectar cliente desde navegador:**
```html
<script src="https://cdn.socket.io/4.5.4/socket.io.min.js"></script>
<script>
  const socket = io('http://localhost:3333', {
    auth: { token: 'test-token' }
  })

  socket.on('notification:receive', (alert) => {
    console.log('🔔 Notification:', alert)
  })

  // Enviar notificación de prueba
  socket.emit('notification:success', {
    message: 'Hello from browser!',
    title: 'Test'
  })
</script>
```

3. **Probar con curl:**
```bash
curl -X POST http://localhost:3333/api/notify/broadcast \
  -H "Content-Type: application/json" \
  -d '{"message":"Test from curl","type":"info"}'
```
