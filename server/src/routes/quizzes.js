const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const auth = require('../middleware/auth');

// Get all quizzes
router.get('/', auth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch quizzes', error: error.message });
  }
});

// Get single quiz
router.get('/:id', auth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch quiz', error: error.message });
  }
});

// Create quiz (admin/committee only)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && !req.user.is_committee) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { title, description, questions, time_limit } = req.body;
    
    const { data, error } = await supabase
      .from('quizzes')
      .insert([{
        title,
        description,
        questions,
        time_limit,
        created_by: req.user.id
      }])
      .select()
      .single();
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create quiz', error: error.message });
  }
});

// Submit quiz answers
router.post('/:id/submit', auth, async (req, res) => {
  try {
    const { answers } = req.body;
    
    const { data, error } = await supabase
      .from('quiz_submissions')
      .insert([{
        quiz_id: req.params.id,
        user_id: req.user.id,
        answers
      }])
      .select()
      .single();
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Failed to submit quiz', error: error.message });
  }
});

// Delete quiz
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { error } = await supabase
      .from('quizzes')
      .delete()
      .eq('id', req.params.id);
    
    if (error) throw error;
    res.json({ message: 'Quiz deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete quiz', error: error.message });
  }
});

module.exports = router;
