const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');
const auth = require('../middleware/auth'); 

// Login with username
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    console.log('Login attempt for username:', username);

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password required' });
    }

    // Check if Supabase is configured
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      console.error('Supabase credentials missing!');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    // Get user by username
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      if (error.code === 'PGRST116') {
        return res.status(401).json({ message: 'Invalid username or password' });
      }
      return res.status(500).json({ message: 'Database error', details: error.message });
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Remove password from response
    delete user.password;

    console.log('Login successful for user:', user.username);
    res.json({ token, user });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});
// Add this route to your existing auth.js file
router.get('/verify', auth, async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .single()
    
    if (error) throw error
    
    // Remove password from response
    delete user.password
    
    res.json({ user })
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' })
  }
})

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, username, role, department } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password required' });
    }

    // Check if username already exists
    const { data: existing } = await supabase
      .from('users')
      .select('username')
      .eq('username', username)
      .single();

    if (existing) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const { data, error } = await supabase
      .from('users')
      .insert([{
        email: email || `${username}@mecs.ac.in`,
        password: hashedPassword,
        username,
        role: role || 'student',
        department: department || 'Not specified'
      }])
      .select()
      .single();

    if (error) {
      console.error('Registration error:', error);
      return res.status(400).json({ message: 'Registration failed', details: error.message });
    }

    // Generate token
    const token = jwt.sign(
      { userId: data.id, role: data.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    delete data.password;

    res.status(201).json({ token, user: data });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
});

module.exports = router;
