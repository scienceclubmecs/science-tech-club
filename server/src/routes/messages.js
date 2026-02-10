const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const auth = require('../middleware/auth');

// Get unread message count
router.get('/unread-count', auth, async (req, res) => {
  try {
    // Count unread direct messages
    const { count: dmCount, error: dmError } = await supabase
      .from('direct_messages')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', req.user.id)
      .eq('read', false);

    if (dmError) {
      console.error('❌ DM count error:', dmError);
      // Don't throw, just return 0
      return res.json({ unread_count: 0 });
    }

    res.json({ unread_count: dmCount || 0 });
  } catch (error) {
    console.error('❌ Unread count error:', error);
    // Return 0 instead of error to prevent UI breaking
    res.json({ unread_count: 0 });
  }
});

// Get direct messages with a friend
router.get('/direct/:friendId', auth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('direct_messages')
      .select('*')
      .or(`and(sender_id.eq.${req.user.id},receiver_id.eq.${req.params.friendId}),and(sender_id.eq.${req.params.friendId},receiver_id.eq.${req.user.id})`)
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Mark messages as read
    await supabase
      .from('direct_messages')
      .update({ read: true })
      .eq('receiver_id', req.user.id)
      .eq('sender_id', req.params.friendId)
      .eq('read', false);

    res.json(data || []);
  } catch (error) {
    console.error('❌ Fetch DMs error:', error);
    res.status(500).json({ message: 'Failed to fetch messages', error: error.message });
  }
});

// Send direct message
router.post('/direct', auth, async (req, res) => {
  try {
    const { receiver_id, message } = req.body;

    if (!receiver_id || !message) {
      return res.status(400).json({ message: 'Receiver and message required' });
    }

    const { data, error } = await supabase
      .from('direct_messages')
      .insert([{
        sender_id: req.user.id,
        receiver_id,
        message: message.trim(),
        read: false
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    console.error('❌ Send DM error:', error);
    res.status(500).json({ message: 'Failed to send message', error: error.message });
  }
});

// Get all channels
router.get('/channels', auth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('channels')
      .select('*')
      .order('name');

    if (error) throw error;

    res.json(data || []);
  } catch (error) {
    console.error('❌ Fetch channels error:', error);
    res.status(500).json({ message: 'Failed to fetch channels', error: error.message });
  }
});

// Get channel by ID
router.get('/channel/:id', auth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('channels')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('❌ Fetch channel error:', error);
    res.status(500).json({ message: 'Failed to fetch channel', error: error.message });
  }
});

// Get messages for a channel
router.get('/channel/:id/messages', auth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:users!messages_sender_id_fkey(id, username, full_name, profile_photo_url)
      `)
      .eq('channel_id', req.params.id)
      .order('created_at', { ascending: true });

    if (error) throw error;

    res.json(data || []);
  } catch (error) {
    console.error('❌ Fetch channel messages error:', error);
    res.status(500).json({ message: 'Failed to fetch messages', error: error.message });
  }
});

// Send message to channel
router.post('/channel/:id', auth, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || content.trim() === '') {
      return res.status(400).json({ message: 'Message content required' });
    }

    const { data, error } = await supabase
      .from('messages')
      .insert([{
        channel_id: req.params.id,
        sender_id: req.user.id,
        content: content.trim()
      }])
      .select(`
        *,
        sender:users!messages_sender_id_fkey(id, username, full_name, profile_photo_url)
      `)
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    console.error('❌ Send message error:', error);
    res.status(500).json({ message: 'Failed to send message', error: error.message });
  }
});

module.exports = router;
