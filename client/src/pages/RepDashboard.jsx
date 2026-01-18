import { useState } from "react";
import ChatBox from "../components/ChatBox";

const RepDashboard = () => {
  const [announcement, setAnnouncement] = useState("");

  const saveAnnouncement = () => {
    // You can later POST this to a dedicated /announcements API.
    console.log("Draft announcement:", announcement);
  };

  return (
    <div className="space-y-6 text-xs">
      <h1 className="text-sm font-semibold uppercase tracking-[0.2em]">
        Representatives Dashboard
      </h1>

      <section className="border border-gray-700 p-3">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide">
          Announcements Draft
        </h2>
        <p className="mb-2 text-[11px] text-gray-300">
          Representatives are the **voice** of the club and prepare announcements and responses to queries.
        </p>
        <textarea
          className="h-32 w-full border border-gray-700 bg-bgDark p-2 text-xs outline-none"
          placeholder="Draft announcement here..."
          value={announcement}
          onChange={(e) => setAnnouncement(e.target.value)}
        />
        <button
          onClick={saveAnnouncement}
          className="mt-2 border border-gray-500 px-3 py-1 text-[10px] uppercase tracking-wide hover:bg-white hover:text-black"
        >
          Save Draft (local)
        </button>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <ChatBox room="rep_common" title="Representatives Common Chat" />
        <ChatBox room="rep_admin" title="Representatives ↔ Admin Chat" />
      </section>
    </div>
  );
};

export default RepDashboard;
