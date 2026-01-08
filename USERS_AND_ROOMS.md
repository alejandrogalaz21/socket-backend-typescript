# 🔍 Guía de Consulta: Usuarios y Salas

Esta guía te muestra cómo obtener información sobre usuarios conectados y salas activas.

---

## 📡 Eventos Socket.IO (Desde el Cliente)

### 1️⃣ Obtener lista de todos los usuarios conectados

```javascript
socket.emit('users:list', (response) => {
  console.log('Usuarios conectados:', response)
  /*
  {
    success: true,
    count: 3,
    users: [
      {
        id: "abc123xyz",
        user: { name: "Alice", email: "alice@example.com" },
        rooms: ["admins", "vips"]
      },
      {
        id: "def456uvw",
        user: { name: "Bob" },
        rooms: []
      }
    ]
  }
  */
})
```

**Uso en React/Redux:**
```typescript
useEffect(() => {
  socket.emit('users:list', (response) => {
    if (response.success) {
      setConnectedUsers(response.users)
    }
  })
}, [socket])
```

---

### 2️⃣ Obtener lista de todas las salas activas

```javascript
socket.emit('rooms:list', (response) => {
  console.log('Salas activas:', response)
  /*
  {
    success: true,
    count: 2,
    rooms: [
      {
        name: "admins",
        memberCount: 3,
        members: [
          { id: "abc123", user: { name: "Alice" } },
          { id: "def456", user: { name: "Bob" } },
          { id: "ghi789", user: { name: "Charlie" } }
        ]
      },
      {
        name: "vips",
        memberCount: 1,
        members: [
          { id: "abc123", user: { name: "Alice" } }
        ]
      }
    ]
  }
  */
})
```

---

### 3️⃣ Obtener miembros de una sala específica

```javascript
socket.emit('room:members', 'admins', (response) => {
  console.log('Miembros de admins:', response)
  /*
  {
    success: true,
    room: "admins",
    memberCount: 3,
    members: [
      {
        id: "abc123",
        user: { name: "Alice" },
        allRooms: ["admins", "vips"]
      },
      {
        id: "def456",
        user: { name: "Bob" },
        allRooms: ["admins"]
      }
    ]
  }
  */
})
```

---

## 🌐 Endpoints HTTP (Para testing o backend-to-backend)

### 1️⃣ GET /api/sockets - Obtener usuarios conectados

```bash
curl http://localhost:3333/api/sockets
```

**Respuesta:**
```json
{
  "count": 3,
  "sockets": [
    {
      "id": "abc123xyz",
      "user": { "name": "Alice", "email": "alice@example.com" },
      "rooms": ["admins", "vips"]
    },
    {
      "id": "def456uvw",
      "user": { "name": "Bob" },
      "rooms": ["admins"]
    },
    {
      "id": "ghi789rst",
      "user": { "name": "Charlie" },
      "rooms": []
    }
  ]
}
```

**Uso en código:**
```typescript
const response = await fetch('http://localhost:3333/api/sockets')
const data = await response.json()
console.log(`${data.count} usuarios conectados`)
```

---

### 2️⃣ GET /api/rooms - Obtener todas las salas

```bash
curl http://localhost:3333/api/rooms
```

**Respuesta:**
```json
{
  "count": 2,
  "rooms": [
    {
      "name": "admins",
      "memberCount": 2,
      "members": [
        { "id": "abc123", "user": { "name": "Alice" } },
        { "id": "def456", "user": { "name": "Bob" } }
      ]
    },
    {
      "name": "vips",
      "memberCount": 1,
      "members": [
        { "id": "abc123", "user": { "name": "Alice" } }
      ]
    }
  ]
}
```

---

### 3️⃣ GET /api/rooms/:roomName/members - Miembros de sala específica

```bash
curl http://localhost:3333/api/rooms/admins/members
```

**Respuesta:**
```json
{
  "room": "admins",
  "memberCount": 2,
  "members": [
    {
      "id": "abc123xyz",
      "user": { "name": "Alice" },
      "allRooms": ["admins", "vips"]
    },
    {
      "id": "def456uvw",
      "user": { "name": "Bob" },
      "allRooms": ["admins"]
    }
  ]
}
```

---

## 🎯 Escenarios de Uso

### Escenario 1: Dashboard de Administración
Mostrar usuarios conectados en tiempo real

```typescript
// En tu componente de React
const AdminDashboard = () => {
  const [users, setUsers] = useState([])
  const [rooms, setRooms] = useState([])
  const socket = useSocket()

  useEffect(() => {
    // Cargar inicial
    socket.emit('users:list', (response) => {
      setUsers(response.users)
    })

    socket.emit('rooms:list', (response) => {
      setRooms(response.rooms)
    })

    // Actualizar cada 10 segundos
    const interval = setInterval(() => {
      socket.emit('users:list', (response) => {
        setUsers(response.users)
      })
    }, 10000)

    return () => clearInterval(interval)
  }, [socket])

  return (
    <div>
      <h2>Usuarios Conectados: {users.length}</h2>
      <ul>
        {users.map(user => (
          <li key={user.id}>
            {user.user.name} - Salas: {user.rooms.join(', ')}
          </li>
        ))}
      </ul>
    </div>
  )
}
```

---

### Escenario 2: Enviar notificación a usuarios de una sala específica

```typescript
// Primero, obtener miembros de la sala
socket.emit('room:members', 'admins', (response) => {
  console.log(`Hay ${response.memberCount} admins conectados`)
  
  // Luego, enviar notificación a todos ellos
  socket.emit('notification:send', {
    room: 'admins',
    message: 'Reunión de administradores en 5 minutos',
    title: 'Recordatorio',
    type: 'warning'
  })
})
```

---

### Escenario 3: Enviar notificación solo a usuarios SIN sala (usuarios normales)

```typescript
socket.emit('users:list', (response) => {
  const regularUsers = response.users.filter(u => u.rooms.length === 0)
  
  regularUsers.forEach(user => {
    socket.emit('notification:send', {
      targetUserId: user.id,
      message: '¡Únete a una sala para recibir beneficios!',
      type: 'info'
    })
  })
})
```

---

### Escenario 4: Verificar si un usuario está en una sala antes de enviar

```typescript
function sendToUserIfInRoom(userId: string, roomName: string, message: string) {
  socket.emit('room:members', roomName, (response) => {
    const isMember = response.members.some(m => m.id === userId)
    
    if (isMember) {
      socket.emit('notification:send', {
        targetUserId: userId,
        message,
        type: 'success'
      })
      console.log(`✅ Notificación enviada a ${userId}`)
    } else {
      console.log(`❌ Usuario ${userId} no está en la sala ${roomName}`)
    }
  })
}

// Uso:
sendToUserIfInRoom('abc123', 'admins', 'Mensaje exclusivo para admins')
```

---

### Escenario 5: Obtener estadísticas

```typescript
async function getServerStats() {
  const socketsRes = await fetch('http://localhost:3333/api/sockets')
  const socketsData = await socketsRes.json()
  
  const roomsRes = await fetch('http://localhost:3333/api/rooms')
  const roomsData = await roomsRes.json()
  
  return {
    totalUsers: socketsData.count,
    totalRooms: roomsData.count,
    usersInRooms: socketsData.sockets.filter(s => s.rooms.length > 0).length,
    usersWithoutRooms: socketsData.sockets.filter(s => s.rooms.length === 0).length,
    roomsData: roomsData.rooms.map(r => ({
      name: r.name,
      members: r.memberCount
    }))
  }
}

// Uso:
getServerStats().then(stats => {
  console.log('📊 Estadísticas del servidor:', stats)
})
```

---

## 🧪 Pruebas con el Cliente HTML

1. **Abre `test-client.html` en el navegador**
2. **Abre varias pestañas** (para simular múltiples usuarios)
3. **En cada pestaña:**
   - Únete a diferentes salas ("admins", "vips", "support")
   - Observa cómo se actualiza la lista de usuarios y salas
4. **Haz clic en "🔄 Actualizar Lista"** para ver cambios en tiempo real
5. **Usa los botones "📨"** para enviar notificaciones directamente desde las tablas

---

## 💡 Tips y Mejores Prácticas

### ✅ Recomendado

```typescript
// ✅ Usar acknowledgments para verificar
socket.emit('users:list', (response) => {
  if (response.success) {
    // Procesar datos
  }
})

// ✅ Cachear resultados si no cambian frecuentemente
let cachedUsers = []
let lastFetch = 0

function getUsers() {
  const now = Date.now()
  if (now - lastFetch > 5000) { // Cache por 5 segundos
    socket.emit('users:list', (response) => {
      cachedUsers = response.users
      lastFetch = now
    })
  }
  return cachedUsers
}

// ✅ Combinar consultas para eficiencia
async function getFullServerState() {
  return Promise.all([
    new Promise(resolve => socket.emit('users:list', resolve)),
    new Promise(resolve => socket.emit('rooms:list', resolve))
  ])
}
```

### ❌ Evitar

```typescript
// ❌ No hacer polling muy frecuente
setInterval(() => {
  socket.emit('users:list', ...) // Cada 100ms es excesivo
}, 100)

// ❌ No ignorar el manejo de errores
socket.emit('users:list') // Sin callback

// ❌ No hacer múltiples consultas innecesarias
for (let i = 0; i < 100; i++) {
  socket.emit('users:list', ...) // Esto sobrecarga el servidor
}
```

---

## 🔧 Debugging

Para ver qué usuarios/salas existen en tiempo real:

```bash
# Terminal 1: Iniciar servidor
npm start

# Terminal 2: Monitorear usuarios (polling cada 3 segundos)
watch -n 3 "curl -s http://localhost:3333/api/sockets | jq"

# Terminal 3: Monitorear salas
watch -n 3 "curl -s http://localhost:3333/api/rooms | jq"
```

En Windows (PowerShell):
```powershell
# Monitorear usuarios
while ($true) { 
  curl http://localhost:3333/api/sockets | ConvertFrom-Json | ConvertTo-Json -Depth 10
  Start-Sleep -Seconds 3
  Clear-Host
}
```

---

## 📝 Resumen

| Necesidad | Método | Endpoint/Evento |
|-----------|--------|-----------------|
| Ver todos los usuarios | Socket.IO | `socket.emit('users:list', callback)` |
| Ver todos los usuarios | HTTP | `GET /api/sockets` |
| Ver todas las salas | Socket.IO | `socket.emit('rooms:list', callback)` |
| Ver todas las salas | HTTP | `GET /api/rooms` |
| Ver miembros de sala | Socket.IO | `socket.emit('room:members', 'sala', callback)` |
| Ver miembros de sala | HTTP | `GET /api/rooms/sala/members` |
| Enviar a usuario | Socket.IO | `socket.emit('notification:send', { targetUserId: '...' })` |
| Enviar a sala | Socket.IO | `socket.emit('notification:send', { room: '...' })` |
| Enviar a todos | Socket.IO | `socket.emit('notification:send', { ... })` (sin target ni room) |

---

¡Listo para usar! 🚀
