import { useEffect, useState } from "react";
import api from "../api";
import ChatBox from "../components/ChatBox";

const ExecDashboard = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    api.get("/events").then((res) => setEvents(res.data || []));
  }, []);

  return (
    <div className="space-y-6 text-xs">
      <h1 className="text-sm font-semibold uppercase tracking-[0.2em]">
        Executives Dashboard
      </h1>

      <section className="border border-gray-700 p-3">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide">
          Events
        </h2>
        <p className="mb-2 text-[11px] text-gray-300">
          Executives handle photos, posters, banners, reports and on‑ground work for each event.
        </p>
        <ul className="space-y-1">
          {events.map((e) => (
            <li key={e._id}>
              <span className="font-semibold">{e.title}</span>{" "}
              <span className="text-gray-400">
                ({new Date(e.date).toLocaleDateString()})
              </span>
            </li>
          ))}
          {events.length === 0 && (
            <li className="text-gray-500 text-[11px]">No approved events yet.</li>
          )}
        </ul>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <ChatBox room="exec_common" title="Executives Common Chat" />
        <ChatBox room="exec_admin" title="Executives ↔ Admin Chat" />
      </section>
    </div>
  );
};

export default ExecDashboard;
