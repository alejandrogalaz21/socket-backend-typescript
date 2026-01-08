// src/server.ts
import express from 'express'
import http from 'http'
import cors from 'cors'
import { initSocket } from './socket'

const app = express()

app.use(cors())
app.use(express.json())

app.get('/health', (_, res) => {
  res.json({ status: 'ok' })
})

const server = http.createServer(app)

// 🔌 Inicializamos socket.io
initSocket(server)

const PORT = process.env.PORT || 3333

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
})
