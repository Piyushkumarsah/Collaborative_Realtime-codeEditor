import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client'
const socket = io('http://localhost:5000', {
  reconnectionAttempts: 'Infinity',
  transports: ['websocket']
})

export default function Editor() {
  const location = useLocation();
  const [data, setdata] = useState('');
  const roomId = location.state.roomId;
  const userName = location.state.userName;
  const [clients, setClients] = useState([]);
  useEffect(() => {
    socket.emit('joinRoom', ({ roomId, userName}));
    socket.on('clientsInRoom', (clientsData) => {
      setClients(clientsData); // Update the clients state
    });
    socket.on('pastMessage',(pastMess)=>{
      setdata(pastMess);
    })
    socket.on('message', (messageData) => {
      // Update the message display with the received data
      // You can update the state to store messages or directly render them based on your choice
      // example: update state
      // setMessages((prevMessages) => [...prevMessages, messageData]);
      console.log(messageData.text, " data is this")
      setdata(messageData.text);
    });

  }, []);
  return (
    <div className='text-white h-screen bg-slate-950 '>
      <div><div>Welcome {location.state.userName}</div></div>
      <div className='flex justify-between'>
        <div>Connected..</div>
        {clients && (
          <div>
            {clients.map((client) => (
              <span key={client.socketid} className='text-white h-24 w-24 m-1'>
                {client.userName}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className='h-full flex w-full'>
        <textarea
          value={data}
          className='h-full w-full bg-slate-800'
          placeholder='Enter Text Here'
          onChange={(e) => {socket.emit('roomMessage',{roomId,text: e.target.value})}}
        ></textarea>
      </div>
    </div>
  );
}
// server
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const usersDetails = {};
let pastM = '';
io.on('connection', (socket) => {
  console.log('A user connected');

  // Handle joining a room
  socket.on('joinRoom', (details) => {

    socket.join(details.roomId);
    usersDetails[socket.id] = details.userName;
  if(pastM){
    socket.emit('pastMessage',pastM);
  }
    console.log(`User ${socket.id} joined room ${details.roomId}`);
    // Get all connected clients in the room
    const room = io.sockets.adapter.rooms.get(details.roomId);
    if (room) {
      const clientsInRoom = Array.from(room);
      const clientsData = clientsInRoom.map(clientId => ({
        socketid: clientId,
        userName: usersDetails[clientId]
      }));
       // broadcast to all clients in the room:
      io.to(details.roomId).emit('clientsInRoom', clientsData);
    } else {
      console.log(`Room ${details.roomId} does not exist or has no clients.`);
    }
  });

  // Handle messages within a room
  socket.on('roomMessage', (data) => {
    pastM = data.text;
    io.to(data.roomId).emit('message', {
      sender: socket.id,
      text: data.text,
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    const key = socket.id
    delete usersDetails[key];
    console.log(`User ${socket.id} disconnected`);
  });
});





const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

