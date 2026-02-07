const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const auth = require('../middleware/auth');

// Get config
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('config')
      .select('*')
      .single();
    
    if (error) throw error;
    res.json(data || {});
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch config', error: error.message });
  }
});

// Update config (admin only)
router.put('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const { site_name, logo_url, git_repo_url } = req.body;
    
    const { data, error } = await supabase
      .from('config')
      .update({ site_name, logo_url, git_repo_url })
      .select()
      .single();
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update config', error: error.message });
  }
});

module.exports = router;
