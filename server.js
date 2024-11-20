const express = require('express');
const app = express();
const http = require('http');
const { Server } = require('socket.io');
const server = http.createServer(app);
const io = new Server(server);
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const ACTIONS = require('./src/Actions')
const cors = require('cors');
const roomModel = require('./roomModel');
const userDetails = {};
app.use(bodyParser.json());
app.use(express.json());
app.use(cors());
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

  
  socket.on(ACTIONS.SEND_CODE_TO_CLIENT, (arg, callback) => {
    console.log(arg,"our agr is here")
    socket.to(arg.roomId).emit(ACTIONS.SEND_CODE_TO_SERVER, arg);
    callback("sent client from server")
});

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

mongoose.connect('mongodb://localhost:27017/CodeDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('Error connecting to MongoDB', err);
});

app.post('/rooms', async (req, res) => {
  try {
    const { roomId, userName, content, userId } = req.body;
    const room = await roomModel.findOne({ roomId });

    if (room) {
      // Room exists, check if the user is already in the room
      const user = room.user.find(user => user.userName === userName);

      if (user) {
        // User already exists, send the content of that user
        console.log(user.content,"user conent is here dear")
        res.status(200).json({ message: 'User already in the room', userContent: user.content });
      } else {
        // User does not exist in the room, add them
        room.user.push({ userName, content, userId });
        await room.save();
        res.status(200).send('User added to the existing room');
      }
    } else {
      // Room does not exist, create a new room
      const newRoom = new roomModel({
        roomId,
        user: [{ userName, content, userId }]
      });
      await newRoom.save();
      res.status(201).send('New room created');
    }
  } catch (error) {
    console.log(error, "here is the error");
    res.status(500).send('Server error');
  }
});

app.get('/getprevdata', async (req,res) =>{
  const {roomId,userName} = req.body;
  const room = await roomModel.findOne(
    { roomId, 'user.userName': userName },
    { new: true }
  );
  console.log(room,"here is teh room")

})
app.put('/rooms/:roomId/user/:userName', async (req, res) => {
  try {
    const { roomId, userName } = req.params;
    const { content } = req.body;

    const room = await roomModel.findOneAndUpdate(
      { roomId, 'user.userName': userName },
      { $set: { 'user.$.content': content } },
      { new: true }
    );

    if (room) {
      res.status(200).send('User content updated successfully');
    } else {
      res.status(404).send('Room or user not found');
    }
  } catch (error) {
    console.error('Error updating user content:', error);
    res.status(500).send('Server error');
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

});