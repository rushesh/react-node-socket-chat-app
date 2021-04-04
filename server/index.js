const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const cors = require("cors");
require("./db/mongoose");
const message = require("./models/message");

const { addUser, removeUser, getUser, getUsersInRoom } = require("./users");

var Filter = require("bad-words");
const router = require("./router");

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: '*',
    origins:'*:*',
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true,
  },
});
app.use(cors());
app.use(router);

io.on("connect", (socket) => {
  socket.on("join", async ({ name, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, name, room });

    if (error) return callback(error);

    socket.join(user.room);
    
    
    socket.emit("message", {
      user: "admin",
      text: `${user.name}, welcome to room ${user.room}.`,
      type: "text",
    });
    socket.broadcast.to(user.room).emit("message", {
      user: "admin",
      text: `${user.name} has joined!`,
      type: "text",
    });

    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });
    var createMessageDB = {
      message: "User joined",
      name: "admin",
      eventtype: "join",
      roomname: user.room,
      otherdetails: "welcome new user " + user.name,
    };
    try {
      await message.insertMany(createMessageDB);
    } catch (error) {}
    var createMessageDB = {
      message: "User joined",
      name: "admin",
      eventtype: "join",
      roomname: user.room,
      otherdetails: "Notified all users in chatroom " + user.name,
    };
    try {
      await message.insertMany(createMessageDB);
    } catch (error) {}
    var createMessageDB = {
      message: "User joined",
      name: "admin",
      eventtype: "roomData",
      roomname: user.room,
      otherdetails: getUsersInRoom(user.room),
    };
    try {
      await message.insertMany(createMessageDB);
    } catch (error) {}
    
    callback();
  });

  socket.on("sendMessage", async (message, callback) => {
    filter = new Filter();
    const user = getUser(socket.id);
    if (user.room) {
      
      io.to(user.room).emit("message", {
        user: user.name,
        text: filter.clean(message),
        type: "text",
      });
      var createMessageDB = {
        message: filter.clean(message),
        name: user.name,
        eventtype: "message",
        roomname: user.room,
        otherdetails: "User sent message",
      };
      try {
        await message.insertMany(createMessageDB);
      } catch (error) {}
      callback();
    } else {
      callback("No such user room present");
    }
  });

  socket.on("sendLocation", async (location, callback) => {
    const user = getUser(socket.id);
    if (user) {
      
      io.to(user.room).emit("message", {
        user: user.name,
        text: location,
        type: "location",
      });
      var createMessageDB = {
        message: location,
        name: user.name,
        eventtype: "message",
        roomname: user.room,
        otherdetails: "User sent location",
      };
      try {
        await message.insertMany(createMessageDB);
      } catch (error) {}
      callback();
    } else {
      callback("No such user room present");
    }
  });

  socket.on("disconnect", async () => {
    const user = removeUser(socket.id);

    if (user) {
      
      io.to(user.room).emit("message", {
        user: "admin",
        text: `${user.name} has left.`,
        type: "text",
      });
      
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
      var createMessageDB = {
        message: "User left",
        name: "admin",
        eventtype: "message",
        roomname: user.room,
        otherdetails: "User left " + user.name,
      };
      try {
        await message.insertMany(createMessageDB);
      } catch (error) {}
      
    }
  });
});

server.listen(process.env.PORT || 5000, () =>
  console.log(`Server has started.`)
);
