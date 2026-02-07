import express from "express";

const router = express.Router();

const HF_TOKEN = process.env.HF_TOKEN;
const CLUB_CONTEXT = `You are a helpful Science & Tech Club assistant. The club organizes:
- Technical workshops and hackathons
- Project collaborations and showcases
- Access to NDLI digital library: https://club.ndl.iitkgp.ac.in/club-home
- Quiz competitions and seminars

Structure:
- Committee: Chair, Vice Chair, Secretary, Vice Secretary
- Departments (CSE, EE, ME, CE, ECE) each have Executive Heads and Representative Heads
- Teams: Executives (events), Representatives (communications), Developers (tech)

Answer questions naturally and concisely in 2-3 sentences.`;

async function callHuggingFace(question) {
  if (!HF_TOKEN) return null;

  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${HF_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inputs: {
            past_user_inputs: [CLUB_CONTEXT],
            generated_responses: ["I understand the club structure."],
            text: question
          },
          options: { wait_for_model: true }
        })
      }
    );

    if (response.ok) {
      const data = await response.json();
      return data.generated_text || data.conversation?.generated_responses?.[0];
    }

    // Model loading - retry with simpler model
    if (response.status === 503) {
      const fallbackResponse = await fetch(
        "https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${HF_TOKEN}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            inputs: `${CLUB_CONTEXT}\n\nUser: ${question}\nAssistant:`,
            parameters: { max_new_tokens: 100, temperature: 0.8 }
          })
        }
      );

      if (fallbackResponse.ok) {
        const fallbackData = await fallbackResponse.json();
        return fallbackData[0]?.generated_text?.split("Assistant:")?.[1]?.trim();
      }
    }

    return null;
  } catch (error) {
    console.error("HF API error:", error.message);
    return null;
  }
}

router.post("/", async (req, res) => {
  try {
    const { question } = req.body;
    
    if (!question?.trim()) {
      return res.json({ answer: "Hi! Ask me about the Science & Tech Club, roles, events, or NDLI! 🎓" });
    }

    console.log(`🤖 Question: "${question}"`);

    // Try AI first
    if (HF_TOKEN) {
      const aiAnswer = await callHuggingFace(question);
      if (aiAnswer && aiAnswer.length > 10) {
        console.log(`✅ AI Response: "${aiAnswer.substring(0, 50)}..."`);
        return res.json({ answer: aiAnswer });
      }
    }

    // Enhanced fallbacks
    const q = question.toLowerCase();
    let answer;
    
    if (/^(hi|hello|hey|sup|greet)/i.test(q)) {
      answer = "Hi! 👋 I'm your Science & Tech Club assistant. I can help you with information about our teams, events, NDLI access, roles, and how to join!";
    } else if (q.includes("club") || q.includes("about") || q.includes("what is")) {
      answer = "Science & Tech Club brings together students and faculty to explore cutting-edge technologies through workshops, hackathons, project showcases, and seminars. We also provide access to the National Digital Library (NDLI) at https://club.ndl.iitkgp.ac.in/club-home 📚";
    } else if (q.includes("role") || q.includes("team") || q.includes("structure") || q.includes("who")) {
      answer = "Our structure includes: Committee leaders (Chair, Vice Chair, Secretary), Department-specific heads for CSE, EE, ME, CE, and ECE (each with Executive Heads and Representative Heads), plus specialized teams for Executives (events), Representatives (communications), and Developers (tech infrastructure) 👥";
    } else if (q.includes("head") || q.includes("executive") || q.includes("representative")) {
      answer = "Each department (Computer Science, Electrical, Mechanical, Civil, ECE) has four leadership positions: Executive Head & Vice Head (handle events, posters, reports) and Representative Head & Vice Head (manage announcements, permissions, queries) 👔";
    } else if (q.includes("committee") || q.includes("chair") || q.includes("secretary")) {
      answer = "The Committee includes the Chair (overall leadership), Vice Chair (assists Chair), Secretary (manages communications), and Vice Secretary (assists Secretary). They oversee all club operations and coordinate with department heads 🎯";
    } else if (q.includes("ndl") || q.includes("library") || q.includes("digital")) {
      answer = "NDLI (National Digital Library of India) portal at https://club.ndl.iitkgp.ac.in/club-home provides access to thousands of academic books, journals, research papers, and educational resources for club members! 📖✨";
    } else if (q.includes("event") || q.includes("workshop") || q.includes("activity")) {
      answer = "We organize weekly tech workshops, monthly hackathons with prizes, semester project showcases, industry expert talks, inter-department competitions, and curriculum-based quiz events! Check our announcements for upcoming events 🎉";
    } else if (q.includes("hackathon") || q.includes("competition")) {
      answer = "Our hackathons feature coding challenges, innovation competitions, team collaborations, and exciting prizes! We host both internal and inter-college hackathons. Join our events channel for announcements! 💻🏆";
    } else if (q.includes("join") || q.includes("member") || q.includes("how to")) {
      answer = "To join: Attend our orientation sessions, check announcements on the homepage, contact Representatives in your department, or reach out to committee members. Follow us for event updates! 🤝";
    } else if (q.includes("project") || q.includes("research")) {
      answer = "We support collaborative projects across departments, provide GitHub repositories, organize showcase events, and connect students with faculty mentors. Contact your department's Executive Head to propose projects! 💡";
    } else if (q.includes("department") || q.includes("cse") || q.includes("ece") || q.includes("electrical") || q.includes("mechanical") || q.includes("civil")) {
      answer = "We have 5 departments: Computer Science, Electrical Engineering, Mechanical Engineering, Civil Engineering, and Electronics & Communication (ECE). Each has dedicated Executive and Representative heads to support students! 🏛️";
    } else if (q.includes("developer") || q.includes("website") || q.includes("tech")) {
      answer = "Our Developers team builds and maintains the club website, manages technical infrastructure, creates tools for members, and handles backend systems. Interested? Contact the committee! 👨‍💻";
    } else {
      answer = "I can help you with: Club information, Team structure & roles, Events & workshops, NDLI library access, How to join, Projects & research, Department details. What would you like to know? 😊";
    }

    console.log(`📝 Fallback used: "${answer.substring(0, 50)}..."`);
    res.json({ answer });
    
  } catch (error) {
    console.error("Chatbot error:", error);
    res.json({ 
      answer: "I'm here to help with Science & Tech Club questions! Try asking about our teams, events, NDLI access, or how to join! 🎓" 
    });
  }
});

export default router;
