const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// Get committee members (public)
router.get('/committee', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, username, email, committee_post, department, profile_photo_url')
      .eq('is_committee', true)
      .order('created_at', { ascending: true });

    if (error) throw error;

    res.json(data || []);
  } catch (error) {
    console.error('Error fetching committee:', error);
    res.status(500).json({ message: 'Failed to fetch committee members' });
  }
});

// Get public stats
router.get('/stats', async (req, res) => {
  try {
    const { count: membersCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    const { count: projectsCount } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true });

    const { count: eventsCount } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true });

    res.json({
      members: membersCount || 0,
      projects: projectsCount || 0,
      events: eventsCount || 0,
      certifications: 100
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.json({
      members: 500,
      projects: 50,
      events: 30,
      certifications: 100
    });
  }
});

module.exports = router;
