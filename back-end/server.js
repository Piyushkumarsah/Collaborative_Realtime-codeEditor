const express = require('express');
const app = express();
const http = require('http');
const { Server } = require('socket.io');
const server = http.createServer(app);
const io = new Server(server);
const ACTIONS = require('./Actions')
const userDetails = {};
let pastM = '';
io.on(ACTIONS.CONNECTION, (socket) => {

  socket.on(ACTIONS.JOINROOM, ({ roomId, userName }) => {
    userDetails[socket.id] = userName;
    socket.join(roomId);
    if (pastM) {
      socket.emit(ACTIONS.PASTMESSAGES, pastM);
    }
    const room = io.sockets.adapter.rooms.get(roomId);
    if (room) {
      const clients_id = Array.from(room);
      const clients = clients_id.map(id => ({
        socketid: id,
        userName: userDetails[id]
      }));
      console.log("clients", clients)
      io.to(roomId).emit(ACTIONS.CLIENTS, ({ clients, userName: userDetails[socket.id] }));
    }
    else {
      console.log("NO room is Present");
    }
  });
  socket.on(ACTIONS.SYNC_CODE, (details) => {
    pastM = details.value;
    socket.in(details.roomId).emit(ACTIONS.SYNC_CODE, (details.value));
  })

  socket.on(ACTIONS.DISCONNECT, () => {
    const key = socket.id
    io.emit(ACTIONS.DISCONNECTED,({key,userName:userDetails[key]}));
    delete userDetails[key];
    console.log(`User ${socket.id} disconnected`);
    socket.leave()
  });
  socket.on(ACTIONS.LEFT,(details)=>{
    const key =details.socketid;
    const userName = details.userName;
    socket.in(details.roomId).emit(ACTIONS.DISCONNECTED,({key,userName}));
    delete userDetails[key];
    console.log(`User ${socket.id} disconnected due to leave`);
    socket.leave()
  })

});


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});