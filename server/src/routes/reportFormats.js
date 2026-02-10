const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.doc' || ext === '.docx') {
      cb(null, true);
    } else {
      cb(new Error('Only .doc and .docx files are allowed'));
    }
  }
});

// Get active report format
router.get('/active', auth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('report_formats')
      .select(`
        *,
        uploader:uploaded_by(id, username, full_name)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
      console.error('❌ Fetch active format error:', error);
      throw error;
    }

    res.json(data || null);
  } catch (error) {
    console.error('❌ Get active format error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch active report format', 
      error: error.message 
    });
  }
});

// Get all report formats (admin only)
router.get('/', auth, async (req, res) => {
  try {
    // Check admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { data, error } = await supabase
      .from('report_formats')
      .select(`
        *,
        uploader:uploaded_by(id, username, full_name)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Fetch formats error:', error);
      throw error;
    }

    res.json(data || []);
  } catch (error) {
    console.error('❌ Get formats error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch report formats', 
      error: error.message 
    });
  }
});

// Upload new report format (admin only)
router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    // Check admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { title, academic_year } = req.body;

    if (!title || !academic_year) {
      return res.status(400).json({ 
        message: 'Title and academic year are required' 
      });
    }

    // Upload to Supabase Storage
    const fileName = `report-formats/${Date.now()}-${req.file.originalname}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false
      });

    if (uploadError) {
      console.error('❌ File upload error:', uploadError);
      throw uploadError;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('documents')
      .getPublicUrl(fileName);

    // Deactivate all previous formats
    await supabase
      .from('report_formats')
      .update({ is_active: false })
      .eq('is_active', true);

    // Save format info to database
    const { data, error } = await supabase
      .from('report_formats')
      .insert([{
        title,
        academic_year,
        file_url: urlData.publicUrl,
        file_name: req.file.originalname,
        uploaded_by: req.user.id,
        is_active: true
      }])
      .select()
      .single();

    if (error) {
      console.error('❌ Save format error:', error);
      throw error;
    }

    res.status(201).json({
      message: 'Report format uploaded successfully',
      format: data
    });
  } catch (error) {
    console.error('❌ Upload format error:', error);
    res.status(500).json({ 
      message: 'Failed to upload report format', 
      error: error.message 
    });
  }
});

// Delete report format (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    // Check admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    // Get format details
    const { data: format } = await supabase
      .from('report_formats')
      .select('file_url, file_name')
      .eq('id', req.params.id)
      .single();

    if (!format) {
      return res.status(404).json({ message: 'Report format not found' });
    }

    // Extract file path from URL
    const urlParts = format.file_url.split('/documents/');
    if (urlParts.length > 1) {
      const filePath = urlParts[1];
      
      // Delete from storage
      await supabase.storage
        .from('documents')
        .remove([filePath]);
    }

    // Delete from database
    const { error } = await supabase
      .from('report_formats')
      .delete()
      .eq('id', req.params.id);

    if (error) {
      console.error('❌ Delete format error:', error);
      throw error;
    }

    res.json({ message: 'Report format deleted successfully' });
  } catch (error) {
    console.error('❌ Delete format error:', error);
    res.status(500).json({ 
      message: 'Failed to delete report format', 
      error: error.message 
    });
  }
});

// Set format as active (admin only)
router.put('/:id/activate', auth, async (req, res) => {
  try {
    // Check admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    // Deactivate all formats
    await supabase
      .from('report_formats')
      .update({ is_active: false })
      .eq('is_active', true);

    // Activate selected format
    const { data, error } = await supabase
      .from('report_formats')
      .update({ is_active: true, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) {
      console.error('❌ Activate format error:', error);
      throw error;
    }

    res.json({
      message: 'Report format activated successfully',
      format: data
    });
  } catch (error) {
    console.error('❌ Activate format error:', error);
    res.status(500).json({ 
      message: 'Failed to activate report format', 
      error: error.message 
    });
  }
});

module.exports = router;
