const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint with Supabase test
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

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/quizzes', require('./routes/quizzes'));
app.use('/api/events', require('./routes/events'));
app.use('/api/public', require('./routes/public'));
app.use('/api/config', require('./routes/config'));

// Serve static files from React build - ABSOLUTE PATH FOR RENDER
const clientBuildPath = '/opt/render/project/src/client/dist';
const indexHtmlPath = '/opt/render/project/src/client/dist/index.html';

console.log('=== FRONTEND PATH DEBUG ===');
console.log('🔍 Looking for frontend at:', clientBuildPath);
console.log('📄 index.html exists:', fs.existsSync(indexHtmlPath) ? '✓ FOUND' : '✗ MISSING');
console.log('📁 dist folder exists:', fs.existsSync(clientBuildPath) ? '✓ YES' : '✗ NO');

if (fs.existsSync(clientBuildPath)) {
  console.log('📁 dist contents:', fs.readdirSync(clientBuildPath).join(', '));
}
console.log('===========================');

if (fs.existsSync(indexHtmlPath)) {
  console.log('✅ Serving static files from:', clientBuildPath);
  
  // Serve static assets
  app.use(express.static(clientBuildPath));
  
  // Catch-all route - serve React app for any non-API route
  app.get('*', (req, res) => {
    res.sendFile(indexHtmlPath);
  });
} else {
  console.log('⚠️  Frontend build not found - Running in API-only mode');
  
  app.get('/', (req, res) => {
    res.json({ 
      message: 'Science & Tech Club API Server',
      status: 'running',
      environment: process.env.NODE_ENV || 'development',
      note: 'Frontend not deployed. Running in API-only mode.',
      expectedPath: clientBuildPath,
      buildCommand: 'cd client && npm run build',
      debug: {
        clientBuildPath,
        indexHtmlExists: fs.existsSync(indexHtmlPath),
        clientDirExists: fs.existsSync(clientBuildPath)
      }
    });
  });
  
  app.get('*', (req, res) => {
    res.status(404).json({ 
      message: 'Frontend not deployed. API endpoints only.',
      availableEndpoints: [
        'GET /api/health',
        'POST /api/auth/login',
        'POST /api/auth/register',
        'GET /api/public/committee',
        'GET /api/public/stats',
        'GET /api/courses',
        'GET /api/projects',
        'GET /api/quizzes',
        'GET /api/events'
      ]
    });
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.stack : {}
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ message: 'API endpoint not found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('🚀 Server running on port', PORT);
  console.log('📡 Environment:', process.env.NODE_ENV || 'development');
  console.log('🔗 API Base: http://localhost:' + PORT + '/api');
  console.log('🔧 Supabase:', process.env.SUPABASE_URL ? '✓ Configured' : '✗ Not configured');
  console.log('');
});

module.exports = app;
