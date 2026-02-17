const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({ 
  storage, 
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /mp4|avi|mov|webm|ogg/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only video files (mp4, avi, mov, webm, ogg) allowed'));
  }
});

// Upload course video
router.post('/videos', auth, upload.single('video'), async (req, res) => {
  try {
    const { title, description, course_id } = req.body;

    if (!req.file || !title) {
      return res.status(400).json({ message: 'Video file and title required' });
    }

    // Upload to Supabase Storage
    const fileName = `${Date.now()}_${req.user.id}_${req.file.originalname}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('course-videos')
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: true
      });

    if (uploadError) throw uploadError;

    // Insert course video record
    const { data, error } = await supabase
      .from('course_videos')
      .insert([{
        title: title.trim(),
        description: description?.trim(),
        video_url: uploadData.path,
        uploaded_by: req.user.id,
        course_id: course_id || null,
        views: 0
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    console.error('Upload video error:', error);
    res.status(500).json({ message: 'Failed to upload video', error: error.message });
  }
});

// Get all course videos
router.get('/videos', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('course_videos')
      .select(`
        *,
        uploader:users!uploaded_by (
          id,
          username,
          full_name,
          profile_photo_url
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(data || []);
  } catch (error) {
    console.error('Fetch videos error:', error);
    res.status(500).json({ message: 'Failed to fetch videos', error: error.message });
  }
});

// Get video comments
router.get('/videos/:videoId/comments', async (req, res) => {
  try {
    const { videoId } = req.params;
    const { data, error } = await supabase
      .from('video_comments')
      .select(`
        *,
        commenter:users!commenter_id_fkey (
          id,
          username,
          full_name,
          profile_photo_url
        ),
        reactions (
          *,
          user:users!reaction_user_id_fkey(id, username)
        )
      `)
      .eq('video_id', videoId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    res.json(data || []);
  } catch (error) {
    console.error('Fetch comments error:', error);
    res.status(500).json({ message: 'Failed to fetch comments', error: error.message });
  }
});

// Add comment
router.post('/videos/:videoId/comments', auth, async (req, res) => {
  try {
    const { videoId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Comment content required' });
    }

    // Insert comment
    const { data: comment, error: commentError } = await supabase
      .from('video_comments')
      .insert([{
        video_id: videoId,
        commenter_id: req.user.id,
        content: content.trim()
      }])
      .select()
      .single();

    if (commentError) throw commentError;

    // Auto-send DM to uploader
    const { data: video } = await supabase
      .from('course_videos')
      .select('uploaded_by')
      .eq('id', videoId)
      .single();

    if (video && video.uploaded_by !== req.user.id) {
      // Send DM notification
      await supabase
        .from('messages')
        .insert([{
          sender_id: req.user.id,
          receiver_id: video.uploaded_by,
          content: `New comment on your video: "${content.substring(0, 50)}..."`,
          is_notification: true
        }]);
    }

    res.status(201).json(comment);
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Failed to add comment', error: error.message });
  }
});

// Add reaction
router.post('/comments/:commentId/react', auth, async (req, res) => {
  try {
    const { commentId } = req.params;
    const { reaction } = req.body; // 'like', 'love', 'haha', etc.

    if (!reaction) {
      return res.status(400).json({ message: 'Reaction required' });
    }

    // Upsert reaction
    const { data, error } = await supabase
      .from('video_comment_reactions')
      .upsert([{
        comment_id: commentId,
        user_id: req.user.id,
        reaction
      }], { 
        onConflict: 'comment_id,user_id',
        ignoreDuplicates: false 
      })
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Add reaction error:', error);
    res.status(500).json({ message: 'Failed to add reaction', error: error.message });
  }
});

// Delete reaction
router.delete('/comments/:commentId/react', auth, async (req, res) => {
  try {
    const { commentId } = req.params;

    const { error } = await supabase
      .from('video_comment_reactions')
      .delete()
      .eq('comment_id', commentId)
      .eq('user_id', req.user.id);

    if (error) throw error;

    res.json({ message: 'Reaction removed' });
  } catch (error) {
    console.error('Delete reaction error:', error);
    res.status(500).json({ message: 'Failed to remove reaction', error: error.message });
  }
});

module.exports = router;
