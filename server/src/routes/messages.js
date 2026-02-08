const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const auth = require('../middleware/auth');

// Get all channels user has access to
router.get('/channels', auth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('channels')
      .select('*')
      .or(`is_private.eq.false,members.cs.{${req.user.id}}`)
      .order('name');

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    console.error('Fetch channels error:', error);
    res.status(500).json({ message: 'Failed to fetch channels', error: error.message });
  }
});

// Get direct messages
router.get('/direct', auth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('direct_messages')
      .select(`
        *,
        user1:users!direct_messages_user1_id_fkey(id, username, profile_photo_url),
        user2:users!direct_messages_user2_id_fkey(id, username, profile_photo_url)
      `)
      .or(`user1_id.eq.${req.user.id},user2_id.eq.${req.user.id}`)
      .eq('status', 'accepted')
      .order('last_message_at', { ascending: false });

    if (error) throw error;

    // Format DMs to show the other user
    const formattedDMs = data.map(dm => {
      const otherUser = dm.user1.id === req.user.id ? dm.user2 : dm.user1;
      return {
        id: dm.id,
        ...otherUser,
        unread_count: dm[`user${dm.user1.id === req.user.id ? '1' : '2'}_unread`] || 0,
        last_message: dm.last_message,
        last_message_at: dm.last_message_at
      };
    });

    res.json(formattedDMs);
  } catch (error) {
    console.error('Fetch DMs error:', error);
    res.status(500).json({ message: 'Failed to fetch direct messages', error: error.message });
  }
});

// Get messages in a channel
router.get('/channel/:channelId', auth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:users(id, username, profile_photo_url)
      `)
      .eq('channel_id', req.params.channelId)
      .order('created_at', { ascending: true })
      .limit(100);

    if (error) throw error;

    const formatted = data.map(msg => ({
      ...msg,
      sender_name: msg.sender.username,
      sender_photo: msg.sender.profile_photo_url
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Fetch messages error:', error);
    res.status(500).json({ message: 'Failed to fetch messages', error: error.message });
  }
});

// Send message
router.post('/', auth, async (req, res) => {
  try {
    const { channel_id, content, dm_id } = req.body;

    const messageData = {
      sender_id: req.user.id,
      content,
      created_at: new Date().toISOString()
    };

    if (channel_id) {
      messageData.channel_id = channel_id;
    } else if (dm_id) {
      messageData.dm_id = dm_id;
    }

    const { data, error } = await supabase
      .from('messages')
      .insert([messageData])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Failed to send message', error: error.message });
  }
});

// Request DM connection
router.post('/dm/request', auth, async (req, res) => {
  try {
    const { recipient_id } = req.body;

    // Check if DM already exists
    const { data: existing } = await supabase
      .from('direct_messages')
      .select('*')
      .or(`and(user1_id.eq.${req.user.id},user2_id.eq.${recipient_id}),and(user1_id.eq.${recipient_id},user2_id.eq.${req.user.id})`)
      .single();

    if (existing) {
      return res.status(400).json({ message: 'DM connection already exists' });
    }

    // Create DM request
    const { data, error } = await supabase
      .from('direct_messages')
      .insert([{
        user1_id: req.user.id,
        user2_id: recipient_id,
        status: 'pending',
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('Request DM error:', error);
    res.status(500).json({ message: 'Failed to request DM', error: error.message });
  }
});

// Accept/Reject DM request
router.put('/dm/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body; // 'accepted' or 'rejected'

    const { data, error } = await supabase
      .from('direct_messages')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .eq('user2_id', req.user.id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Update DM status error:', error);
    res.status(500).json({ message: 'Failed to update DM status', error: error.message });
  }
});

module.exports = router;
