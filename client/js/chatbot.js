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

    try {
      const res = await fetch(window.API_BASE + "/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q })
      });
      const data = await res.json();
      addMessage("Guide", data.answer || "Check dashboard sections.");
    } catch (err) {
      addMessage("Guide", "Network issue. Try again.");
    }
  });

  function addMessage(from, text) {
    const div = document.createElement("div");
    div.className = "chatbot-msg";
    div.innerHTML = `<strong>${from}:</strong> ${text}`;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }
});
