import express from "express";

const router = express.Router();

const HF_TOKEN = process.env.HF_TOKEN || "";
const CLUB_CONTEXT = `Science & Tech Club: workshops, hackathons, NDLI https://club.ndl.iitkgp.ac.in/club-home, department heads CSE EE ME CE ECE, Committee Chair/Secretary, Executives, Representatives, Developers.`;

router.post("/", async (req, res) => {
  try {
    const { question } = req.body;
    
    if (!question?.trim()) {
      return res.json({ answer: "Hi! Ask about club, roles, NDLI, or events! 🎓" });
    }

    // Try Hugging Face (free, no local models)
    if (HF_TOKEN) {
      try {
        const hfRes = await fetch("https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${HF_TOKEN}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            inputs: `${CLUB_CONTEXT}\nUser: ${question}\nBot:`,
            parameters: { max_length: 100, temperature: 0.7 }
          })
        });

        if (hfRes.ok) {
          const data = await hfRes.json();
          const answer = data[0]?.generated_text || data.generated_text || "";
          if (answer) {
            console.log(`🤖 HF Success: "${question.substring(0,30)}..."`);
            return res.json({ answer: answer.replace(question, "").trim() });
          }
        }
      } catch (hfErr) {
        console.log("HF failed, using fallback");
      }
    }

    // Fallback responses (perfect for your use case)
    const q = question.toLowerCase();
    let answer = "Science & Tech Club: workshops, hackathons, NDLI access, department teams! 🎓";
    
    if (q.includes("club") || q.includes("about")) {
      answer = "Science & Tech Club organizes workshops, hackathons, projects, and provides NDLI access: https://club.ndl.iitkgp.ac.in/club-home 📚";
    } else if (q.includes("role") || q.includes("team") || q.includes("head") || q.includes("committee")) {
      answer = "Teams: Committee (Chair, Secretary), Department Heads (Executive/Representative for CSE, EE, ME, CE, ECE), Executives, Representatives, Developers 👥";
    } else if (q.includes("ndl") || q.includes("library")) {
      answer = "NDLI portal: https://club.ndl.iitkgp.ac.in/club-home - thousands of academic books, journals, resources! 📖";
    } else if (q.includes("event") || q.includes("workshop") || q.includes("hack")) {
      answer = "Events: tech workshops, hackathons, project showcases, seminars, quiz competitions! Check announcements 🎉";
    } else if (/^(hi|hello|hey)/i.test(q)) {
      answer = "Hi! I'm the Science & Tech Club assistant. Ask about roles, events, NDLI, or how to join! 😊";
    } else if (q.includes("join") || q.includes("member")) {
      answer = "Join us: attend orientation sessions, check announcements, contact your department representatives! 🤝";
    } else if (q.includes("project")) {
      answer = "Projects: collaborative research, showcases, GitHub repos, interdepartmental teams. Check with committee! 💻";
    }

    res.json({ answer });
    
  } catch (error) {
    console.error("Chatbot error:", error);
    res.json({ 
      answer: "Science & Tech Club: workshops, projects, NDLI access! Ask about teams or events! 😊" 
    });
  }
});

export default router;
