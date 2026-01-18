import { useEffect, useState } from "react";
import api from "../api";

const EventCalendar = () => {
  const [events, setEvents] = useState([]);
  useEffect(() => {
    api.get("/events").then((res) => setEvents(res.data || []));
  }, []);
  return (
    <div className="border border-gray-700 p-4">
      <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide">
        Events Calendar
      </h3>
      <ul className="space-y-2 text-xs">
        {events.map((e) => (
          <li key={e._id} className="flex justify-between">
            <span>{e.title}</span>
            <span className="text-gray-400">
              {new Date(e.date).toLocaleDateString()}
            </span>
          </li>
        ))}
        {events.length === 0 && (
          <li className="text-gray-500">No events yet.</li>
        )}
      </ul>
    </div>
  );
};

export default EventCalendar;
