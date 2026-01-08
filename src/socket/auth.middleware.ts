import { Socket } from 'socket.io'

export function socketAuthMiddleware(
  socket: Socket,
  next: (err?: Error) => void
) {
  const token = socket.handshake.auth?.token

  if (!token) {
    return next(new Error('❌ No token provided'))
  }

  // ⚠️ Simulación de validación
  if (token !== 'test-token') {
    return next(new Error('❌ Invalid token'))
  }

  // Guardar info en socket
  socket.data.user = {
    id: 1,
    name: 'Test User'
  }

  next()
}
