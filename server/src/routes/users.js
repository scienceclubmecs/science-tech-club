const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const auth = require('../middleware/auth');

// Get current user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, username, email, role, department, year, roll_number, employment_id, is_committee, committee_post, dob, created_at')
      .eq('id', req.user.id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Fetch profile error:', error);
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
});

// Update current user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const updates = req.body;
    
    // Don't allow updating these fields via profile
    delete updates.password;
    delete updates.role;
    delete updates.id;
    delete updates.created_at;
    
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) throw error;
    
    delete data.password;
    res.json(data);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

// Get all users (admin only)
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { data, error } = await supabase
      .from('users')
      .select('id, username, email, role, department, year, is_committee, committee_post, roll_number, employment_id, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    console.error('Fetch users error:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// Get single user by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, username, email, role, department, year, is_committee, committee_post, roll_number, employment_id, dob')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Fetch user error:', error);
    res.status(500).json({ message: 'Failed to fetch user' });
  }
});

// Update user by ID (admin or self)
router.put('/:id', auth, async (req, res) => {
  try {
    // Users can update their own profile, admins can update anyone
    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updates = req.body;
    
    // Don't allow password updates through this route
    delete updates.password;
    
    // Only admins can change roles and committee status
    if (req.user.role !== 'admin') {
      delete updates.role;
      delete updates.is_committee;
      delete updates.committee_post;
    }

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    
    delete data.password;
    res.json(data);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: error.message || 'Failed to update user' });
  }
});

// Update user role (admin only)
router.put('/:id/role', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { role } = req.body;

    const { data, error } = await supabase
      .from('users')
      .update({ role })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    
    delete data.password;
    res.json(data);
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ message: 'Failed to update role' });
  }
});

// Delete user (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Failed to delete user' });
  }
});

module.exports = router;
