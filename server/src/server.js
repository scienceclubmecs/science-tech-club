const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Import routes
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const projectsRoutes = require('./routes/projects');
const tasksRoutes = require('./routes/tasks');
const messagesRoutes = require('./routes/messages');
const channelsRoutes = require('./routes/channels');
const friendsRoutes = require('./routes/friends');
const queriesRoutes = require('./routes/queries');
const eventsRoutes = require('./routes/events');
const permissionsRoutes = require('./routes/permissions');
const departmentsRoutes = require('./routes/departments');

// Add after existing route imports
const configRoutes = require('./routes/config')
const announcementRoutes = require('./routes/announcements')
const courseRoutes = require('./routes/courses')
const reportFormatRoutes = require('./routes/reportFormats')
const publicRoutes = require('./routes/public')
const multer = require('multer');





// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Science & Tech Club API', status: 'running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/channels', channelsRoutes);
app.use('/api/friends', friendsRoutes);
app.use('/api/queries', queriesRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/permissions', permissionsRoutes);
app.use('/api/departments', departmentsRoutes);
app.use('/api/config', configRoutes)
app.use('/api/announcements', announcementRoutes)
app.use('/api/courses', courseRoutes)
app.use('/api/report-formats', reportFormatRoutes)
app.use('/api/public', publicRoutes)


console.log('✅ Routes registered:', {
  config: !!configRoutes,
  announcements: !!announcementRoutes,
  courses: !!courseRoutes,
  reportFormats: !!reportFormatRoutes,
  public: !!publicRoutes
})

// 404 handler
app.use((req, res) => {
  console.log(`⚠️ 404 - Not Found: ${req.method} ${req.path}`);
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
