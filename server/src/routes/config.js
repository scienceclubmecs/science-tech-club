const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const auth = require('../middleware/auth');

// Get config (public)
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('config')
      .select('*')
      .limit(1)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('Config fetch error:', error);
    }
    
    res.json(data || {
      site_name: 'Science & Tech Club',
      logo_url: '',
      git_repo_url: 'https://github.com/scienceclubmecs/science-tech-club',
      contact_email: 'scienceclubmecs@gmail.com',
      hero_title: 'Innovate. Create. Inspire.',
      hero_subtitle: 'Join the premier tech community',
      theme_color: 'blue'
    });
  } catch (error) {
    console.error('Config error:', error);
    res.status(500).json({ message: 'Failed to fetch config' });
  }
});

// Update config (admin/developer only)
router.put('/', auth, async (req, res) => {
  try {
    const canEdit = req.user.role === 'admin' || 
                    req.user.committee_post === 'Developer';
    
    if (!canEdit) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const configData = req.body;
    
    const { data: existing } = await supabase
      .from('config')
      .select('id')
      .limit(1)
      .single();
    
    if (existing) {
      const { data, error } = await supabase
        .from('config')
        .update(configData)
        .eq('id', existing.id)
        .select()
        .single();
      
      if (error) throw error;
      res.json(data);
    } else {
      const { data, error } = await supabase
        .from('config')
        .insert([configData])
        .select()
        .single();
      
      if (error) throw error;
      res.json(data);
    }
  } catch (error) {
    console.error('Update config error:', error);
    res.status(500).json({ message: 'Failed to update config' });
  }
});

module.exports = router;
