const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const auth = require('../middleware/auth');

// Get all events
router.get('/', auth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: true });
    
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch events', error: error.message });
  }
});

// Get single event
router.get('/:id', auth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch event', error: error.message });
  }
});

// Create event (admin/committee only)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && !req.user.is_committee) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { title, description, event_date, location, image_url } = req.body;
    
    const { data, error } = await supabase
      .from('events')
      .insert([{
        title,
        description,
        event_date,
        location,
        image_url,
        created_by: req.user.id
      }])
      .select()
      .single();
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create event', error: error.message });
  }
});

// Update event
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && !req.user.is_committee) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { title, description, event_date, location, image_url } = req.body;
    
    const { data, error } = await supabase
      .from('events')
      .update({ title, description, event_date, location, image_url })
      .eq('id', req.params.id)
      .select()
      .single();
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update event', error: error.message });
  }
});

// Delete event
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', req.params.id);
    
    if (error) throw error;
    res.json({ message: 'Event deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete event', error: error.message });
  }
});

module.exports = router;
