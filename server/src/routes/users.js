const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const auth = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const multer = require('multer');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Get current user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error) {
      console.error('❌ Supabase error:', error);
      throw error;
    }

    // Remove password from response
    if (data) {
      delete data.password;
    }

    res.json(data);
  } catch (error) {
    console.error('❌ Fetch profile error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch profile',
      error: error.message 
    });
  }
});

// Update current user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { 
      full_name, 
      bio, 
      department, 
      year, 
      roll_number,
      phone,
      github_url,
      linkedin_url,
      interests,
      skills,
      profile_photo_url
    } = req.body;

    const updateData = {
      updated_at: new Date().toISOString()
    };

    // Only update provided fields
    if (full_name !== undefined) updateData.full_name = full_name;
    if (bio !== undefined) updateData.bio = bio;
    if (department !== undefined) updateData.department = department;
    if (year !== undefined) updateData.year = year;
    if (roll_number !== undefined) updateData.roll_number = roll_number;
    if (phone !== undefined) updateData.phone = phone;
    if (github_url !== undefined) updateData.github_url = github_url;
    if (linkedin_url !== undefined) updateData.linkedin_url = linkedin_url;
    if (interests !== undefined) updateData.interests = interests;
    if (skills !== undefined) updateData.skills = skills;
    if (profile_photo_url !== undefined) updateData.profile_photo_url = profile_photo_url;

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase update error:', error);
      throw error;
    }

    // Remove password from response
    if (data) {
      delete data.password;
    }

    res.json(data);
  } catch (error) {
    console.error('❌ Update profile error:', error);
    res.status(500).json({ 
      message: 'Failed to update profile',
      error: error.message 
    });
  }
});

// Upload profile photo
router.post('/profile/upload-photo', auth, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Upload to Supabase Storage
    const fileName = `profile-photos/${req.user.id}-${Date.now()}.${req.file.mimetype.split('/')[1]}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('profile-photos')
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: true
      });

    if (uploadError) {
      console.error('❌ Upload error:', uploadError);
      throw uploadError;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('profile-photos')
      .getPublicUrl(fileName);

    // Update user profile with photo URL
    const { data, error } = await supabase
      .from('users')
      .update({ 
        profile_photo_url: urlData.publicUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) {
      console.error('❌ Update user error:', error);
      throw error;
    }

    // Remove password from response
    if (data) {
      delete data.password;
    }

    res.json({
      message: 'Photo uploaded successfully',
      photo_url: urlData.publicUrl,
      user: data
    });
  } catch (error) {
    console.error('❌ Photo upload error:', error);
    res.status(500).json({ 
      message: 'Failed to upload photo',
      error: error.message 
    });
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
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Supabase error:', error);
      throw error;
    }

    // Remove passwords from all users
    const users = data.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    res.json(users || []);
  } catch (error) {
    console.error('❌ Fetch users error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch users',
      error: error.message 
    });
  }
});

// Get single user by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) {
      console.error('❌ Supabase error:', error);
      throw error;
    }

    if (data) {
      delete data.password;
    }

    res.json(data);
  } catch (error) {
    console.error('❌ Fetch user error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch user',
      error: error.message 
    });
  }
});

// Update user by ID (admin or self)
router.put('/:id', auth, async (req, res) => {
  try {
    // Users can update their own profile, admins can update anyone
    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updates = { ...req.body };
    
    // Don't allow password updates through this route
    delete updates.password;
    delete updates.created_at;
    
    // Only admins can change roles and committee status
    if (req.user.role !== 'admin') {
      delete updates.role;
      delete updates.is_committee;
      delete updates.committee_post;
    }

    // Add updated_at timestamp
    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase update error:', error);
      throw error;
    }

    if (data) {
      delete data.password;
    }

    res.json(data);
  } catch (error) {
    console.error('❌ Update user error:', error);
    res.status(500).json({ 
      message: error.message || 'Failed to update user',
      error: error.message 
    });
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
      .update({ 
        role,
        updated_at: new Date().toISOString()
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase error:', error);
      throw error;
    }

    if (data) {
      delete data.password;
    }

    res.json(data);
  } catch (error) {
    console.error('❌ Update role error:', error);
    res.status(500).json({ 
      message: 'Failed to update role',
      error: error.message 
    });
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

    if (error) {
      console.error('❌ Supabase error:', error);
      throw error;
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('❌ Delete user error:', error);
    res.status(500).json({ 
      message: 'Failed to delete user',
      error: error.message 
    });
  }
});

// Change own password (any user)
router.put('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new password required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    // Get current user with password
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (fetchError) throw fetchError;

    // Verify current password
    const validPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        password: hashedPassword, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', req.user.id);

    if (updateError) throw updateError;

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('❌ Change password error:', error);
    res.status(500).json({ 
      message: 'Failed to change password', 
      error: error.message 
    });
  }
});

// Admin/Committee reset user password
router.put('/:id/reset-password', auth, async (req, res) => {
  try {
    const { newPassword } = req.body;

    // Check if user has permission (admin or committee)
    if (req.user.role !== 'admin' && !req.user.is_committee) {
      return res.status(403).json({ message: 'Only admins and committee members can reset passwords' });
    }

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    const { error } = await supabase
      .from('users')
      .update({ 
        password: hashedPassword, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', req.params.id);

    if (error) throw error;

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('❌ Reset password error:', error);
    res.status(500).json({ 
      message: 'Failed to reset password', 
      error: error.message 
    });
  }
});

// Request password reset (any user can request)
router.post('/request-password-reset', auth, async (req, res) => {
  try {
    const { reason } = req.body;

    // Create password reset request
    const { data, error } = await supabase
      .from('password_reset_requests')
      .insert([{
        user_id: req.user.id,
        username: req.user.username,
        email: req.user.email,
        reason: reason || 'Forgot password',
        status: 'pending',
        requested_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;

    res.json({ 
      message: 'Password reset request submitted. Admin/Committee will process it soon.',
      request: data 
    });
  } catch (error) {
    console.error('❌ Request password reset error:', error);
    res.status(500).json({ 
      message: 'Failed to submit request', 
      error: error.message 
    });
  }
});

// Get password reset requests (admin/committee only)
router.get('/password-reset-requests', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && !req.user.is_committee) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { data, error } = await supabase
      .from('password_reset_requests')
      .select('*')
      .order('requested_at', { ascending: false });

    if (error) throw error;

    res.json(data || []);
  } catch (error) {
    console.error('❌ Fetch reset requests error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch requests', 
      error: error.message 
    });
  }
});

// Approve/Reject password reset request (admin/committee only)
router.put('/password-reset-requests/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && !req.user.is_committee) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { status, new_password } = req.body;

    if (status === 'approved' && new_password) {
      // Get the request
      const { data: request, error: fetchError } = await supabase
        .from('password_reset_requests')
        .select('*')
        .eq('id', req.params.id)
        .single();

      if (fetchError) throw fetchError;

      // Hash new password
      const hashedPassword = await bcrypt.hash(new_password, 10);

      // Update user password
      await supabase
        .from('users')
        .update({ 
          password: hashedPassword, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', request.user_id);

      // Update request status
      await supabase
        .from('password_reset_requests')
        .update({ 
          status: 'approved', 
          processed_by: req.user.id,
          processed_at: new Date().toISOString()
        })
        .eq('id', req.params.id);

      res.json({ message: 'Password reset approved and updated' });
    } else if (status === 'rejected') {
      // Update request status
      await supabase
        .from('password_reset_requests')
        .update({ 
          status: 'rejected',
          processed_by: req.user.id,
          processed_at: new Date().toISOString()
        })
        .eq('id', req.params.id);

      res.json({ message: 'Password reset request rejected' });
    } else {
      res.status(400).json({ message: 'Invalid status or missing new_password' });
    }
  } catch (error) {
    console.error('❌ Process reset request error:', error);
    res.status(500).json({ 
      message: 'Failed to process request', 
      error: error.message 
    });
  }
});

module.exports = router;
