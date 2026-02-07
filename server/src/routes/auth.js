const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    console.log('=== LOGIN ATTEMPT ===');
    console.log('Username:', username);

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password required' });
    }

    // Get user
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    console.log('User found:', !!users);

    if (userError || !users) {
      console.log('User not found');
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Get password
    const { data: passwordData, error: pwError } = await supabase
      .from('user_passwords')
      .select('password_hash')
      .eq('user_id', users.id)
      .single();

    console.log('Password found:', !!passwordData);

    if (pwError || !passwordData) {
      console.log('Password not found');
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, passwordData.password_hash);
    console.log('Password valid:', validPassword);

    if (!validPassword) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create token
    const token = jwt.sign(
      { id: users.id, username: users.username, role: users.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('Login successful');

    res.json({
      user: {
        id: users.id,
        username: users.username,
        email: users.email,
        role: users.role,
        is_committee: users.is_committee,
        department: users.department,
        year: users.year
      },
      token
    });

  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role = 'student' } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields required' });
    }

    // Check if user exists
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single();

    if (existing) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Create user
    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert([{ username, email, role }])
      .select()
      .single();

    if (userError) throw userError;

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Save password
    const { error: pwError } = await supabase
      .from('user_passwords')
      .insert([{ user_id: newUser.id, password_hash: passwordHash }]);

    if (pwError) throw pwError;

    res.json({ message: 'User created successfully', user: newUser });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
});

module.exports = router;
