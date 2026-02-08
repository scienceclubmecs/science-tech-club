const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const auth = require('../middleware/auth');

// Get all announcements
router.get('/', auth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    console.error('Fetch announcements error:', error);
    res.status(500).json({ message: 'Failed to fetch announcements' });
  }
});

// Create announcement (admin only)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { title, content, target_audience } = req.body;

    const { data, error } = await supabase
      .from('announcements')
      .insert([{ title, content, target_audience }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('Create announcement error:', error);
    res.status(500).json({ message: 'Failed to create announcement' });
  }
});

// Delete announcement (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { error } = await supabase
      .from('announcements')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ message: 'Announcement deleted' });
  } catch (error) {
    console.error('Delete announcement error:', error);
    res.status(500).json({ message: 'Failed to delete announcement' });
  }
});

module.exports = router;
