import { useState } from "react";
import api from "../api";

const GuideChatbot = () => {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([
    {
      from: "bot",
      text: "Hi! I am your club guide. Ask me about projects, quizzes, chats, or navigation."
    }
  ]);

  const ask = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;
    const q = question.trim();
    setMessages((m) => [...m, { from: "you", text: q }]);
    setQuestion("");
    try {
      const { data } = await api.post("/chatbot", { question: q });
      setMessages((m) => [...m, { from: "bot", text: data.answer }]);
    } catch {
      setMessages((m) => [
        ...m,
        { from: "bot", text: "Sorry, something went wrong. Try again." }
      ]);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 text-xs">
      {open ? (
        <div className="w-64 rounded border border-gray-700 bg-bgDark shadow-lg">
          <div className="flex items-center justify-between border-b border-gray-700 px-2 py-1">
            <span className="text-[11px] font-semibold uppercase tracking-wide">
              Club Guide
            </span>
            <button
              className="text-[11px] text-gray-400"
              onClick={() => setOpen(false)}
            >
              ×
            </button>
          </div>
          <div className="h-48 overflow-y-auto px-2 py-1">
            {messages.map((m, i) => (
              <div key={i} className="mb-1">
                <span className="font-semibold">
                  {m.from === "bot" ? "Guide: " : "You: "}
                </span>
                <span>{m.text}</span>
              </div>
            ))}
          </div>
          <form onSubmit={ask} className="flex border-t border-gray-700">
            <input
              className="flex-1 bg-bgDark px-2 py-1 text-[11px] outline-none"
              placeholder="Ask a question..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
            <button
              type="submit"
              className="px-2 text-[11px] uppercase tracking-wide hover:bg-white hover:text-black"
            >
              Go
            </button>
          </form>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="rounded-full border border-gray-500 px-4 py-2 text-[11px] uppercase tracking-wide hover:bg-white hover:text-black"
        >
          Help
        </button>
      )}
    </div>
  );
};

export default GuideChatbot;
