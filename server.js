const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const crypto = require("crypto");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);
app.use(express.static(path.join(__dirname, "public")));

const rooms = new Map();
app.get("/new-room", (req, res) => {
  const room = crypto.randomBytes(4).toString("hex").toUpperCase();
  res.redirect("/?room=" + room + "&role=viewer");
});

io.on("connection", socket => {
  socket.on("join-room", ({room, role}) => {
    if (!room || !["viewer", "camera"].includes(role)) return;
    room = String(room).toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0,12);
    socket.join(room);
    socket.data.room = room;
    socket.data.role = role;
    socket.to(room).emit("peer-ready", {role});
    socket.emit("joined", {room, role});
  });
  socket.on("signal", payload => {
    if (socket.data.room) socket.to(socket.data.room).emit("signal", payload);
  });
  socket.on("chat-message", message => {
    if (!socket.data.room || typeof message !== "string") return;
    const clean = message.trim().slice(0,1000);
    if (clean) io.to(socket.data.room).emit("chat-message", {
      text: clean, sender: socket.data.role, time: new Date().toISOString()
    });
  });
  socket.on("leave-room", () => {
    if (socket.data.room) socket.leave(socket.data.room);
    socket.data.room = null;
  });
});
const port = process.env.PORT || 3000;
server.listen(port, () => console.log("App running on port " + port));