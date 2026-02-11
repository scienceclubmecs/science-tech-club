const express = require('express')
const router = express.Router()

// Get site config
router.get('/', async (req, res) => {
  try {
    // Return default config for now
    res.json({
      site_name: 'Science & Tech Club',
      logo_url: 'https://i.ibb.co/v6WM95xK/2.jpg',
      mecs_logo_url: 'https://i.ibb.co/sptF2qvk/mecs-logo.jpg',
      theme_mode: 'dark',
      primary_color: '#3b82f6',
      watermark_opacity: '0.25'
    })
  } catch (error) {
    console.error('Config error:', error)
    res.status(500).json({ error: 'Failed to fetch config' })
  }
})

// Update site config (admin only)
router.put('/', async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' })
    }
    
    // For now, just return success
    res.json({ message: 'Config updated successfully' })
  } catch (error) {
    console.error('Config update error:', error)
    res.status(500).json({ error: 'Failed to update config' })
  }
})

module.exports = router
