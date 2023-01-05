const dotenv = require("dotenv");
//import bitch
dotenv.config({ path: "./.env" });
const io = require("socket.io")(8900, {
  cors: {
    origin: process.env.URL,
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
