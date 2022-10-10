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

app.use(cors())

io.on('connection', socket => {
    console.log('user connected')
    io.emit('myId', socket.id)
})

const PORT = 3000

server.listen(PORT, () => console.log(`server running on localhost:${PORT}`))