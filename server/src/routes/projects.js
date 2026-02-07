const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const auth = require('../middleware/auth');

// Get all projects
router.get('/', auth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch projects', error: error.message });
  }
});

// Get single project
router.get('/:id', auth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch project', error: error.message });
  }
});

// Create project
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, github_url, demo_url, technologies, image_url } = req.body;
    
    const { data, error } = await supabase
      .from('projects')
      .insert([{
        title,
        description,
        github_url,
        demo_url,
        technologies,
        image_url,
        created_by: req.user.id
      }])
      .select()
      .single();
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create project', error: error.message });
  }
});

// Update project
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, github_url, demo_url, technologies, image_url } = req.body;
    
    const { data, error } = await supabase
      .from('projects')
      .update({ title, description, github_url, demo_url, technologies, image_url })
      .eq('id', req.params.id)
      .select()
      .single();
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update project', error: error.message });
  }
});

// Delete project
router.delete('/:id', auth, async (req, res) => {
  try {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', req.params.id);
    
    if (error) throw error;
    res.json({ message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete project', error: error.message });
  }
});

module.exports = router;
