require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: [
      'http://localhost:5173',
      'https://snt-club.vercel.app',
      'https://science-tech-club-mecs.onrender.com',
      process.env.FRONTEND_URL,
    ].filter(Boolean),
    methods: ['GET', 'POST'],
    credentials: true
  }
});

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://snt-club.vercel.app',
    'https://science-tech-club-mecs.onrender.com',
    process.env.FRONTEND_URL,
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

console.log('Environment Check:');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL || 'MISSING');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'MISSING');

app.get('/', (req, res) => {
  res.json({
    ok: true,
    message: 'Science & Tech Club API v2.0',
    timestamp: new Date().toISOString(),
    socketConnections: io.engine.clientsCount
  });
});

app.get('/api/test/db', async (req, res) => {
  try {
    const supabase = require('./config/supabase');
    const { data, error } = await supabase
      .from('users')
      .select('username, email, role')
      .limit(10);
    
    if (error) throw error;
    
    res.json({
      success: true,
      message: 'Database connected',
      usersCount: data?.length || 0,
      users: data || []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: error.message
    });
  }
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/config', require('./routes/config'));
app.use('/api/chatbot', require('./routes/chatbot'));

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
      
      const { data: newMessage, error } = await supabase
        .from('messages')
        .insert([{ room, message, user_id: userId, username }])
        .select()
        .single();
      
      if (error) throw error;
      io.to(room).emit('new-message', newMessage);
    } catch (error) {
      console.error('Message error:', error);
      socket.emit('message-error', { message: 'Failed to send message' });
    }
  });

  socket.on('leave-room', (room) => {
    socket.leave(room);
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
  });
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Socket.IO initialized');
});

module.exports = { app, io };
