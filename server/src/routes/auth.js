import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { supabase } from "../config/supabase.js";
import { auth } from "../middleware/auth.js";

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    console.log('\n=== LOGIN ATTEMPT ===');
    console.log('Username:', username);
    console.log('Password provided:', !!password);
    console.log('Password length:', password?.length);

    // Validate input
    if (!username || !password) {
      console.log('ERROR: Missing credentials');
      console.log('=====================\n');
      return res.status(400).json({ message: 'Username and password required' });
    }

    // Get user from database
    console.log('Step 1: Querying users table...');
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    console.log('User query result:', {
      found: !!users,
      error: userError?.message || 'none'
    });

    if (userError) {
      console.log('Supabase error details:', userError);
    }

    if (!users) {
      console.log('ERROR: User not found in database');
      console.log('=====================\n');
      return res.status(400).json({ message: 'Invalid credentials (user not found)' });
    }

    console.log('User found:', {
      id: users.id,
      username: users.username,
      email: users.email,
      role: users.role
    });

    // Get password hash
    console.log('Step 2: Querying user_passwords table...');
    const { data: passwordData, error: pwError } = await supabase
      .from('user_passwords')
      .select('password_hash')
      .eq('user_id', users.id)
      .single();

    console.log('Password query result:', {
      found: !!passwordData,
      error: pwError?.message || 'none',
      hashLength: passwordData?.password_hash?.length || 0
    });

    if (pwError) {
      console.log('Supabase password error details:', pwError);
    }

    if (!passwordData || !passwordData.password_hash) {
      console.log('ERROR: No password hash found for user');
      console.log('=====================\n');
      return res.status(400).json({ message: 'Invalid credentials (no password)' });
    }

    // Verify password
    console.log('Step 3: Verifying password with bcrypt...');
    const validPassword = await bcrypt.compare(password, passwordData.password_hash);
    console.log('Password verification result:', validPassword);

    if (!validPassword) {
      console.log('ERROR: Password does not match hash');
      console.log('=====================\n');
      return res.status(400).json({ message: 'Invalid credentials (wrong password)' });
    }

    // Generate JWT token
    console.log('Step 4: Generating JWT token...');
    
    if (!process.env.JWT_SECRET) {
      console.error('CRITICAL: JWT_SECRET not set!');
      console.log('=====================\n');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    const token = jwt.sign(
      {
        id: users.id,
        username: users.username,
        role: users.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('JWT token generated successfully');
    console.log('Login successful for user:', username);
    console.log('=====================\n');

    // Return user data and token
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
    console.error('\n=== LOGIN ERROR ===');
    console.error('Error type:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.log('===================\n');
    
    res.status(500).json({
      message: 'Server error during login',
      error: error.message
    });
  }
});

// Register endpoint (optional)
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role = 'student' } = req.body;

    // Validation
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
