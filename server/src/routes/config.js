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
    // Fetch user role from database
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', req.user.id)
      .single();

    if (userError || !user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { site_name, logo_url, mecs_logo_url, theme_mode, primary_color, watermark_opacity } = req.body;

    // Check if config exists
    const { data: existing } = await supabase
      .from('site_config')
      .select('id')
      .limit(1)
      .single();

    let result;
    
    if (existing) {
      // Update existing config
      const { data, error } = await supabase
        .from('site_config')
        .update({
          site_name,
          logo_url,
          mecs_logo_url,
          theme_mode,
          primary_color,
          watermark_opacity,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      // Insert new config
      const { data, error } = await supabase
        .from('site_config')
        .insert([{
          site_name,
          logo_url,
          mecs_logo_url,
          theme_mode,
          primary_color,
          watermark_opacity
        }])
        .select()
        .single();

      if (error) throw error;
      result = data;
    }
    
    res.json(result);
  } catch (error) {
    console.error('❌ Config update error:', error);
    res.status(500).json({ message: 'Failed to update config', error: error.message });
  }
});

module.exports = router;
