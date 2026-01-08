import { Socket } from 'socket.io'

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
}
