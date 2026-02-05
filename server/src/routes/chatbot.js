import express from "express";
import fetch from "node-fetch";  // npm i node-fetch

const router = express.Router();

const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const MODEL = "vosk-model-small-en-us-0.15";

const CLUB_CONTEXT = `Science & Tech Club chatbot. Info: workshops, hackathons, NDLI https://club.ndl.iitkgp.ac.in/club-home, teams: Committee Chair/Secretary, department heads CSE EE ME CE ECE, Executives, Developers.`;

router.post("/", async (req, res) => {
  try {
    const { question } = req.body;
    
    if (!question?.trim()) {
      return res.json({ answer: "Hi! Ask about club, roles, NDLI, events! 🎓" });
    }

    const ollamaResponse = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        prompt: `${CLUB_CONTEXT}\n\nUser: ${question}\nBot:`,
        stream: false,
        options: { temperature: 0.7, num_predict: 100 }
      })
    });

    const data = await ollamaResponse.json();
    const answer = data.response?.trim() || "Science & Tech Club: workshops, projects, NDLI access!";

    console.log(`🤖 Ollama: "${question.substring(0,30)}..." → "${answer.substring(0,50)}..."`);

    res.json({ answer });
    
  } catch (error) {
    console.error("Ollama error:", error);
    res.json({ 
      answer: "Science & Tech Club: workshops, hackathons, NDLI https://club.ndl.iitkgp.ac.in/club-home. Teams: Committee, department heads, developers!" 
    });
  }
});

export default router;
