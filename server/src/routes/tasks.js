const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const auth = require('../middleware/auth');

// Get user's tasks
router.get('/', auth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    console.error('Fetch tasks error:', error);
    res.status(500).json({ message: 'Failed to fetch tasks', error: error.message });
  }
});

// Create task
router.post('/', auth, async (req, res) => {
  try {
    const taskData = {
      ...req.body,
      user_id: req.user.id,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('tasks')
      .insert([taskData])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Failed to create task', error: error.message });
  }
});

// Update task
router.put('/:id', auth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .update({ ...req.body, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Failed to update task', error: error.message });
  }
});

// Delete task
router.delete('/:id', auth, async (req, res) => {
  try {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id);

    if (error) throw error;
    res.json({ message: 'Task deleted' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Failed to delete task', error: error.message });
  }
});

module.exports = router;
