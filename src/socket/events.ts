import { Socket } from 'socket.io'
import { io } from './index'
import type { Alert, NotificationPayload, AlertType } from './types'

/**
 * Generate a unique ID for alerts
 */
const generateAlertId = (): string => {
  return `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export function registerSocketEvents(socket: Socket) {
  // 🔔 Evento de prueba al conectar
  socket.emit('message', {
    text: '👋 Welcome from server',
    user: socket.data.user
  })

  // 📤 Cliente → servidor
  socket.on('message:send', (payload, ack) => {
    console.log('📨 Message received:', payload)

    // Respuesta ACK
    if (ack) {
      ack()
    }

    // Broadcast
    socket.broadcast.emit('message', {
      text: payload.text,
      from: socket.data.user.name
    })
  })

  socket.on('user:typing', (data) => {
    console.log('⌨️ User typing:', data)
  })

  // ═══════════════════════════════════════════════════════════════
  // 🔔 NOTIFICATION EVENTS
  // ═══════════════════════════════════════════════════════════════

  /**
   * 📨 SEND NOTIFICATION
   * Permite enviar una notificación a:
   * - Un usuario específico (targetUserId)
   * - Una sala específica (room)
   * - Todos los usuarios (broadcast)
   */
  socket.on('notification:send', (payload: NotificationPayload, ack) => {
    console.log('🔔 Notification received:', payload)

    const alert: Alert = {
      id: generateAlertId(),
      message: payload.message,
      title: payload.title,
      type: payload.type
    }

    // 1️⃣ Enviar a usuario específico
    if (payload.targetUserId) {
      io.to(payload.targetUserId).emit('notification:receive', alert)
      console.log(`📤 Notification sent to user: ${payload.targetUserId}`)
    }
    // 2️⃣ Enviar a sala específica
    else if (payload.room) {
      io.to(payload.room).emit('notification:receive', alert)
      console.log(`📤 Notification sent to room: ${payload.room}`)
    }
    // 3️⃣ Broadcast a todos (excepto el emisor)
    else {
      socket.broadcast.emit('notification:receive', alert)
      console.log('📤 Notification broadcast to all users')
    }

    // Confirmación ACK
    if (ack) {
      ack({ success: true, alertId: alert.id })
    }
  })

  /**
   * 🟢 SUCCESS NOTIFICATION
   * Atajo para enviar notificaciones de éxito
   */
  socket.on(
    'notification:success',
    (
      data: {
        message: string
        title?: string
        targetUserId?: string
        room?: string
      },
      ack
    ) => {
      const alert: Alert = {
        id: generateAlertId(),
        message: data.message,
        title: data.title,
        type: 'success'
      }

      if (data.targetUserId) {
        io.to(data.targetUserId).emit('notification:receive', alert)
      } else if (data.room) {
        io.to(data.room).emit('notification:receive', alert)
      } else {
        socket.broadcast.emit('notification:receive', alert)
      }

      console.log('🟢 Success notification sent:', alert)
      if (ack) ack({ success: true, alertId: alert.id })
    }
  )

  /**
   * 🔴 ERROR NOTIFICATION
   * Atajo para enviar notificaciones de error
   */
  socket.on(
    'notification:error',
    (
      data: {
        message: string
        title?: string
        targetUserId?: string
        room?: string
      },
      ack
    ) => {
      const alert: Alert = {
        id: generateAlertId(),
        message: data.message,
        title: data.title,
        type: 'error'
      }

      if (data.targetUserId) {
        io.to(data.targetUserId).emit('notification:receive', alert)
      } else if (data.room) {
        io.to(data.room).emit('notification:receive', alert)
      } else {
        socket.broadcast.emit('notification:receive', alert)
      }

      console.log('🔴 Error notification sent:', alert)
      if (ack) ack({ success: true, alertId: alert.id })
    }
  )

  /**
   * 🔵 INFO NOTIFICATION
   * Atajo para enviar notificaciones informativas
   */
  socket.on(
    'notification:info',
    (
      data: {
        message: string
        title?: string
        targetUserId?: string
        room?: string
      },
      ack
    ) => {
      const alert: Alert = {
        id: generateAlertId(),
        message: data.message,
        title: data.title,
        type: 'info'
      }

      if (data.targetUserId) {
        io.to(data.targetUserId).emit('notification:receive', alert)
      } else if (data.room) {
        io.to(data.room).emit('notification:receive', alert)
      } else {
        socket.broadcast.emit('notification:receive', alert)
      }

      console.log('🔵 Info notification sent:', alert)
      if (ack) ack({ success: true, alertId: alert.id })
    }
  )

  /**
   * 🟡 WARNING NOTIFICATION
   * Atajo para enviar notificaciones de advertencia
   */
  socket.on(
    'notification:warning',
    (
      data: {
        message: string
        title?: string
        targetUserId?: string
        room?: string
      },
      ack
    ) => {
      const alert: Alert = {
        id: generateAlertId(),
        message: data.message,
        title: data.title,
        type: 'warning'
      }

      if (data.targetUserId) {
        io.to(data.targetUserId).emit('notification:receive', alert)
      } else if (data.room) {
        io.to(data.room).emit('notification:receive', alert)
      } else {
        socket.broadcast.emit('notification:receive', alert)
      }

      console.log('🟡 Warning notification sent:', alert)
      if (ack) ack({ success: true, alertId: alert.id })
    }
  )

  /**
   * 🚪 JOIN ROOM
   * Permite unirse a una sala para recibir notificaciones dirigidas
   */
  socket.on('room:join', (roomName: string, ack) => {
    socket.join(roomName)
    console.log(
      `🚪 User ${socket.data.user?.name || socket.id} joined room: ${roomName}`
    )

    if (ack) {
      ack({ success: true, room: roomName })
    }
  })

  /**
   * 🚶 LEAVE ROOM
   * Permite salir de una sala
   */
  socket.on('room:leave', (roomName: string, ack) => {
    socket.leave(roomName)
    console.log(
      `🚶 User ${socket.data.user?.name || socket.id} left room: ${roomName}`
    )

    if (ack) {
      ack({ success: true, room: roomName })
    }
  })

  /**
   * 📋 GET ALL ROOMS
   * Obtener lista de todas las salas activas con sus miembros
   */
  socket.on('rooms:list', async (ack) => {
    const sockets = await io.fetchSockets()
    const roomsMap = new Map<string, Array<{ id: string; user: any }>>()

    // Recopilar todas las rooms y sus miembros
    for (const s of sockets) {
      const rooms = Array.from(s.rooms).filter((room) => room !== s.id)

      for (const room of rooms) {
        if (!roomsMap.has(room)) {
          roomsMap.set(room, [])
        }
        roomsMap.get(room)!.push({
          id: s.id,
          user: s.data.user
        })
      }
    }

    // Convertir Map a array de objetos
    const roomsList = Array.from(roomsMap.entries()).map(([name, members]) => ({
      name,
      memberCount: members.length,
      members
    }))

    console.log(`📋 Rooms list requested by ${socket.id}`)

    if (ack) {
      ack({
        success: true,
        count: roomsList.length,
        rooms: roomsList
      })
    }
  })

  /**
   * 👥 GET ROOM MEMBERS
   * Obtener miembros de una sala específica
   */
  socket.on('room:members', async (roomName: string, ack) => {
    const socketsInRoom = await io.in(roomName).fetchSockets()

    const members = socketsInRoom.map((s) => ({
      id: s.id,
      user: s.data.user,
      allRooms: Array.from(s.rooms).filter((room) => room !== s.id)
    }))

    console.log(`👥 Room members requested for: ${roomName}`)

    if (ack) {
      ack({
        success: true,
        room: roomName,
        memberCount: members.length,
        members
      })
    }
  })

  /**
   * 🌐 GET ALL CONNECTED USERS
   * Obtener lista de todos los usuarios conectados
   */
  socket.on('users:list', async (ack) => {
    const sockets = await io.fetchSockets()
    const users = sockets.map((s) => ({
      id: s.id,
      user: s.data.user,
      rooms: Array.from(s.rooms).filter((room) => room !== s.id)
    }))

    console.log(`🌐 Users list requested by ${socket.id}`)

    if (ack) {
      ack({
        success: true,
        count: users.length,
        users
      })
    }
  })
}
