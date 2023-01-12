const express = require("express");
const app = [];

for (let i = 4006; i <= 4006; i++) {
  app[i] = express()

  const http = require("http");

  // var options = {
  //   key: fs.readFileSync('/etc/letsencrypt/live/tablebrains.chaosology.com/privkey.pem'),
  //   cert: fs.readFileSync('/etc/letsencrypt/live/tablebrains.chaosology.com/fullchain.pem')
  // };

  const server = http.createServer(app[i]);
  // const server = https.createServer(options, app);


  const io = require("socket.io")(server);

  app[i].use(express.static(__dirname + "/public"));
  // const port1 = [];
  // const users = [];
  
  io.sockets.on("error", e => console.log(e));
  io.sockets.on("connection", socket => {
    console.log(i);
   
    socket.on("broadcaster", () => {
      broadcaster = socket.id;
      socket.broadcast.emit("broadcaster");
    });
    socket.on("watcher", () => {
      socket.to(broadcaster).emit("watcher", socket.id);
    
    });
    socket.on("offer", (id, message) => {
      socket.to(id).emit("offer", socket.id, message);
    });
    socket.on("answer", (id, message) => {
      socket.to(id).emit("answer", socket.id, message);
    });
    socket.on("candidate", (id, message) => {
      socket.to(id).emit("candidate", socket.id, message);
    });
    socket.on("disconnect", () => {
      socket.to(broadcaster).emit("disconnectPeer", socket.id);
    });
    
    
  });

  // server.listen(i, () => console.log(`Server is running on port` i));
  server.listen(i, () => console.log('port', i, "started"))
}