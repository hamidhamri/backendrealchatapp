import mongoose from "mongoose";
import app from "./app.js";
import dotenv from "dotenv";
import { Server } from "socket.io";

dotenv.config({ path: "./.env" });

let uri = "mongodb+srv://hamidhamri:ikPoGwqYuiqLDlv8@backendrealchatapp.7o2kkfk.mongodb.net/?appName=backendrealchatapp"

mongoose
  .connect(process.env.MONGOOSE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log(`DATABASE CONNECTED ON PORT ${process.env.PORT}`);
  })
  .catch((err) => {
    console.log(err);
  });

const port = 8000;

const server = app.listen(process.env.PORT || port, () => {
  console.log(`SERVER RUNNING ON PORT ${process.env.PORT}`);
});

const io = new Server(server, {
  cors: {
    origin: [
      process.env.URL_SOCKET_CLIENT,
      "https://192.168.1.254:3000",
    ],
    credentials: true,
  },
});

let activeUsers = [];

io.on("connection", (socket) => {
  socket.on("addUser", (userId) => {
    // console.log(activeUsers, "ALL USERS");
    if (!activeUsers.some((user) => user.userId === userId)) {
      activeUsers.push({ userId, socketId: socket.id });
    }
    socket.emit("activeUsers", activeUsers);
  }),
    //// SEND MESSAGE
    socket.on("sendMessage", (data) => {
      const user = activeUsers.find((user) => user.userId === data.receiverId);
      if (user) {
        // console.log(data, "DATA");
        // console.log(user, "USER");
        socket.to(user.socketId).emit("newMessage", data);
        socket.to(user.socketId).emit("notificationMessage", {
          senderId: data.senderId,
          receiverId: data.receiverId,
          text: data.text,
          name: data.name,
          createdAt: new Date(Date.now()),
        });
      }
    }),
    //SOMEONE FOLLOWED YOU
    socket.on("follow", (data) => {
      const user = activeUsers.find((user) => user.userId === data.following);
      // console.log(user, "USER", data, "DATA");
      if (user) {
        socket.to(user.socketId).emit("followReceive", data);
      }
    }),
    //SOMEONE LIKE YOUR POST
    socket.on("like", (data) => {
      const user = activeUsers.find((user) => user.userId === data.receiverId);
      // console.log(user, "USER", data, "DATA");
      if (user) {
        socket.to(user.socketId).emit("likeReceive", data);
      }
    }),
    // SOMEONE COMMENT YOUR POST
    socket.on("comment", (data) => {
      const user = activeUsers.find((user) => user.userId === data.receiverId);
      // console.log(user, "USER", data, "DATA");
      if (user) {
        socket.to(user.socketId).emit("commentReceive", data);
      }
    }),
    // IS TYPING
    socket.on("isTyping", (data) => {
      const user = activeUsers.find((user) => user.userId === data.receiverId);
      if (user) {
        socket.to(user.socketId).emit("heIsTyping", data);
      }
    }),
    // IS NOT TYPING
    socket.on("isNotTyping", (data) => {
      const user = activeUsers.find((user) => user.userId === data.receiverId);
      if (user) {
        socket.to(user.socketId).emit("heIsNotTyping", data);
      }
    }),
    //// DISCONNECT
    socket.on("disconnect", () => {
      activeUsers = activeUsers.filter((user) => user.socketId !== socket.id);
      console.log(`user disConnected`);
      socket.emit("activeUsers", activeUsers);
    });
});
