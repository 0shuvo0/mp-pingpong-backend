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

function createGameStartData(){
  const gameData = {
    ballData: {
      x: 50,
      y: 50,
      vx: Math.random() + 2,
      vy: Math.random() + 2
    },
    leftPadData: {
        y: 30
    },
    rightPadData: {
        y: 60
    }
  }
  gameData.ballData.x = 50 + (Math.random() * 50)
  gameData.ballData.y = 50 + (Math.random() * 50)
  if(Math.random() > .5) gameData.ballData.vx *= -1
  if(Math.random() > .5) gameData.ballData.vy *= -1

  return gameData
}

function checkReadyState(roomId, opponentSocket, socket){
  const room = rooms[roomId]
  const playersReady = room.userReady && room.opponentReady
  if(!playersReady) return
  const startData = createGameStartData()
  opponentSocket.emit('startGame', startData)
  socket.emit('startGame', startData)
}

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

  socket.on('playerReady', roomId => {
    rooms[roomId].userReady = true
    const room = rooms[roomId]
    io.to(room.opponentId).emit('opponentReady')
    checkReadyState(roomId, io.to(room.opponentId), socket)
  })
  socket.on('opponentReady', roomId => {
    rooms[roomId].opponentReady = true
    const room = rooms[roomId]
    io.to(room.userId).emit('opponentReady')
    checkReadyState(roomId, io.to(room.opponentId), socket)
  })
})

const PORT = 3000

server.listen(PORT, () => console.log(`server running on localhost:${PORT}`))