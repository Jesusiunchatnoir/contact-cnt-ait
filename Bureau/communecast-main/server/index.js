const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);

// Configure CORS for both Express and Socket.IO
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.DOMAIN || false 
    : "http://localhost:3000",
  credentials: true
};

app.use(cors(corsOptions));

const io = socketIo(server, {
  cors: corsOptions,
  transports: ['websocket', 'polling']
});

// Store active rooms and users
const rooms = new Map();
const users = new Map();

// Middleware for Socket.IO
io.use((socket, next) => {
  console.log(`New connection attempt: ${socket.id}`);
  next();
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('join-room', ({ roomId, pseudo }) => {
    console.log(`User ${socket.id} (${pseudo}) joining room ${roomId}`);
    
    // Leave any previous rooms
    Array.from(socket.rooms).forEach(room => {
      if (room !== socket.id) {
        socket.leave(room);
      }
    });

    // Join the new room
    socket.join(roomId);
    
    // Store user info
    users.set(socket.id, { pseudo, roomId });
    
    // Initialize room if it doesn't exist
    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Set());
    }
    
    const room = rooms.get(roomId);
    
    // Notify existing users in the room
    socket.to(roomId).emit('user-joined', {
      id: socket.id,
      pseudo
    });
    
    // Add user to room
    room.add(socket.id);
    
    console.log(`Room ${roomId} now has ${room.size} users`);
  });

  // WebRTC signaling
  socket.on('offer', ({ offer, to }) => {
    console.log(`Relaying offer from ${socket.id} to ${to}`);
    const user = users.get(socket.id);
    socket.to(to).emit('offer', {
      offer,
      from: socket.id,
      pseudo: user?.pseudo || 'Anonymous'
    });
  });

  socket.on('answer', ({ answer, to }) => {
    console.log(`Relaying answer from ${socket.id} to ${to}`);
    socket.to(to).emit('answer', {
      answer,
      from: socket.id
    });
  });

  socket.on('ice-candidate', ({ candidate, to }) => {
    console.log(`Relaying ICE candidate from ${socket.id} to ${to}`);
    socket.to(to).emit('ice-candidate', {
      candidate,
      from: socket.id
    });
  });

  // Chat messages (encrypted)
  socket.on('chat-message', ({ pseudo, message, timestamp, encrypted, roomId }) => {
    console.log(`Chat message in room ${roomId} from ${pseudo}`);
    // Relay encrypted message to all users in the room except sender
    socket.to(roomId).emit('chat-message', {
      pseudo,
      message, // This is already encrypted by the client
      timestamp,
      encrypted
    });
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    
    const user = users.get(socket.id);
    if (user) {
      const { roomId } = user;
      
      // Remove user from room
      if (rooms.has(roomId)) {
        const room = rooms.get(roomId);
        room.delete(socket.id);
        
        // Clean up empty rooms
        if (room.size === 0) {
          rooms.delete(roomId);
          console.log(`Room ${roomId} deleted (empty)`);
        } else {
          // Notify other users in the room
          socket.to(roomId).emit('user-left', socket.id);
          console.log(`Room ${roomId} now has ${room.size} users`);
        }
      }
      
      users.delete(socket.id);
    }
  });

  // Handle errors
  socket.on('error', (error) => {
    console.error(`Socket error for ${socket.id}:`, error);
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    rooms: rooms.size, 
    users: users.size,
    timestamp: new Date().toISOString()
  });
});

// API endpoint to get room info (for debugging)
app.get('/api/rooms', (req, res) => {
  const roomsInfo = Array.from(rooms.entries()).map(([roomId, users]) => ({
    roomId,
    userCount: users.size
  }));
  res.json(roomsInfo);
});

const PORT = process.env.PORT || 3001;
const DOMAIN = process.env.DOMAIN || 'localhost';

server.listen(PORT, () => {
  console.log(`🚀 CommuneCast Server running on ${DOMAIN}:${PORT}`);
  console.log(`🔒 CORS enabled for: ${corsOptions.origin}`);
  console.log(`🏴 Libre, égalité, fraternité!`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});