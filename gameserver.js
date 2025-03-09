/*import express from "express";
import http from "http";
import {Server} from "socket.io";
import cors from "cors";

const app = express();
const server = http.createServer(app);

// Enable CORS
app.use(cors({ origin: "https://game-nine-drab.vercel.app", credentials: true }));

const io = new Server(server, {
  cors: {
    origin: "https://game-nine-drab.vercel.app", // Your frontend URL
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const PORT = 3000;

let players = {};


io.on("connection", (socket) => {
    console.log(`Player connected: ${socket.id}`);
  
    // Add the new player to the list of players
    players[socket.id] = {
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      animation: "Idle",
      weapon: "AK",
    };

    
  
    // Send the current players to the newly connected player
    setTimeout(() => {
      socket.emit("currentPlayers",{ id:socket.id ,currPlayers:players});
      console.log("currentPlayers event emitted:", players);
  }, 1000);
    
  
    // Notify all other players about the new player
    socket.broadcast.emit("newPlayer", { id: socket.id, state: players[socket.id] });
  
    // Update the player's state
    socket.on("updatePlayer", (state) => {
        //console.log(players);
      if (players[socket.id]) {
        players[socket.id] = { ...players[socket.id], ...state };
        // Broadcast the update to all other players
        socket.broadcast.emit("playerUpdated", { id: socket.id, state });
        
      }
    });
  
    // Remove the player when they disconnect
    socket.on("disconnect", () => {
      console.log(`Player disconnected: ${socket.id}`);
      delete players[socket.id];
      io.emit("playerDisconnected", socket.id);
    });
  });

 
  
  server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });*/

import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
const server = http.createServer(app);

app.use(cors({ origin: "https://game-nine-drab.vercel.app", credentials: true }));

const io = new Server(server, {
  cors: {
    origin: "https://game-nine-drab.vercel.app",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const PORT = 3000;
let players = {};
let bullets = [];

io.on("connection", (socket) => {
  console.log(`Player connected: ${socket.id}`);

  players[socket.id] = {name:"", position: { x: 0, y: 0, z: 0 }, rotation: { y: 0 }, animation: "Idle" ,health : 100};

  socket.emit("currentPlayers", { id: socket.id, currPlayers: players });

  socket.broadcast.emit("newPlayer", { id: socket.id, state: players[socket.id] });

  socket.on("updatePlayer", (state) => {
    //console.log(players);
  if (players[socket.id]) {
    players[socket.id] = { ...players[socket.id], ...state };
    // Broadcast the update to all other players
    socket.broadcast.emit("playerUpdated", { id: socket.id, state });
    
  }
});

socket.on("fireBullet", (bullet) => {
  const timestamp = Date.now();
  const bulletWithTimestamp = { ...bullet, timestamp };
  bullets.push(bulletWithTimestamp);
  io.emit("bulletFired", bulletWithTimestamp);
});


socket.on("updateBullet", ({ id, position, timestamp }) => {
  bullets = bullets.map((bullet) =>
    bullet.id === id ? { ...bullet, position, timestamp } : bullet
  );
  io.emit("updateBullets", bullets);
});


socket.on("removeBullet", (bulletId) => {
  console.log("object is hited with bullet");
  bullets = bullets.filter((bullet) => bullet.id !== bulletId);
  io.emit("updateBullets", bullets);
});

socket.on("playerHit", ({ hitPlayerId}) => {
  if (players[hitPlayerId]) {
    players[hitPlayerId].animation = "HitReact";
    players[hitPlayerId].health = players[hitPlayerId].health - 10;
    io.emit("playerUpdated", { id: hitPlayerId, state: players[hitPlayerId] });
    // Broadcast the hit animation trigger
  
    console.log("player is hitted with bullet");
  }
});

  socket.on("disconnect", () => {
    console.log(`Player disconnected: ${socket.id}`);
    delete players[socket.id];
    io.emit("playerDisconnected", socket.id);
    bullets = bullets.filter((bullet) => bullet.playerId !== socket.id);
    io.emit("updateBullets", bullets);
  });

  
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
