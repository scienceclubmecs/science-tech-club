const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const auth = require('../middleware/auth');

// Get site config
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('site_config')
      .select('*')
      .single();

    // If error or no data, return default config
    if (error || !data) {
      console.log('⚠️ No site_config found, returning defaults');
      return res.json({
        site_name: 'Science & Tech Club',
        logo_url: 'https://i.ibb.co/v6WM95xK/2.jpg',
        mecs_logo_url: 'https://i.ibb.co/sptF2qvk/mecs-logo.jpg',
        theme_mode: 'dark',
        primary_color: '#3b82f6',
        watermark_opacity: '0.25'
      });
    }

    res.json(data);
  } catch (error) {
    console.error('❌ Config error:', error);
    // Still return default config on any error
    res.json({
      site_name: 'Science & Tech Club',
      logo_url: 'https://i.ibb.co/v6WM95xK/2.jpg',
      mecs_logo_url: 'https://i.ibb.co/sptF2qvk/mecs-logo.jpg',
      theme_mode: 'dark',
      primary_color: '#3b82f6',
      watermark_opacity: '0.25'
    });
  }
});

// Update site config (admin only)
router.put('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { site_name, logo_url, mecs_logo_url, theme_mode, primary_color, watermark_opacity } = req.body;

    const { data, error } = await supabase
      .from('site_config')
      .upsert({
        id: 1,
        site_name,
        logo_url,
        mecs_logo_url,
        theme_mode,
        primary_color,
        watermark_opacity,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Upsert error:', error);
      throw error;
    }
    
    res.json(data);
  } catch (error) {
    console.error('❌ Config update error:', error);
    res.status(500).json({ message: 'Failed to update config', error: error.message });
  }
});

module.exports = router;
