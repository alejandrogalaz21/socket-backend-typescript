// src/server.ts
import express from 'express'
import http from 'http'
import cors from 'cors'
import { initSocket, io } from './socket'
import type { Alert, AlertType } from './socket/types'

const app = express()

app.use(cors())
app.use(express.json())

app.get('/health', (_, res) => {
  res.json({ status: 'ok' })
})

// ═══════════════════════════════════════════════════════════════
// 🧪 TEST ENDPOINTS - Para probar notificaciones desde HTTP
// ═══════════════════════════════════════════════════════════════

/**
 * 📨 Enviar notificación a todos los clientes conectados
 * POST /api/notify/broadcast
 */
app.post('/api/notify/broadcast', (req, res) => {
  const {
    message,
    title,
    type
  }: { message: string; title?: string; type: AlertType } = req.body

  if (!message || !type) {
    return res.status(400).json({ error: 'message and type are required' })
  }

  const alert: Alert = {
    id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    message,
    title,
    type
  }

  io.emit('notification:receive', alert)
  console.log('📢 Broadcast notification sent:', alert)

  res.json({ success: true, alert })
})

/**
 * 📨 Enviar notificación a un usuario específico (por socket ID)
 * POST /api/notify/user/:socketId
 */
app.post('/api/notify/user/:socketId', (req, res) => {
  const { socketId } = req.params
  const {
    message,
    title,
    type
  }: { message: string; title?: string; type: AlertType } = req.body

  if (!message || !type) {
    return res.status(400).json({ error: 'message and type are required' })
  }

  const alert: Alert = {
    id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    message,
    title,
    type
  }

  io.to(socketId).emit('notification:receive', alert)
  console.log(`📤 Notification sent to ${socketId}:`, alert)

  res.json({ success: true, alert, targetSocketId: socketId })
})

/**
 * 📨 Enviar notificación a una sala específica
 * POST /api/notify/room/:roomName
 */
app.post('/api/notify/room/:roomName', (req, res) => {
  const { roomName } = req.params
  const {
    message,
    title,
    type
  }: { message: string; title?: string; type: AlertType } = req.body

  if (!message || !type) {
    return res.status(400).json({ error: 'message and type are required' })
  }

  const alert: Alert = {
    id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    message,
    title,
    type
  }

  io.to(roomName).emit('notification:receive', alert)
  console.log(`📤 Notification sent to room ${roomName}:`, alert)

  res.json({ success: true, alert, targetRoom: roomName })
})

/**
 * 📊 Ver información de sockets conectados
 * GET /api/sockets
 */
app.get('/api/sockets', async (req, res) => {
  const sockets = await io.fetchSockets()
  const socketsInfo = sockets.map((s) => ({
    id: s.id,
    user: s.data.user,
    rooms: Array.from(s.rooms).filter((room) => room !== s.id)
  }))

  res.json({
    count: sockets.length,
    sockets: socketsInfo
  })
})

/**
 * 🚪 Ver todas las salas (rooms) activas con sus miembros
 * GET /api/rooms
 */
app.get('/api/rooms', async (req, res) => {
  const sockets = await io.fetchSockets()
  const roomsMap = new Map<string, Array<{ id: string; user: any }>>()

  // Recopilar todas las rooms y sus miembros
  for (const socket of sockets) {
    const rooms = Array.from(socket.rooms).filter((room) => room !== socket.id)

    for (const room of rooms) {
      if (!roomsMap.has(room)) {
        roomsMap.set(room, [])
      }
      roomsMap.get(room)!.push({
        id: socket.id,
        user: socket.data.user
      })
    }
  }

  // Convertir Map a array de objetos
  const roomsList = Array.from(roomsMap.entries()).map(([name, members]) => ({
    name,
    memberCount: members.length,
    members
  }))

  res.json({
    count: roomsList.length,
    rooms: roomsList
  })
})

/**
 * 👥 Ver miembros de una sala específica
 * GET /api/rooms/:roomName/members
 */
app.get('/api/rooms/:roomName/members', async (req, res) => {
  const { roomName } = req.params
  const socketsInRoom = await io.in(roomName).fetchSockets()

  const members = socketsInRoom.map((s) => ({
    id: s.id,
    user: s.data.user,
    allRooms: Array.from(s.rooms).filter((room) => room !== s.id)
  }))

  res.json({
    room: roomName,
    memberCount: members.length,
    members
  })
})

const server = http.createServer(app)

// 🔌 Inicializamos socket.io
initSocket(server)

const PORT = process.env.PORT || 3330

server.listen(PORT, () => {
  console.clear()
  console.log('═══════════════════════════════════════════════════════════')
  console.log('🔔 SOCKET.IO NOTIFICATION SYSTEM')
  console.log('═══════════════════════════════════════════════════════════')
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`📡 Socket.IO ready`)
  console.log('')
  console.log('📨 NOTIFICATION ENDPOINTS:')
  console.log(`   POST http://localhost:${PORT}/api/notify/broadcast`)
  console.log(`   POST http://localhost:${PORT}/api/notify/user/:socketId`)
  console.log(`   POST http://localhost:${PORT}/api/notify/room/:roomName`)
  console.log('')
  console.log('🔍 QUERY ENDPOINTS:')
  console.log(`   GET  http://localhost:${PORT}/api/sockets`)
  console.log(`   GET  http://localhost:${PORT}/api/rooms`)
  console.log(`   GET  http://localhost:${PORT}/api/rooms/:roomName/members`)
  console.log('')
  console.log('🧪 QUICK START:')
  console.log(`   1. Open test-client.html in your browser`)
  console.log(`   2. Open multiple tabs to simulate users`)
  console.log(`   3. Join rooms and send notifications`)
  console.log('')
  console.log('📖 DOCUMENTATION:')
  console.log('   - NOTIFICATION_TESTS.md  (Notification guide)')
  console.log('   - USERS_AND_ROOMS.md     (Users & rooms guide)')
  console.log('   - README.md              (Full documentation)')
  console.log('═══════════════════════════════════════════════════════════')
  console.log('')
})
