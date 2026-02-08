const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// CORS Configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:4173',
  'https://science-tech-club-iju0.onrender.com',
  'https://science-tech-club-mecs.onrender.com'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, Postman, curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('⚠️ Blocked by CORS:', origin);
      callback(null, true); // Allow in development, log only
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`${timestamp} - ${req.method} ${req.path}`);
  next();
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Science & Tech Club API',
    version: '2.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
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
      public: '/api/public',
      chatbot: '/api/chatbot',
      messages: '/api/messages',
      tasks: '/api/tasks'
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
      config: {
        supabase: !!(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY),
        jwt: !!process.env.JWT_SECRET,
        groq: !!process.env.GROQ_API_KEY
      }
    });
  } catch (err) {
    res.status(500).json({ 
      status: 'error', 
      database: 'disconnected', 
      message: err.message 
    });
  }
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API is working perfectly!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    configuration: {
      supabaseUrl: process.env.SUPABASE_URL ? '✓ Configured' : '✗ Missing',
      supabaseKey: process.env.SUPABASE_ANON_KEY ? '✓ Configured' : '✗ Missing',
      jwtSecret: process.env.JWT_SECRET ? '✓ Configured' : '✗ Missing',
      groqApiKey: process.env.GROQ_API_KEY ? '✓ Configured' : '✗ Missing'
    }
  });
});

// Import and mount API routes
const routeFiles = [
  { path: '/api/auth', file: './routes/auth', name: 'Authentication' },
  { path: '/api/users', file: './routes/users', name: 'Users' },
  { path: '/api/courses', file: './routes/courses', name: 'Courses' },
  { path: '/api/projects', file: './routes/projects', name: 'Projects' },
  { path: '/api/quizzes', file: './routes/quizzes', name: 'Quizzes' },
  { path: '/api/events', file: './routes/events', name: 'Events' },
  { path: '/api/config', file: './routes/config', name: 'Config' },
  { path: '/api/admin', file: './routes/admin', name: 'Admin' },
  { path: '/api/announcements', file: './routes/announcements', name: 'Announcements' },
  { path: '/api/public', file: './routes/public', name: 'Public' },
  { path: '/api/chatbot', file: './routes/chatbot', name: 'Chatbot' },
  { path: '/api/messages', file: './routes/messages', name: 'Messages' },
  { path: '/api/tasks', file: './routes/tasks', name: 'Tasks' }
];

const loadedRoutes = [];
const failedRoutes = [];

routeFiles.forEach(({ path, file, name }) => {
  try {
    const route = require(file);
    app.use(path, route);
    loadedRoutes.push(name);
  } catch (error) {
    console.error(`❌ Failed to load ${name} routes:`, error.message);
    failedRoutes.push({ name, error: error.message });
  }
});

console.log('\n📦 Routes Loading Status:');
console.log(`  ✅ Loaded: ${loadedRoutes.length}/${routeFiles.length}`);
if (loadedRoutes.length > 0) {
  console.log(`  Routes: ${loadedRoutes.join(', ')}`);
}
if (failedRoutes.length > 0) {
  console.log(`  ❌ Failed: ${failedRoutes.map(r => r.name).join(', ')}`);
}

// 404 handler - MUST BE AFTER ALL ROUTES
app.use((req, res) => {
  console.log('⚠️ 404 - Not Found:', req.method, req.path);
  res.status(404).json({ 
    success: false,
    message: 'Endpoint not found',
    path: req.path,
    method: req.method,
    hint: 'Check available endpoints at GET /',
    documentation: 'Visit / for API documentation'
  });
});

// Global Error handler - MUST BE LAST
app.use((err, req, res, next) => {
  console.error('💥 Error:', err.message);
  
  // Log full stack trace in development
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log('\n╔═══════════════════════════════════════════════════╗');
  console.log('║   🚀 Science & Tech Club API Server             ║');
  console.log('╚═══════════════════════════════════════════════════╝\n');
  
  console.log('📡 Server Information:');
  console.log(`   Port: ${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   URL: http://localhost:${PORT}\n`);
  
  console.log('⚙️  Configuration Status:');
  console.log(`   ${process.env.SUPABASE_URL ? '✓' : '✗'} Supabase URL`);
  console.log(`   ${process.env.SUPABASE_ANON_KEY ? '✓' : '✗'} Supabase Key`);
  console.log(`   ${process.env.JWT_SECRET ? '✓' : '✗'} JWT Secret`);
  console.log(`   ${process.env.GROQ_API_KEY ? '✓' : '✗'} Groq API Key\n`);
  
  console.log('📍 Key Endpoints:');
  console.log('   GET    /                     → API Info');
  console.log('   GET    /api/health           → Health Check');
  console.log('   GET    /api/test             → Test Config');
  console.log('   POST   /api/auth/login       → Login');
  console.log('   POST   /api/auth/register    → Register');
  console.log('   GET    /api/users/profile    → User Profile');
  console.log('   PUT    /api/users/profile    → Update Profile');
  console.log('   GET    /api/projects         → Projects List');
  console.log('   GET    /api/courses          → Courses List');
  console.log('   GET    /api/announcements    → Announcements');
  console.log('   POST   /api/chatbot          → AI Chatbot');
  console.log('   GET    /api/messages         → Messages');
  console.log('   GET    /api/tasks            → Tasks\n');
  
  console.log('✅ Server is ready and listening!\n');
  console.log('═══════════════════════════════════════════════════\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n⚠️  SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n⚠️  SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

module.exports = app;
