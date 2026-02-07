const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const auth = require('../middleware/auth');

// Get announcements
router.get('/', auth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('announcements')
      .select(`
        *,
        creator:created_by(username, committee_post)
      `)
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch announcements' });
  }
});

// Create announcement (representatives/admin)
router.post('/', auth, async (req, res) => {
  try {
    const canPost = req.user.role === 'admin' || 
                    req.user.committee_post?.includes('Representative') ||
                    req.user.committee_post?.includes('Chair') ||
                    req.user.committee_post?.includes('Secretary');

    if (!canPost) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { title, content, target_audience } = req.body;
    
    const { data, error } = await supabase
      .from('announcements')
      .insert([{
        title,
        content,
        target_audience,
        created_by: req.user.id
      }])
      .select()
      .single();
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create announcement' });
  }
});

// Delete announcement
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
    res.status(500).json({ message: 'Failed to delete announcement' });
  }
});

module.exports = router;
