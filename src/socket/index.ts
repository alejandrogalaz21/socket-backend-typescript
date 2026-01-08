// src/socket/index.ts
import { Server as HttpServer } from 'http'
import { Server, Socket } from 'socket.io'
import { socketAuthMiddleware } from './auth.middleware'
import { registerSocketEvents } from './events'

export let io: Server

export function initSocket(server: HttpServer) {
  io = new Server(server, {
    path: '/socket.io/',
    cors: {
      origin: '*'
    },
    transports: ['websocket', 'polling']
  })

  // 🔐 Auth middleware
  io.use(socketAuthMiddleware)

  io.on('connection', (socket: Socket) => {
    console.log(`🟢 Client connected: ${socket.id}`)

    registerSocketEvents(socket)

    socket.on('disconnect', () => {
      console.log(`🔴 Client disconnected: ${socket.id}`)
    })
  })
}
