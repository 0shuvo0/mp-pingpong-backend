const express = require('express')
const app = express()
const { createServer } = require("http")
const { Server } = require("socket.io")
const server = createServer()
const io = new Server(server, {
  cors: {
    origin: "http://localhost:8080",
    credentials: true
  }
})
const cors = require('cors')

const rooms = {}

const generateRoomId = () => (+ new Date()) + '-' + parseInt(Math.random() * 999)

app.use(cors())

io.on('connection', socket => {
  socket.on('createRoom', data => {
    const roomId = generateRoomId()
    rooms[roomId] = data
    socket.emit('roomCreated', {
      roomId,
      userType: 'challanger'
    })
    io.to(data.opponentId).emit('roomCreated', {
      roomId,
      userType: 'challanged'
    })
  })
})

const PORT = 3000

server.listen(PORT, () => console.log(`server running on localhost:${PORT}`))