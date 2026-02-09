const express = require('express');
const router = express.Router();
const axios = require('axios');
const auth = require('../middleware/auth');

router.post('/', auth, async (req, res) => {
  try {
    const { question } = req.body;
    
    if (!question) {
      return res.status(400).json({ message: 'Question required' });
    }
    
    if (!process.env.GROQ_API_KEY) {
      // Fallback to keyword responses if API key not configured
      return res.json({ 
        answer: 'AI chatbot is currently being configured. Please contact scienceclubmecs@gmail.com for assistance.' 
      });
    }
    
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `You are ST Club Assistant, an AI helper for the Science & Tech Club at MECS (Matrusri Engineering College).

Your role is to assist students with:
- Club events, workshops, hackathons, and activities
- Technical courses (Web Development, AI/ML, Cloud Computing, IoT, etc.)
- Project collaboration and guidance
- Membership information and registration
- Committee contact information
- NDLI (National Digital Library of India) resources
- Quiz and assessment details
- Messaging system (DMs and channels)
- Task management features

Key Information:
- Club Email: scienceclubmecs@gmail.com
- Location: Saidabad, Telangana, India
- Features: Projects, Courses, Events, Quizzes, Messaging, Tasks, Research opportunities
- Committee: Admin and committee members available via DM system

Be helpful, friendly, and concise. If you don't know something specific, suggest contacting the committee or admin.`
          },
          {
            role: 'user',
            content: question
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 second timeout
      }
    );
    
    const answer = response.data.choices[0].message.content;
    res.json({ answer });
    
  } catch (error) {
    console.error('Chatbot error:', error.response?.data || error.message);
    
    // Fallback response on error
    const fallbackAnswer = `I'm having trouble connecting right now. For immediate assistance:

📧 Email: scienceclubmecs@gmail.com
💬 DM: Contact committee members via the Messages page
📱 Check the dashboard for announcements and updates

What can I help you with? (Events, Courses, Projects, Membership)`;

    res.json({ answer: fallbackAnswer });
  }
});

module.exports = router;
