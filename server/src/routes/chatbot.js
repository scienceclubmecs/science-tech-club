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

    // Try Gemini (stable model names)
    let model;
    const modelNames = ["gemini-pro", "gemini-1.0-pro"];
    
    for (const modelName of modelNames) {
      try {
        model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(`${CLUB_CONTEXT}\n\nQ: ${question}\nA:`);
        const answer = result.response.text().trim();
        
        console.log(`🤖 Gemini SUCCESS (${modelName}): "${question.substring(0,30)}..."`);
        return res.json({ answer });
      } catch (modelError) {
        console.log(`🤖 Model ${modelName} failed:`, modelError.message);
      }
    }

    // Gemini failed → Smart fallback
    throw new Error("All models failed");
    
  } catch (error) {
    console.error("🤖 Chatbot using FALLBACK:", error.message);
    
    // FIXED: Use req.body.question (not undefined 'question')
    const q = (req.body.question || "").toLowerCase();
    
    let answer = "Science & Tech Club: workshops, hackathons, projects, NDLI access! Ask about roles, events, or teams 😊";
    
    if (q.includes("club") || q.includes("about")) {
      answer = "Science & Tech Club organizes workshops, hackathons, projects, and provides NDLI access: https://club.ndl.iitkgp.ac.in/club-home";
    } else if (q.includes("role") || q.includes("team") || q.includes("head") || q.includes("committee")) {
      answer = "Teams: Committee (Chair, Secretary), Department Heads (Executive/Representative for CSE, EE, ME, CE, ECE), Executives, Developers.";
    } else if (q.includes("ndl") || q.includes("library")) {
      answer = "NDLI: https://club.ndl.iitkgp.ac.in/club-home - academic books, journals, resources!";
    } else if (q.includes("event") || q.includes("workshop") || q.includes("hack")) {
      answer = "Events: tech workshops, hackathons, project showcases, seminars. Check announcements!";
    } else if (/^(hi|hello|hey)/i.test(q)) {
      answer = "Hi! I'm the Science & Tech Club assistant. Ask about roles, events, NDLI, or how to join! 😊";
    }

    res.json({ answer });
  }
});

export default router;
