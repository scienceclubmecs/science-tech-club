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

    // TRY MULTIPLE MODEL NAMES (fallback approach)
    let model;
    try {
      model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    } catch {
      try {
        model = genAI.getGenerativeModel({ model: "gemini-1.0-pro" });
      } catch {
        model = genAI.getGenerativeModel({ model: "models/gemini-pro" });
      }
    }

    const prompt = `${CLUB_CONTEXT}\n\nUser: ${question}\nAssistant:`;

    const result = await model.generateContent(prompt);
    const answer = result.response.text().trim();

    console.log(`🤖 Chat OK: "${question.substring(0,30)}..."`);

    res.json({ answer });
    
  } catch (error) {
    console.error("Chatbot error:", error.message);
    
    // Fallback response
    const fallbacks = {
      "club": "Science & Tech Club organizes workshops, hackathons, and projects. We have Committee leaders and department heads (Executive/Representative). Visit NDLI: https://club.ndl.iitkgp.ac.in/club-home",
      "role": "We have Committee (Chair, Vice Chair, Secretary), department-specific Executive Heads and Representative Heads for CSE, EE, ME, CE, ECE, plus Developers team.",
      "ndli": "Access National Digital Library at: https://club.ndl.iitkgp.ac.in/club-home with tons of academic resources!",
      "team": "Teams: Committee (leadership), Executives (events), Representatives (communications), Developers (tech)."
    };
    
    const keyword = Object.keys(fallbacks).find(k => question.toLowerCase().includes(k));
    const fallbackAnswer = fallbacks[keyword] || "Try asking: 'What is the club?' or 'What teams exist?' or 'Tell me about NDLI'";
    
    res.json({ answer: fallbackAnswer });
  }
});

export default router;
