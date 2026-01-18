import ChatBox from "../components/ChatBox";
import { useAuth } from "../context/AuthContext";

const CommitteeDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6 text-xs">
      <h1 className="text-sm font-semibold uppercase tracking-[0.2em]">
        Committee Dashboard
      </h1>

      <section className="border border-gray-700 p-3">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide">
          Role
        </h2>
        <p className="text-[11px] text-gray-300">
          Logged in as <span className="font-semibold">{user?.username}</span> with committee responsibilities.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <ChatBox room="committee_common" title="Committee Common Chat" />
        <ChatBox room="committee_admin" title="Committee ↔ Admin Chat" />
      </section>
    </div>
  );
};

export default CommitteeDashboard;
