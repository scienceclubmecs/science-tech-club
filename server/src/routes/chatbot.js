import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const CLUB_CONTEXT = `
You are the friendly Science & Tech Club chatbot! 

**Club Info:**
Science & Tech Club organizes workshops, hackathons, projects, and provides NDLI access: https://club.ndl.iitkgp.ac.in/club-home

**Teams & Roles:**
- Committee: Chair, Vice Chair, Secretary, Vice Secretary
- Per Department (CSE, EE, ME, CE, ECE): Executive Head/Vice Head, Representative Head/Vice Head
- Executives: Events, posters, photos, reports
- Representatives: Announcements, permissions
- Developers: Website & tech infrastructure

Keep answers short (2-3 sentences), friendly, and helpful!
`;

router.post("/", async (req, res) => {
  try {
    const { question } = req.body;
    
    if (!question?.trim()) {
      return res.json({ answer: "Hi! Ask me about the club, roles, events, or NDLI! 😊" });
    }

    // FIXED: Use gemini-1.5-flash (current model)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `${CLUB_CONTEXT}\n\nQ: ${question}\nA:`;

    const result = await model.generateContent(prompt);
    const answer = result.response.text().trim();

    console.log(`🤖 Chat: "${question.substring(0,30)}..." → "${answer.substring(0,50)}..."`);

    res.json({ answer });
    
  } catch (error) {
    console.error("Chatbot error:", error.message);
    res.json({ 
      answer: `Oops! Try: "What teams exist?" or "Tell me about NDLI" 😅\nError: ${error.status || error.message}` 
    });
  }
});

export default router;
