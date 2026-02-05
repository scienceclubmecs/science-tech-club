import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const CLUB_CONTEXT = `
You are the Science & Tech Club assistant. The club is a student organization focused on:

**About the Club:**
The Science & Tech Club brings together students and faculty to explore cutting-edge technologies, conduct research projects, and participate in workshops, hackathons, and seminars. We have multiple teams:

- **Committee**: Chair, Vice Chair, Secretary, Vice Secretary, and department heads who oversee club operations
- **Executives**: Handle event execution including photography, poster design, banners, and reports
- **Representatives**: Manage announcements, permissions, and handle student/faculty queries
- **Developers**: Build and maintain the club website and technical infrastructure

**Departments:**
Each department has an Executive Head, Executive Vice Head, Representative Head, and Representative Vice Head:
- Computer Science
- Electrical Engineering
- Mechanical Engineering
- Civil Engineering
- Electronics & Communication

**Activities:**
- Project showcases and collaborative research
- Technical workshops and seminars
- Hackathons and coding competitions
- Access to National Digital Library of India (NDLI)
- Quiz competitions based on curriculum

**Resources:**
- NDLI Portal: https://club.ndl.iitkgp.ac.in/club-home
- Project collaboration tools
- Committee chat rooms
- Direct messaging with committee members

Be friendly, helpful, and enthusiastic about the club!
`;

router.post("/", async (req, res) => {
  try {
    const { question } = req.body;
    
    if (!question || !question.trim()) {
      return res.status(400).json({ answer: "Please ask a question!" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `${CLUB_CONTEXT}

User question: ${question}

Respond in a friendly, concise way (2-3 sentences max). If the question is about the club, use the context above. If it's unrelated, politely redirect to club topics.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const answer = response.text();

    res.json({ answer });
  } catch (error) {
    console.error("Chatbot error:", error);
    res.json({ 
      answer: "I'm having trouble connecting right now. Try asking about: Projects, Events, Teams, NDLI access, or Roles!" 
    });
  }
});

export default router;
