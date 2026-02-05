window.API_BASE = "https://science-tech-club-iju0.onrender.com/api";

document.addEventListener("DOMContentLoaded", function () {
  const toggle = document.getElementById("chatbotToggle");
  const close = document.getElementById("chatbotClose");
  const window_el = document.getElementById("chatbotWindow");
  const form = document.getElementById("chatbotForm");
  const input = document.getElementById("chatbotInput");
  const messages = document.getElementById("chatbotMessages");

  if (!toggle || !window_el) return;

  toggle.addEventListener("click", () => {
    window_el.classList.add("active");
  });

  close.addEventListener("click", () => {
    window_el.classList.remove("active");
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const q = input.value.trim();
    if (!q) return;

    addMessage("You", q);
    input.value = "";

    // Show typing indicator
    const typingId = addMessage("Bot", "Typing...", true);

    try {
      const res = await fetch(window.API_BASE + "/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q })
      });
      
      const data = await res.json();
      
      // Remove typing indicator
      const typingMsg = document.getElementById(typingId);
      if (typingMsg) typingMsg.remove();
      
      addMessage("Bot", data.answer || "I'm here to help! Ask me about the club.");
    } catch (err) {
      const typingMsg = document.getElementById(typingId);
      if (typingMsg) typingMsg.remove();
      addMessage("Bot", "Network error. Try: 'Tell me about the club' or 'What teams exist?'");
    }
  });

  function addMessage(from, text, isTyping = false) {
    const div = document.createElement("div");
    const id = `msg-${Date.now()}`;
    div.id = id;
    div.className = "chatbot-msg";
    
    const icon = from === "You" ? "👤" : "🤖";
    const color = from === "You" ? "#fff" : "#7CFF7C";
    
    div.innerHTML = `<strong style="color:${color};">${icon} ${from}:</strong> ${text}`;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
    
    return id;
  }

  // Welcome message
  addMessage("Bot", "Hi! I'm your Club Assistant 🎓 Ask me about projects, teams, events, or the club!");
});
