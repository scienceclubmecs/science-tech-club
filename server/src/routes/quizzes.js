const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const auth = require('../middleware/auth');

// Get all published quizzes
router.get('/', auth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('quizzes')
      .select('id, title, description, department, year, time_limit, status, created_at')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch quizzes' });
  }
});

// Get single quiz with questions
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
    res.status(500).json({ message: 'Failed to fetch quiz' });
  }
});

// Get my submissions
router.get('/my-submissions', auth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('quiz_submissions')
      .select('*')
      .eq('user_id', req.user.id);
    
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch submissions' });
  }
});

// Create quiz (faculty only)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'faculty' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only faculty can create quizzes' });
    }

    const { title, description, department, year, questions, time_limit } = req.body;
    
    const { data, error } = await supabase
      .from('quizzes')
      .insert([{
        title,
        description,
        department,
        year,
        questions,
        time_limit,
        created_by: req.user.id,
        status: 'draft'
      }])
      .select()
      .single();
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create quiz' });
  }
});

// Submit quiz answers
router.post('/:id/submit', auth, async (req, res) => {
  try {
    const { answers } = req.body;
    
    // Get quiz with correct answers
    const { data: quiz } = await supabase
      .from('quizzes')
      .select('questions')
      .eq('id', req.params.id)
      .single();
    
    // Calculate score
    let correct = 0;
    quiz.questions.forEach((q, idx) => {
      if (answers[idx] === q.correctAnswer) correct++;
    });
    const score = Math.round((correct / quiz.questions.length) * 100);
    
    const { data, error } = await supabase
      .from('quiz_submissions')
      .insert([{
        quiz_id: req.params.id,
        user_id: req.user.id,
        answers,
        score
      }])
      .select()
      .single();
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Failed to submit quiz' });
  }
});

// Approve quiz (admin only)
router.put('/:id/approve', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { data, error } = await supabase
      .from('quizzes')
      .update({
        status: 'published',
        approved_by: req.user.id
      })
      .eq('id', req.params.id)
      .select()
      .single();
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Failed to approve quiz' });
  }
});

module.exports = router;
