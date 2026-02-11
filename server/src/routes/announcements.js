const express = require('express')
const router = express.Router()
const pool = require('../db')

// Get all announcements
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM announcements ORDER BY created_at DESC'
    )
    res.json(result.rows)
  } catch (error) {
    console.error('Announcements error:', error)
    res.status(500).json({ error: 'Failed to fetch announcements' })
  }
})

// Create announcement (admin/committee only)
router.post('/', async (req, res) => {
  try {
    const { title, content, target_audience } = req.body

    if (!req.user.is_committee && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Committee access required' })
    }

    const result = await pool.query(
      `INSERT INTO announcements (title, content, target_audience, author_id, created_at) 
       VALUES ($1, $2, $3, $4, NOW()) 
       RETURNING *`,
      [title, content, target_audience || 'all', req.user.id]
    )

    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('Create announcement error:', error)
    res.status(500).json({ error: 'Failed to create announcement' })
  }
})

// Delete announcement (admin only)
router.delete('/:id', async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' })
    }

    await pool.query('DELETE FROM announcements WHERE id = $1', [req.params.id])
    res.json({ message: 'Announcement deleted' })
  } catch (error) {
    console.error('Delete announcement error:', error)
    res.status(500).json({ error: 'Failed to delete announcement' })
  }
})

module.exports = router
