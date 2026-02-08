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

// Health check endpoint
app.get('/api/health', async (req, res) => {
  const supabase = require('./config/supabase');
  
  let dbStatus = 'unknown';
  try {
    const { data, error } = await supabase.from('users').select('count').limit(1);
    dbStatus = error ? 'error' : 'connected';
  } catch (err) {
    dbStatus = 'error';
  }

  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: dbStatus,
    supabaseConfigured: !!(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY)
  });
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

// Serve static files from React build
const clientBuildPath = path.resolve(__dirname, '../../client/dist');
const indexHtmlPath = path.join(clientBuildPath, 'index.html');

console.log('Looking for frontend build at:', clientBuildPath);
console.log('Index.html exists:', fs.existsSync(indexHtmlPath));

if (fs.existsSync(indexHtmlPath)) {
  console.log('✅ Serving static files from:', clientBuildPath);
  
  app.use(express.static(clientBuildPath));
  
  // Catch-all route - serve React app for any non-API route
  app.get('*', (req, res) => {
    res.sendFile(indexHtmlPath);
  });
} else {
  console.log('⚠️  Frontend build not found');
  console.log('📡 Running in API-only mode');
  
  app.get('/', (req, res) => {
    res.json({ 
      message: 'Science & Tech Club API Server',
      status: 'running',
      environment: process.env.NODE_ENV || 'development',
      note: 'Frontend not built. Run npm run build first.'
    });
  });
  
  app.get('*', (req, res) => {
    res.status(404).json({ 
      message: 'Frontend not deployed',
      apiEndpoints: [
        'GET /api/health',
        'POST /api/auth/login',
        'POST /api/auth/register',
        'GET /api/public/committee'
      ]
    });
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.stack : {}
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API Base: http://localhost:${PORT}/api`);
  console.log(`🔧 Supabase: ${process.env.SUPABASE_URL ? '✓ Configured' : '✗ Not configured'}`);
});

module.exports = app;
