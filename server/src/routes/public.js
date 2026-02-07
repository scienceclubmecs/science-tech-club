const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// Get committee members (public endpoint)
router.get('/committee', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, username, committee_post, department, profile_photo_url')
      .eq('is_committee', true)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    
    // Sort by post importance
    const postOrder = [
      'Chair', 'Vice Chair', 'Secretary', 'Vice Secretary',
      'CSE Head', 'AIML Head', 'IT Head', 'Civil Head', 'ECE Head', 'EEE Head',
      'Executive Head', 'Representative Head'
    ];
    
    const sorted = data.sort((a, b) => {
      const aIndex = postOrder.indexOf(a.committee_post);
      const bIndex = postOrder.indexOf(b.committee_post);
      return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
    });
    
    res.json(sorted);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch committee' });
  }
});

module.exports = router;
