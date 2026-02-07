const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const auth = require('../middleware/auth');

// Get all courses
router.get('/', auth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch courses', error: error.message });
  }
});

// Get single course
router.get('/:id', auth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch course', error: error.message });
  }
});

// Create course
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, video_url, thumbnail_url, category, duration } = req.body;
    
    const { data, error } = await supabase
      .from('courses')
      .insert([{
        title,
        description,
        video_url,
        thumbnail_url,
        category,
        duration,
        created_by: req.user.id
      }])
      .select()
      .single();
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create course', error: error.message });
  }
});

// Update course
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, video_url, thumbnail_url, category, duration } = req.body;
    
    const { data, error } = await supabase
      .from('courses')
      .update({ title, description, video_url, thumbnail_url, category, duration })
      .eq('id', req.params.id)
      .select()
      .single();
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update course', error: error.message });
  }
});

// Delete course
router.delete('/:id', auth, async (req, res) => {
  try {
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', req.params.id);
    
    if (error) throw error;
    res.json({ message: 'Course deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete course', error: error.message });
  }
});

module.exports = router;
