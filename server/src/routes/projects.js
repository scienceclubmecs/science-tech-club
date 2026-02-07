const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const auth = require('../middleware/auth');

// Get all projects
router.get('/', auth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        creator:creator_id(id, username, email),
        guide:guide_id(id, username, email)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch projects' });
  }
});

// Get my projects
router.get('/my', auth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('creator_id', req.user.id)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch projects' });
  }
});

// Create project
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, vacancies, skills_required } = req.body;
    
    const { data, error } = await supabase
      .from('projects')
      .insert([{
        title,
        description,
        creator_id: req.user.id,
        vacancies,
        skills_required,
        status: 'pending'
      }])
      .select()
      .single();
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create project' });
  }
});

// Approve/reject project (faculty/admin)
router.put('/:id/status', auth, async (req, res) => {
  try {
    if (req.user.role !== 'faculty' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { status, guide_id } = req.body;
    
    const { data, error } = await supabase
      .from('projects')
      .update({ status, guide_id, updated_at: new Date() })
      .eq('id', req.params.id)
      .select()
      .single();
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update project' });
  }
});

// Join project
router.post('/:id/join', auth, async (req, res) => {
  try {
    const { data: project } = await supabase
      .from('projects')
      .select('team_members, vacancies')
      .eq('id', req.params.id)
      .single();
    
    if (!project || project.vacancies <= 0) {
      return res.status(400).json({ message: 'No vacancies available' });
    }

    const team_members = project.team_members || [];
    if (team_members.includes(req.user.id)) {
      return res.status(400).json({ message: 'Already a member' });
    }

    const { data, error } = await supabase
      .from('projects')
      .update({
        team_members: [...team_members, req.user.id],
        vacancies: project.vacancies - 1
      })
      .eq('id', req.params.id)
      .select()
      .single();
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Failed to join project' });
  }
});

module.exports = router;
