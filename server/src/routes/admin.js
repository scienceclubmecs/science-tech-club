const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const supabase = require('../config/supabase');
const auth = require('../middleware/auth');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// Admin middleware
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }
  next();
};

// Get dashboard stats
router.get('/dashboard', auth, isAdmin, async (req, res) => {
  try {
    const { count: totalUsers } = await supabase.from('users').select('*', { count: 'exact', head: true });
    const { count: totalCourses } = await supabase.from('courses').select('*', { count: 'exact', head: true });
    const { count: students } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'student');
    
    res.json({ totalUsers, totalCourses, students });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch stats', error: error.message });
  }
});

// Add student
router.post('/add-student', auth, isAdmin, async (req, res) => {
  try {
    const { username, email, department, year, password } = req.body;
    
    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert([{ username, email, department, year, role: 'student' }])
      .select()
      .single();
    
    if (userError) throw userError;
    
    const passwordHash = await bcrypt.hash(password, 10);
    const { error: pwError } = await supabase
      .from('user_passwords')
      .insert([{ user_id: newUser.id, password_hash: passwordHash }]);
    
    if (pwError) throw pwError;
    
    res.json({ message: 'Student added', user: newUser });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add student', error: error.message });
  }
});

// Add faculty
router.post('/add-faculty', auth, isAdmin, async (req, res) => {
  try {
    const { username, email, department, password } = req.body;
    
    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert([{ username, email, department, role: 'faculty' }])
      .select()
      .single();
    
    if (userError) throw userError;
    
    const passwordHash = await bcrypt.hash(password, 10);
    const { error: pwError } = await supabase
      .from('user_passwords')
      .insert([{ user_id: newUser.id, password_hash: passwordHash }]);
    
    if (pwError) throw pwError;
    
    res.json({ message: 'Faculty added', user: newUser });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add faculty', error: error.message });
  }
});

// Upload students CSV
router.post('/upload-students', auth, isAdmin, upload.single('file'), async (req, res) => {
  try {
    res.json({ message: 'CSV upload not implemented yet' });
  } catch (error) {
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
});

// Upload faculty CSV
router.post('/upload-faculty', auth, isAdmin, upload.single('file'), async (req, res) => {
  try {
    res.json({ message: 'CSV upload not implemented yet' });
  } catch (error) {
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
});

// Add this route to admin.js
router.put('/reset-password', auth, isAdmin, async (req, res) => {
  try {
    const { username, newPassword } = req.body;
    
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single();
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const passwordHash = await bcrypt.hash(newPassword, 10);
    
    const { error } = await supabase
      .from('user_passwords')
      .update({ password_hash: passwordHash })
      .eq('user_id', user.id);
    
    if (error) throw error;
    
    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to reset password' });
  }
});


module.exports = router;
