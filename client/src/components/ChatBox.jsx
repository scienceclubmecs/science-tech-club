import { useEffect, useState } from "react";
import api from "../api";

const ChatBox = ({ room, dmUserId, title }) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const isRoom = !!room;

  useEffect(() => {
    const load = async () => {
      try {
        if (isRoom) {
          const res = await api.get(`/chat/room/${room}`);
          setMessages(res.data || []);
        } else if (dmUserId) {
          const res = await api.get(`/chat/dm/${dmUserId}`);
          setMessages(res.data || []);
        }
      } catch {
        setMessages([]);
      }
    };
    load();
  }, [room, dmUserId, isRoom]);

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      let res;
      if (isRoom) {
        res = await api.post(`/chat/room/${room}`, { text });
      } else if (dmUserId) {
        res = await api.post(`/chat/dm/${dmUserId}`, { text });
      } else {
        return;
      }
      setMessages((prev) => [...prev, res.data]);
      setText("");
    } catch {
      // ignore
    }
  };

  return (
    <div className="flex h-64 flex-col border border-gray-700">
      <div className="border-b border-gray-700 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide">
        {title || (isRoom ? room : "Direct Message")}
      </div>
      <div className="flex-1 overflow-y-auto p-2 text-xs">
        {messages.map((m) => (
          <div key={m._id} className="mb-1">
            <span className="font-semibold">{m.from?.username || "me"}: </span>
            <span>{m.text}</span>
          </div>
        ))}
        {messages.length === 0 && (
          <p className="text-[11px] text-gray-500">No messages yet.</p>
        )}
      </div>
      <form onSubmit={send} className="flex border-t border-gray-700">
        <input
          className="flex-1 bg-bgDark px-2 py-1 text-xs outline-none"
          placeholder="Type message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button
          type="submit"
          className="px-3 text-xs uppercase tracking-wide hover:bg-white hover:text-black"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatBox;
