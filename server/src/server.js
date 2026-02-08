const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const messagesRoutes = require('./routes/messages');
const tasksRoutes = require('./routes/tasks');
// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://science-tech-club-iju0.onrender.com',
    'https://science-tech-club-mecs.onrender.com'
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

app.use('/api/messages', messagesRoutes);
app.use('/api/tasks', tasksRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Science & Tech Club API',
    version: '2.0.0',
    status: 'running',
    endpoints: {
      health: '/api/health',
      test: '/api/test',
      auth: '/api/auth',
      users: '/api/users',
      courses: '/api/courses',
      projects: '/api/projects',
      quizzes: '/api/quizzes',
      events: '/api/events',
      config: '/api/config',
      admin: '/api/admin',
      announcements: '/api/announcements',
      public: '/api/public'
    }
  });
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const supabase = require('./config/supabase');
    const { data, error } = await supabase.from('users').select('count').limit(1);
    const dbStatus = error ? 'error' : 'connected';
    
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      database: dbStatus,
      supabaseConfigured: !!(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY)
    });
  } catch (err) {
    res.json({ 
      status: 'error', 
      database: 'error', 
      message: err.message 
    });
  }
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API is working!',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
    supabaseUrl: process.env.SUPABASE_URL ? '✓ Configured' : '✗ Missing',
    supabaseKey: process.env.SUPABASE_ANON_KEY ? '✓ Configured' : '✗ Missing',
    jwtSecret: process.env.JWT_SECRET ? '✓ Configured' : '✗ Missing'
  });
});

// Import and mount API routes
try {
  const authRoutes = require('./routes/auth');
  const usersRoutes = require('./routes/users');
  const coursesRoutes = require('./routes/courses');
  const projectsRoutes = require('./routes/projects');
  const quizzesRoutes = require('./routes/quizzes');
  const eventsRoutes = require('./routes/events');
  const configRoutes = require('./routes/config');
  const adminRoutes = require('./routes/admin');
  const announcementsRoutes = require('./routes/announcements');
  const publicRoutes = require('./routes/public');
  const chatbotRoutes = require('./routes/chatbot');

  app.use('/api/auth', authRoutes);
  app.use('/api/users', usersRoutes);
  app.use('/api/courses', coursesRoutes);
  app.use('/api/projects', projectsRoutes);
  app.use('/api/quizzes', quizzesRoutes);
  app.use('/api/events', eventsRoutes);
  app.use('/api/config', configRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/announcements', announcementsRoutes);
  app.use('/api/public', publicRoutes);
  app.use('/api/chatbot', chatbotRoutes);

  console.log('✅ All routes loaded successfully');
} catch (error) {
  console.error('❌ Error loading routes:', error.message);
  console.error('Make sure all route files exist in server/src/routes/');
}

// 404 handler - MUST BE AFTER ALL ROUTES
app.use((req, res) => {
  console.log('404 - Not Found:', req.method, req.path);
  res.status(404).json({ 
    message: 'Endpoint not found',
    path: req.path,
    method: req.method,
    availableEndpoints: [
      'GET /',
      'GET /api/health',
      'GET /api/test',
      'POST /api/auth/login',
      'POST /api/auth/register',
      'GET /api/auth/verify',
      'GET /api/users',
      'GET /api/users/profile',
      'PUT /api/users/profile',
      'GET /api/courses',
      'GET /api/projects',
      'GET /api/events',
      'GET /api/quizzes',
      'GET /api/config',
      'GET /api/admin/dashboard',
      'GET /api/announcements',
      'GET /api/public/committee'
    ]
  });
});

// Error handler - MUST BE LAST
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.stack : {}
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('\n🚀 Science & Tech Club API Server');
  console.log('═'.repeat(50));
  console.log('📡 Port:', PORT);
  console.log('🌍 Environment:', process.env.NODE_ENV || 'development');
  console.log('');
  console.log('Configuration Status:');
  console.log('  🔧 Supabase URL:', process.env.SUPABASE_URL ? '✓ Configured' : '✗ Missing');
  console.log('  🔑 Supabase Key:', process.env.SUPABASE_ANON_KEY ? '✓ Configured' : '✗ Missing');
  console.log('  🔐 JWT Secret:', process.env.JWT_SECRET ? '✓ Configured' : '✗ Missing');
  console.log('');
  console.log('📍 Available Endpoints:');
  console.log('  GET  / → API info');
  console.log('  GET  /api/health → Health check');
  console.log('  GET  /api/test → Test endpoint');
  console.log('  POST /api/auth/login → User login');
  console.log('  POST /api/auth/register → User registration');
  console.log('  GET  /api/auth/verify → Verify token');
  console.log('  GET  /api/users → Get all users (admin)');
  console.log('  GET  /api/users/profile → Get current user profile');
  console.log('  PUT  /api/users/profile → Update profile');
  console.log('  GET  /api/courses → Get courses');
  console.log('  GET  /api/projects → Get projects');
  console.log('  GET  /api/events → Get events');
  console.log('  GET  /api/quizzes → Get quizzes');
  console.log('  GET  /api/config → Get site config');
  console.log('  GET  /api/admin/dashboard → Admin dashboard');
  console.log('  GET  /api/announcements → Get announcements');
  console.log('  GET  /api/public/committee → Get committee members');
  console.log('');
  console.log('✅ Server is ready and listening!');
  console.log('═'.repeat(50));
  console.log('');
});

module.exports = app;
