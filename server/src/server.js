const express = require('express');
const cors = require('cors');
const path = require('path');
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

// Serve static files from React build in production
if (process.env.NODE_ENV === 'production') {
  const clientBuildPath = path.join(__dirname, '../../client/dist');
  
  app.use(express.static(clientBuildPath));
  
  // Catch-all route - serve React app for any non-API route
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.json({ 
      message: 'Science & Tech Club API Server',
      status: 'running',
      environment: 'development'
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

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ message: 'API endpoint not found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API Base: http://localhost:${PORT}/api`);
  console.log(`🔧 Supabase: ${process.env.SUPABASE_URL ? '✓ Configured' : '✗ Not configured'}`);
});

module.exports = app;
