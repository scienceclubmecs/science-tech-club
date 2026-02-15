const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const { createClient } = require('@supabase/supabase-js');

// ✅ FIX: Import auth middleware correctly
const auth = require('../middleware/auth');

// ✅ Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  //process.env.SUPABASE_SERVICE_KEY
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Generate statistics report (Admin only)
router.get('/generate-statistics', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    // Fetch all statistics
    const [usersRes, eventsRes, projectsRes] = await Promise.all([
      supabase.from('users').select('*'),
      supabase.from('events').select('*'),
      supabase.from('projects').select('*, project_members(*)')
    ]);

    const users = usersRes.data || [];
    const events = eventsRes.data || [];
    const projects = projectsRes.data || [];

    // Calculate statistics
    const stats = {
      totalUsers: users.length,
      students: users.filter(u => u.role === 'student').length,
      faculty: users.filter(u => u.role === 'faculty').length,
      committeeMembers: users.filter(u => u.is_committee).length,
      
      // Department breakdown
      departments: {},
      
      // Events statistics
      totalEvents: events.length,
      upcomingEvents: events.filter(e => e.status === 'upcoming').length,
      completedEvents: events.filter(e => e.status === 'completed').length,
      
      // Projects statistics
      totalProjects: projects.length,
      openProjects: projects.filter(p => p.status === 'open').length,
      approvedProjects: projects.filter(p => p.status === 'approved').length,
      completedProjects: projects.filter(p => p.status === 'completed').length,
      
      // Committee posts
      committeePosts: {}
    };

    // Count users by department
    users.forEach(user => {
      if (user.department) {
        stats.departments[user.department] = (stats.departments[user.department] || 0) + 1;
      }
    });

    // Count committee posts
    users.filter(u => u.is_committee && u.committee_post).forEach(user => {
      stats.committeePosts[user.committee_post] = (stats.committeePosts[user.committee_post] || 0) + 1;
    });

    // Create PDF
    const doc = new PDFDocument({ margin: 50 });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=club-statistics-report-${Date.now()}.pdf`);

    // Pipe PDF to response
    doc.pipe(res);

    // Add content to PDF
    generatePDFContent(doc, stats, users, events, projects);

    // Finalize PDF
    doc.end();

  } catch (error) {
    console.error('Generate report error:', error);
    res.status(500).json({ 
      message: 'Failed to generate report',
      error: error.message 
    });
  }
});

// Helper function to generate PDF content
function generatePDFContent(doc, stats, users, events, projects) {
  const primaryColor = '#2563eb'; // Blue
  const secondaryColor = '#64748b'; // Gray
  
  // Header
  doc.fontSize(24)
     .fillColor(primaryColor)
     .text('Science & Tech Club', { align: 'center' })
     .moveDown(0.3);
  
  doc.fontSize(18)
     .fillColor(secondaryColor)
     .text('Statistics Report', { align: 'center' })
     .moveDown(0.3);
  
  doc.fontSize(10)
     .fillColor(secondaryColor)
     .text(`Generated on: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`, { align: 'center' })
     .moveDown(1.5);

  // Draw separator line
  doc.strokeColor(primaryColor)
     .lineWidth(2)
     .moveTo(50, doc.y)
     .lineTo(550, doc.y)
     .stroke()
     .moveDown(1);

  // Section 1: Overview Statistics
  doc.fontSize(16)
     .fillColor(primaryColor)
     .text('📊 Overview Statistics', { underline: true })
     .moveDown(0.5);

  doc.fontSize(11)
     .fillColor('#000000');

  const overviewData = [
    ['Total Users:', stats.totalUsers],
    ['Students:', stats.students],
    ['Faculty:', stats.faculty],
    ['Committee Members:', stats.committeeMembers],
    ['Total Events:', stats.totalEvents],
    ['Total Projects:', stats.totalProjects]
  ];

  overviewData.forEach(([label, value]) => {
    doc.text(`${label}`, 70, doc.y, { continued: true, width: 200 })
       .font('Helvetica-Bold')
       .text(`${value}`, { align: 'right' })
       .font('Helvetica')
       .moveDown(0.3);
  });

  doc.moveDown(1.5);

  // Section 2: Department Distribution
  doc.fontSize(16)
     .fillColor(primaryColor)
     .text('🏫 Department Distribution', { underline: true })
     .moveDown(0.5);

  doc.fontSize(11)
     .fillColor('#000000');

  if (Object.keys(stats.departments).length > 0) {
    Object.entries(stats.departments).forEach(([dept, count]) => {
      const percentage = ((count / stats.totalUsers) * 100).toFixed(1);
      doc.text(`${dept}:`, 70, doc.y, { continued: true, width: 200 })
         .font('Helvetica-Bold')
         .text(`${count} (${percentage}%)`, { align: 'right' })
         .font('Helvetica')
         .moveDown(0.3);
    });
  } else {
    doc.text('No department data available.', 70);
  }

  doc.moveDown(1.5);

  // Section 3: Events Breakdown
  doc.fontSize(16)
     .fillColor(primaryColor)
     .text('📅 Events Breakdown', { underline: true })
     .moveDown(0.5);

  doc.fontSize(11)
     .fillColor('#000000');

  const eventsData = [
    ['Upcoming Events:', stats.upcomingEvents],
    ['Completed Events:', stats.completedEvents]
  ];

  eventsData.forEach(([label, value]) => {
    doc.text(`${label}`, 70, doc.y, { continued: true, width: 200 })
       .font('Helvetica-Bold')
       .text(`${value}`, { align: 'right' })
       .font('Helvetica')
       .moveDown(0.3);
  });

  doc.moveDown(1.5);

  // Section 4: Projects Status
  doc.fontSize(16)
     .fillColor(primaryColor)
     .text('💼 Projects Status', { underline: true })
     .moveDown(0.5);

  doc.fontSize(11)
     .fillColor('#000000');

  const projectsData = [
    ['Open Projects:', stats.openProjects],
    ['Approved Projects:', stats.approvedProjects],
    ['Completed Projects:', stats.completedProjects]
  ];

  projectsData.forEach(([label, value]) => {
    doc.text(`${label}`, 70, doc.y, { continued: true, width: 200 })
       .font('Helvetica-Bold')
       .text(`${value}`, { align: 'right' })
       .font('Helvetica')
       .moveDown(0.3);
  });

  doc.moveDown(1.5);

  // Section 5: Committee Structure
  if (Object.keys(stats.committeePosts).length > 0) {
    doc.fontSize(16)
       .fillColor(primaryColor)
       .text('👥 Committee Structure', { underline: true })
       .moveDown(0.5);

    doc.fontSize(11)
       .fillColor('#000000');

    Object.entries(stats.committeePosts).forEach(([post, count]) => {
      doc.text(`${post}:`, 70, doc.y, { continued: true, width: 200 })
         .font('Helvetica-Bold')
         .text(`${count}`, { align: 'right' })
         .font('Helvetica')
         .moveDown(0.3);
    });

    doc.moveDown(1.5);
  }

  // Add new page for detailed lists
  doc.addPage();

  // Recent Events List
  doc.fontSize(16)
     .fillColor(primaryColor)
     .text('📋 Recent Events (Last 10)', { underline: true })
     .moveDown(0.5);

  doc.fontSize(10)
     .fillColor('#000000');

  const recentEvents = events
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 10);

  if (recentEvents.length > 0) {
    recentEvents.forEach((event, index) => {
      doc.font('Helvetica-Bold')
         .text(`${index + 1}. ${event.title}`, 70)
         .font('Helvetica')
         .fontSize(9)
         .fillColor(secondaryColor)
         .text(`   Status: ${event.status} | Date: ${event.event_date ? new Date(event.event_date).toLocaleDateString() : 'TBD'}`, 70)
         .moveDown(0.5);
      doc.fontSize(10).fillColor('#000000');
    });
  } else {
    doc.text('No events found.', 70);
  }

  doc.moveDown(1.5);

  // Recent Projects List
  doc.fontSize(16)
     .fillColor(primaryColor)
     .text('💡 Recent Projects (Last 10)', { underline: true })
     .moveDown(0.5);

  doc.fontSize(10)
     .fillColor('#000000');

  const recentProjects = projects
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 10);

  if (recentProjects.length > 0) {
    recentProjects.forEach((project, index) => {
      const memberCount = project.project_members?.length || 0;
      doc.font('Helvetica-Bold')
         .text(`${index + 1}. ${project.title}`, 70)
         .font('Helvetica')
         .fontSize(9)
         .fillColor(secondaryColor)
         .text(`   Status: ${project.status} | Members: ${memberCount}/${project.max_members}`, 70)
         .moveDown(0.5);
      doc.fontSize(10).fillColor('#000000');
    });
  } else {
    doc.text('No projects found.', 70);
  }

  // Footer
  doc.moveDown(2);
  doc.fontSize(8)
     .fillColor(secondaryColor)
     .text('© 2026 Science & Tech Club - Matrusri Engineering College', { align: 'center' })
     .text('Generated by Admin Dashboard', { align: 'center' });
}

module.exports = router;
