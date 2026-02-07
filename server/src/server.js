mport express from "express";
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
require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const httpServer = http.createServer(app);

// Socket.IO setup
const io = new Server(httpServer, {
  cors: {
    origin: [
      'http://localhost:5173',
      'https://snt-club.vercel.app',
      'https://science-tech-club-frontend.onrender.com',
      process.env.FRONTEND_URL,
    ].filter(Boolean),
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://snt-club.vercel.app',
    'https://science-tech-club-frontend.onrender.com',
    process.env.FRONTEND_URL,
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Log environment variables on startup
console.log('\n=== Environment Check ===');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL || 'MISSING');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? `Set (${process.env.SUPABASE_SERVICE_ROLE_KEY.length} chars)` : 'MISSING');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'MISSING');
console.log('PORT:', process.env.PORT || 5000);
console.log('=========================\n');

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    ok: true,
    message: 'Science & Tech Club API v2.0',
    timestamp: new Date().toISOString(),
    socketConnections: io.engine.clientsCount
  });
});

// Test database connection endpoint
app.get('/api/test/db', async (req, res) => {
  try {
    console.log('\n=== Database Test ===');
    const supabase = require('./config/supabase');
    
    console.log('Querying users table...');
    const { data, error } = await supabase
      .from('users')
      .select('username, email, role')
      .limit(10);
    
    if (error) {
      console.error('Database error:', error);
      throw error;
    }
    
    console.log('Query successful. Users found:', data?.length);
    console.log('=====================\n');
    
    res.json({
      success: true,
      message: 'Database connected successfully',
      usersCount: data?.length || 0,
      users: data || [],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database connection failed:', error.message);
    console.log('=====================\n');
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// API Routes
try {
  app.use('/api/auth', require('./routes/auth'));
  console.log('✓ Auth routes loaded');
} catch (err) {
  console.error('✗ Failed to load auth routes:', err.message);
}

try {
  app.use('/api/courses', require('./routes/courses'));
  console.log('✓ Courses routes loaded');
} catch (err) {
  console.error('✗ Failed to load courses routes:', err.message);
}

try {
  app.use('/api/chat', require('./routes/chat'));
  console.log('✓ Chat routes loaded');
} catch (err) {
  console.error('✗ Failed to load chat routes:', err.message);
}

try {
  app.use('/api/admin', require('./routes/admin'));
  console.log('✓ Admin routes loaded');
} catch (err) {
  console.error('✗ Failed to load admin routes:', err.message);
}

try {
  app.use('/api/config', require('./routes/config'));
  console.log('✓ Config routes loaded');
} catch (err) {
  console.error('✗ Failed to load config routes:', err.message);
}

try {
  app.use('/api/chatbot', require('./routes/chatbot'));
  console.log('✓ Chatbot routes loaded');
} catch (err) {
  console.error('✗ Failed to load chatbot routes:', err.message);
}

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  socket.on('join-room', (room) => {
    socket.join(room);
    console.log(`Socket ${socket.id} joined room: ${room}`);
  });

  socket.on('send-message', async (data) => {
    try {
      const { room, message, userId, username } = data;
      const supabase = require('./config/supabase');
      
      // Save message to database
      const { data: newMessage, error } = await supabase
        .from('messages')
        .insert([{ room, message, user_id: userId, username }])
        .select()
        .single();
      
      if (error) throw error;
      
      // Broadcast to room
      io.to(room).emit('new-message', newMessage);
    } catch (error) {
      console.error('Message send error:', error);
      socket.emit('message-error', { message: 'Failed to send message' });
    }
  });

  socket.on('leave-room', (room) => {
    socket.leave(room);
    console.log(`Socket ${socket.id} left room: ${room}`);
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
  });
});

// 404 handler
app.use((req, res) => {
  console.log('404 - Route not found:', req.path);
  res.status(404).json({ 
    message: 'Route not found',
    path: req.path,
    method: req.method
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('\n=== Server Error ===');
  console.error('Path:', req.path);
  console.error('Method:', req.method);
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);
  console.log('====================\n');
  
  res.status(500).json({ 
    message: 'Internal server error', 
    error: err.message 
  });
});

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log('\n=================================');
  console.log(`Server running on port ${PORT}`);
  console.log('Socket.IO initialized');
  console.log('=================================\n');
});

module.exports = { app, io };
