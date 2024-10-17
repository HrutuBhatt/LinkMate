const express = require('express');
const mongoose = require('mongoose');
const { connectToDb } = require("./mongodb");
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io'); // Import socket.io

const userRoutes = require("./routes/user_routes.js");
const requestRoutes = require("./routes/friend_request_routes.js");
const friendRoutes = require("./routes/friends_routes.js");
const groupRoutes = require("./routes/group_router.js");
const messageRoutes = require("./routes/message_router.js");
const HttpError = require('./controllers/http-error');

const app = express();
const server = http.createServer(app);
// const path = require('path');
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

// Set up Socket.io with the server
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000', // Allow frontend to connect
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,  // if you're using cookies or authentication
  }
});

let activeUsers = new Map();

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // User joins (pass the userId when connecting)
  socket.on('join', ({ userId }) => {
    console.log(`${userId} has joined`);
    activeUsers.set(userId, socket.id);

    socket.broadcast.emit('userStatus', {userId, status:'online'});
  });

  // Handle sending a message
  socket.on('sendMessage', ({ senderId, receiverId, content, type }) => {
    const receiverSocketId = activeUsers.get(receiverId);
    
    // Send message to the specific receiver
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('receiveMessage', {
        senderId,
        content
      });
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    activeUsers.forEach((value, userId) => {
      if (value === socket.id) {
        activeUsers.delete(userId);

        socket.broadcast.emit('userStatus',{userId, status:'offline'});
      }
    });
  });

  socket.on('sendGroupMessage', (messageData) => {
    // Broadcast the message to all members in the group
    io.to(messageData.groupId).emit('receiveGroupMessage', messageData);
  });
  
});

app.use(express.json());

app.use(cors({
  origin: 'http://localhost:3000', // or '*' to allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,  // if you're using cookies or authentication
}));

app.use("/api/users/",userRoutes);
app.use("/api/requests/",requestRoutes);
app.use("/api/friends/",friendRoutes);
app.use("/api/groups/",groupRoutes);
app.use("/api/messages/",messageRoutes);

app.use((req,res,next)=>{
    const error = new HttpError("Could not find this route.",404);
    throw error;
});

app.use((error, req, res, next) => {
    if (res.headerSent) {
      return next(error);
    }
    res.status(error.code || 500);
    res.json({ message: error.message || "An unknown error occurred!" });
    console.log(error.message);
});


mongoose
  .connect("mongodb://127.0.0.1:27017/LinkMate")
  .then(() => {
    console.log('Connected to MongoDB');
    server.listen(5000, () => {
      console.log('Server is running on port 5000');
    });
  })
  .catch((err) => {
    console.log('Connection error found!', err);
  });
  
//previously using
// mongoose
//   .connect(
//     "mongodb://127.0.0.1:27017/LinkMate" 
//   )
//   .then(() => {
//     console.log('connected to mongodb');
//     app.listen(5000);
//   })
//   .catch((err) => {
//     console.log('Connection error found!',err);
//   });

  // server.listen(5000, () => {
  //   console.log('Server is running on port 5000');
  // });




//not needed
// connectToDb()
//   .then(() => {
//     // Start the server
//     app.listen(PORT, () => {
//       console.log(`Server running on http://localhost:${PORT}`);
//     });
//   })
//   .catch((err) => {
//     console.log(err);
//   });
