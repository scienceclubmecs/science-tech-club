import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";

// Routes
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";
import configRoutes from "./routes/config.js";
import chatbotRoutes from "./routes/chatbot.js";
import coursesRoutes from "./routes/courses.js";
import chatRoutes from "./routes/chat.js";

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Socket.IO with CORS
const io = new Server(httpServer, {
  cors: {
    origin: [
      'http://localhost:5173',
      'https://science-tech-club-frontend.vercel.app',
      'https://science-tech-club-client.onrender.com',
      process.env.FRONTEND_URL,
    ].filter(Boolean),
    methods: ["GET", "POST"],
    credentials: true
  }
});

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://science-tech-club-frontend.vercel.app',
    'https://science-tech-club-client.onrender.com',
    process.env.FRONTEND_URL,
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(morgan("dev"));

// Health check
app.get("/", (req, res) => {
  res.json({ 
    ok: true, 
    message: "Science & Tech Club API v2.0",
    timestamp: new Date().toISOString(),
    socketConnections: io.engine.clientsCount
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/config", configRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/courses", coursesRoutes);
app.use("/api/chat", chatRoutes);

// Socket.IO real-time chat
const connectedUsers = new Map();

io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

  // Join room
  socket.on("join-room", (room) => {
    socket.join(room);
    connectedUsers.set(socket.id, { room, joinedAt: new Date() });
    console.log(`User ${socket.id} joined room: ${room}`);
    
    // Notify others in room
    socket.to(room).emit("user-joined", { 
      userId: socket.id, 
      room,
      timestamp: new Date().toISOString()
    });
  });

  // Leave room
  socket.on("leave-room", (room) => {
    socket.leave(room);
    console.log(`User ${socket.id} left room: ${room}`);
    
    socket.to(room).emit("user-left", { 
      userId: socket.id, 
      room,
      timestamp: new Date().toISOString()
    });
  });

  // Send message
  socket.on("send-message", (data) => {
    const message = {
      ...data,
      socketId: socket.id,
      timestamp: new Date().toISOString()
    };
    
    // Broadcast to room (including sender)
    io.to(data.room).emit("receive-message", message);
    console.log(`Message in ${data.room}:`, data.message.substring(0, 50));
  });

  // Typing indicator
  socket.on("typing", (data) => {
    socket.to(data.room).emit("user-typing", {
      userId: socket.id,
      username: data.username,
      room: data.room
    });
  });

  socket.on("stop-typing", (data) => {
    socket.to(data.room).emit("user-stop-typing", {
      userId: socket.id,
      room: data.room
    });
  });

  // Disconnect
  socket.on("disconnect", () => {
    const userData = connectedUsers.get(socket.id);
    if (userData) {
      socket.to(userData.room).emit("user-left", { 
        userId: socket.id,
        room: userData.room,
        timestamp: new Date().toISOString()
      });
      connectedUsers.delete(socket.id);
    }
    console.log("❌ User disconnected:", socket.id);
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ message: "Internal server error" });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🔌 Socket.IO ready for connections`);
  console.log(`📡 API base: /api`);
});
