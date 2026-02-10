const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const auth = require('../middleware/auth');

// Create new project (students & admin)
router.post('/', auth, async (req, res) => {
  try {
    const { 
      title, 
      description, 
      domain, 
      technologies, 
      image_url,
      github_url, 
      live_url,
      max_members 
    } = req.body;

    // Basic validation
    if (!title || title.length < 3) {
      return res.status(400).json({ 
        message: 'Title must be at least 3 characters' 
      });
    }

    if (!description || description.length < 10) {
      return res.status(400).json({ 
        message: 'Description must be at least 10 characters' 
      });
    }

    // Insert project
    const { data: project, error } = await supabase
      .from('projects')
      .insert([{
        title,
        description,
        domain,
        technologies: technologies || [],
        image_url,
        github_url,
        live_url,
        max_members: max_members || 5,
        current_members: 1, // Creator counts as first member
        creator_id: req.user.id,
        status: 'open' // Default: open for members
      }])
      .select()
      .single();

    if (error) {
      console.error('❌ Create project error:', error);
      throw error;
    }

    // Add creator as project member
    await supabase
      .from('project_members')
      .insert([{
        project_id: project.id,
        user_id: req.user.id,
        role: 'creator',
        progress: 0
      }]);

    res.status(201).json({
      message: 'Project created successfully!',
      project
    });
  } catch (error) {
    console.error('❌ Create project error:', error);
    res.status(500).json({ 
      message: 'Failed to create project',
      error: error.message 
    });
  }
});
// Get current user's projects
// Get my projects - BULLETPROOF VERSION
router.get('/my-projects', auth, async (req, res) => {
  try {
    // First try with join (if project_members exists)
    const { data, error } = await supabase
      .from('project_members')
      .select(`
        *,
        projects (
          id,
          title,
          description,
          status,
          domain,
          technologies,
          image_url,
          created_at,
          max_members,
          current_members
        )
      `)
      .eq('user_id', req.user.id)
      .order('joined_at', { ascending: false });

    if (error) {
      console.log('❌ Join query failed, trying simple query:', error.message);
      
      // Fallback: Get projects where user is creator
      const { data: creatorProjects, error: creatorError } = await supabase
        .from('projects')
        .select('*')
        .eq('creator_id', req.user.id)
        .order('created_at', { ascending: false });
      
      if (creatorError) {
        console.error('❌ Fallback query failed:', creatorError.message);
        return res.json([]); // Return empty array instead of error
      }
      
      // Format creator projects to match expected response
      const formattedProjects = creatorProjects.map(project => ({
        ...project,
        role: 'creator',
        joined_at: project.created_at,
        progress: 0
      }));
      
      return res.json(formattedProjects);
    }

    // Format response
    const myProjects = data.map(member => ({
      ...member.projects,
      role: member.role,
      joined_at: member.joined_at,
      progress: member.progress || 0
    }));

    res.json(myProjects);
  } catch (error) {
    console.error('❌ My-projects final error:', error.message);
    res.status(500).json({ 
      message: 'Failed to fetch your projects',
      error: error.message 
    });
  }
});

// Join a project
router.post('/:id/join', auth, async (req, res) => {
  try {
    // Check if project exists and is open
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (projectError) throw projectError;

    if (project.status !== 'open') {
      return res.status(400).json({ message: 'This project is not open for new members' });
    }

    // Check if already a member
    const { data: existing } = await supabase
      .from('project_members')
      .select('*')
      .eq('project_id', req.params.id)
      .eq('user_id', req.user.id)
      .single();

    if (existing) {
      return res.status(400).json({ message: 'You are already a member of this project' });
    }

    // Check if project is full
    if (project.max_members && project.current_members >= project.max_members) {
      return res.status(400).json({ message: 'This project is full' });
    }

    // Add member
    const { data, error } = await supabase
      .from('project_members')
      .insert([{
        project_id: req.params.id,
        user_id: req.user.id,
        role: 'member',
        joined_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;

    // Update current_members count
    await supabase
      .from('projects')
      .update({ 
        current_members: (project.current_members || 0) + 1 
      })
      .eq('id', req.params.id);

    res.json({ 
      message: 'Successfully joined project!',
      membership: data 
    });
  } catch (error) {
    console.error('Join project error:', error);
    res.status(500).json({ 
      message: 'Failed to join project', 
      error: error.message 
    });
  }
});

// Get all projects
router.get('/', auth, async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    console.error('❌ Projects error:', error.message);
    res.status(500).json({ message: 'Failed to fetch projects' });
  }
});

// Get my projects
router.get('/my-projects', auth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('project_members')
      .select(`
        *,
        projects!inner(id, title, description, status, domain, technologies, image_url, created_at)
      `)
      .eq('user_id', req.user.id);

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    console.error('❌ My projects error:', error.message);
    res.status(500).json({ message: 'Failed to fetch your projects' });
  }
});

// Get my projects - SAFE VERSION
router.get('/my-projects', auth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('project_members')
      .select(`
        *,
        projects!inner(id, title, description, status, domain, technologies, image_url, created_at, max_members, current_members)
      `)
      .eq('user_id', req.user.id)
      .order('joined_at', { ascending: false });

    if (error) {
      console.error('❌ My projects error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      throw error;
    }

    res.json(data || []);
  } catch (error) {
    console.error('❌ GET /my-projects error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch your projects',
      error: error.message,
      code: error.code
    });
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
