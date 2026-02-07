import express from "express";

const router = express.Router();

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const CLUB_CONTEXT = `You are Science & Tech Club assistant. Club info: workshops, hackathons, NDLI https://club.ndl.iitkgp.ac.in/club-home. Structure: Committee (Chair, Secretary), Department heads (CSE, EE, ME, CE, ECE with Executive/Representative heads), teams (Executives, Representatives, Developers). Answer naturally in 2-3 sentences.`;

async function callGroqAI(question) {
  if (!GROQ_API_KEY) return null;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",  // Free, fast, smart
        messages: [
          { role: "system", content: CLUB_CONTEXT },
          { role: "user", content: question }
        ],
        temperature: 0.7,
        max_tokens: 150
      })
    });

    if (response.ok) {
      const data = await response.json();
      return data.choices[0]?.message?.content;
    }

    console.error("Groq API error:", response.status);
    return null;
  } catch (error) {
    console.error("Groq error:", error.message);
    return null;
  }
}

router.post("/", async (req, res) => {
  try {
    const { question } = req.body;
    
    if (!question?.trim()) {
      return res.json({ answer: "Hi! Ask me about the Science & Tech Club! 🎓" });
    }

    console.log(`🤖 Question: "${question}"`);

    // Try Groq AI
    const aiAnswer = await callGroqAI(question);
    if (aiAnswer) {
      console.log(`✅ Groq AI: "${aiAnswer.substring(0, 60)}..."`);
      return res.json({ answer: aiAnswer });
    }

    // Enhanced fallbacks
    const q = question.toLowerCase();
    let answer;
    
    if (/^(hi|hello|hey)/i.test(q)) {
      answer = "Hi! 👋 I'm your Science & Tech Club assistant. Ask me about teams, events, NDLI, roles, or how to join!";
    } else if (q.includes("club") || q.includes("about")) {
      answer = "Science & Tech Club organizes workshops, hackathons, projects, and provides NDLI access at https://club.ndl.iitkgp.ac.in/club-home 📚";
    } else if (q.includes("role") || q.includes("team")) {
      answer = "Teams: Committee (Chair, Secretary), Department Heads (Executive/Representative for CSE, EE, ME, CE, ECE), Executives, Representatives, Developers 👥";
    } else if (q.includes("ndl") || q.includes("library")) {
      answer = "NDLI: https://club.ndl.iitkgp.ac.in/club-home - thousands of academic resources! 📖";
    } else if (q.includes("event")) {
      answer = "Events: tech workshops, hackathons, project showcases, seminars, competitions! 🎉";
    } else {
      answer = "I can help with: club info, teams, events, NDLI, roles. What would you like to know? 😊";
    }

    console.log(`📝 Fallback: "${answer.substring(0, 50)}..."`);
    res.json({ answer });
    
  } catch (error) {
    console.error("Chatbot error:", error);
    res.json({ answer: "Ask me about Science & Tech Club! 🎓" });
  }
});

export default router;
