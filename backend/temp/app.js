const express = require('express');
const mongoose = require('mongoose');
const { connectToDb } = require("./mongodb");
const cors = require('cors');

const userRoutes = require("./routes/user_routes.js");
const requestRoutes = require("./routes/friend_request_routes.js");
const friendRoutes = require("./routes/friends_routes.js");
const groupRoutes = require("./routes/group_router.js");
const messageRoutes = require("./routes/message_router.js");
const HttpError = require('./controllers/http-error');

const app = express();
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
  .connect(
    "mongodb://127.0.0.1:27017/LinkMate" 
  )
  .then(() => {
    console.log('connected to mongodb');
    app.listen(5000);
  })
  .catch((err) => {
    console.log('Connection error found!',err);
  });

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
