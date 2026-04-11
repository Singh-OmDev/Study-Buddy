import 'dotenv/config';
import app from './src/app.js';
import connectDB from './src/config/db.js';
import http from 'http';
import { Server } from 'socket.io';

const PORT = process.env.PORT || 5000;
console.log("Server key (masked):", process.env.CLERK_SECRET_KEY ? process.env.CLERK_SECRET_KEY.slice(0, 10) + "..." : "MISSING");
console.log("Publishable key (masked):", process.env.CLERK_PUBLISHABLE_KEY ? process.env.CLERK_PUBLISHABLE_KEY.slice(0, 10) + "..." : "MISSING");

// Connect to Database
connectDB();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*', // Adjust for production
    methods: ['GET', 'POST']
  }
});

// App Locals for cross-file Socket emissions and Presence
app.locals.io = io;
app.locals.onlineUsers = new Map(); // Maps clerkId -> socket.id

// Hub State
app.locals.hubUsers = new Map(); // socket.id -> { name, imageUrl, goal }
let globalHubMode = 'focus';
let globalHubTimeLeft = 25 * 60;

// Hub Global Timer Tick
setInterval(() => {
    globalHubTimeLeft--;
    if (globalHubTimeLeft <= 0) {
        if (globalHubMode === 'focus') {
            globalHubMode = 'break';
            globalHubTimeLeft = 5 * 60;
        } else {
            globalHubMode = 'focus';
            globalHubTimeLeft = 25 * 60;
        }
    }
    io.to('global-hub').emit('hub-timer-sync', { mode: globalHubMode, timeLeft: globalHubTimeLeft });
}, 1000);

io.on('connection', (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on('register-user', (clerkId) => {
    app.locals.onlineUsers.set(clerkId, socket.id);
    console.log(`Registered user: ${clerkId} to socket: ${socket.id}`);
  });

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`User with ID: ${socket.id} joined room: ${roomId}`);
  });

  socket.on('join-hub', (userData) => {
    socket.join('global-hub');
    app.locals.hubUsers.set(socket.id, userData);
    io.to('global-hub').emit('hub-users-update', Array.from(app.locals.hubUsers.values()));
    socket.emit('hub-timer-sync', { mode: globalHubMode, timeLeft: globalHubTimeLeft });
  });

  socket.on('leave-hub', () => {
    socket.leave('global-hub');
    app.locals.hubUsers.delete(socket.id);
    io.to('global-hub').emit('hub-users-update', Array.from(app.locals.hubUsers.values()));
  });

  socket.on('send-hub-emote', (data) => {
    // data: { sourceName: "Om", targetId: "random-id", emote: "🔥" }
    // Broadcast to everyone in the hub so they all see the emote float up!
    io.to('global-hub').emit('receive-hub-emote', data);
  });

  socket.on('send-message', (data) => {
    // data should look like { room: 'roomId', author: 'user', message: 'hello' }
    socket.to(data.room).emit('receive-message', data);
  });

  socket.on('draw-stroke', (data) => {
    // data: { room: 'roomId', paths: [...] }
    socket.to(data.room).emit('receive-stroke', data.paths);
  });

  socket.on('clear-canvas', (roomId) => {
    socket.to(roomId).emit('canvas-cleared');
  });

  socket.on('share-peer-id', (data) => {
    // data: { room: 'roomId', peerId: '1234abcd' }
    socket.to(data.room).emit('receive-peer-id', data.peerId);
  });

  socket.on('mentor-accepts', (data) => {
    // Tell the Active User waiting in roomId that someone accepted
    socket.to(data.roomId).emit('mentor-found', data);
  });

  socket.on('hang-up', (data) => {
    socket.to(data.room).emit('receive-hang-up');
  });

  socket.on('call-rejected', (data) => {
    socket.to(data.room).emit('call-rejected');
  });

  socket.on('disconnect', () => {
    console.log('User Disconnected', socket.id);
    // Remove from onlineUsers map
    for (let [clerkId, sockId] of app.locals.onlineUsers.entries()) {
        if (sockId === socket.id) {
            app.locals.onlineUsers.delete(clerkId);
            console.log(`De-registered user: ${clerkId}`);
            break;
        }
    }
    
    // Remove from Hub if present
    if (app.locals.hubUsers.has(socket.id)) {
        app.locals.hubUsers.delete(socket.id);
        io.to('global-hub').emit('hub-users-update', Array.from(app.locals.hubUsers.values()));
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
