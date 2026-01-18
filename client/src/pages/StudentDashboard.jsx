import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api";
import ChatBox from "../components/ChatBox";

const StudentDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(user?.profile || {});
  const [projects, setProjects] = useState([]);
  const [allProjects, setAllProjects] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [selectedProjectChat, setSelectedProjectChat] = useState(null);
  const [chairId, setChairId] = useState(null);

  useEffect(() => {
    api.get("/projects/mine").then((res) => setProjects(res.data || []));
    api.get("/projects").then((res) => setAllProjects(res.data || []));
    if (user?.profile?.department && user?.profile?.year) {
      api
        .get("/quizzes", {
          params: {
            department: user.profile.department,
            year: user.profile.year
          }
        })
        .then((res) => setQuizzes(res.data || []));
    }
    api
      .get("/users/chair")
      .then((res) => setChairId(res.data._id))
      .catch(() => {});
  }, [user]);

  const saveProfile = async () => {
    const { data } = await api.put("/users/me", profile);
    setProfile(data.profile);
  };

  const joinProject = async (id) => {
    await api.post(`/projects/${id}/join`);
    const mine = await api.get("/projects/mine");
    setProjects(mine.data || []);
  };

  const vacantProjects = allProjects.filter(
    (p) => p.members.length < p.maxMembers
  );

  return (
    <div className="space-y-6 text-xs">
      <div className="flex items-center justify-between">
        <h1 className="text-sm font-semibold uppercase tracking-[0.2em]">
          Student Dashboard
        </h1>
        <a
          href="https://ndl.iitkgp.ac.in/"
          target="_blank"
          rel="noreferrer"
          className="border border-gray-500 px-3 py-1 text-[10px] uppercase tracking-wide hover:bg-white hover:text-black"
        >
          NDLI
        </a>
      </div>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="border border-gray-700 p-3">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide">
            Profile
          </h2>
          <div className="space-y-2">
            <div>
              <label className="block text-[11px] text-gray-400">
                Department
              </label>
              <input
                className="w-full border border-gray-700 bg-bgDark px-2 py-1"
                value={profile.department || ""}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, department: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="block text-[11px] text-gray-400">
                Interests (comma separated)
              </label>
              <input
                className="w-full border border-gray-700 bg-bgDark px-2 py-1"
                value={(profile.interests || []).join(", ")}
                onChange={(e) =>
                  setProfile((p) => ({
                    ...p,
                    interests: e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean)
                  }))
                }
              />
            </div>
            <div>
              <label className="block text-[11px] text-gray-400">
                Profile Photo URL
              </label>
              <input
                className="w-full border border-gray-700 bg-bgDark px-2 py-1"
                value={profile.photoUrl || ""}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, photoUrl: e.target.value }))
                }
              />
            </div>
            <button
              onClick={saveProfile}
              className="mt-2 border border-gray-500 px-3 py-1 text-[10px] uppercase tracking-wide hover:bg-white hover:text-black"
            >
              Save
            </button>
          </div>
        </div>

        <div className="border border-gray-700 p-3">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide">
            Announcements
          </h2>
          <p className="text-[11px] text-gray-300">
            Watch this space for new project calls, quizzes, and research
            opportunities curated by the club.
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="border border-gray-700 p-3">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide">
            My Projects
          </h2>
          <ul className="space-y-1">
            {projects.map((p) => (
              <li key={p._id}>
                <span className="font-semibold">{p.title}</span>{" "}
                <span className="text-gray-400">({p.department})</span>
              </li>
            ))}
            {projects.length === 0 && (
              <li className="text-gray-500">
                No projects yet. Create your first idea and invite your friends.
              </li>
            )}
          </ul>
        </div>

        <div className="border border-gray-700 p-3">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide">
            Join Projects
          </h2>
          <ul className="space-y-1">
            {vacantProjects.map((p) => (
              <li key={p._id} className="flex items-center justify-between">
                <div>
                  <span className="font-semibold">{p.title}</span>{" "}
                  <span className="text-gray-400">
                    ({p.members.length}/{p.maxMembers})
                  </span>
                </div>
                <button
                  onClick={() => joinProject(p._id)}
                  className="border border-gray-500 px-2 py-1 text-[10px] uppercase hover:bg-white hover:text-black"
                >
                  Join
                </button>
              </li>
            ))}
            {vacantProjects.length === 0 && (
              <li className="text-gray-500">No vacancies right now.</li>
            )}
          </ul>
        </div>
      </section>

      <section className="border border-gray-700 p-3">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide">
          Quizzes
        </h2>
        <p className="mb-2 text-[11px] text-gray-300">
          Short **quizzes** generated from your syllabus to keep you exploring beyond exams.
        </p>
        <ul className="space-y-1">
          {quizzes.map((q) => (
            <li key={q._id}>{q.title}</li>
          ))}
          {quizzes.length === 0 && (
            <li className="text-gray-500">
              No quizzes yet. Ask your faculty or admin to publish one.
            </li>
          )}
        </ul>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="border border-gray-700 p-3">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide">
            Project Chats
          </h2>
          <p className="mb-2 text-[11px] text-gray-300">
            Each active project has an auto‑created chat room for coordination.
          </p>
          <ul className="space-y-1">
            {projects.map((p) => (
              <li key={p._id}>
                <button
                  onClick={() => setSelectedProjectChat(`proj:${p._id}`)}
                  className="w-full text-left text-[11px] underline-offset-2 hover:underline"
                >
                  {p.title}
                </button>
              </li>
            ))}
            {projects.length === 0 && (
              <li className="text-gray-500 text-[11px]">
                Join or create a project to unlock group chat.
              </li>
            )}
          </ul>
        </div>

        <div className="md:col-span-2">
          {selectedProjectChat ? (
            <ChatBox room={selectedProjectChat} title="Project Group Chat" />
          ) : (
            <div className="flex h-64 items-center justify-center border border-dashed border-gray-700 text-[11px] text-gray-500">
              Select a project to open its chat.
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <ChatBox room="student_committee" title="Student ↔ Committee Chat" />
        {chairId ? (
          <ChatBox dmUserId={chairId} title="Student ↔ Chair DM" />
        ) : (
          <div className="flex h-64 items-center justify-center border border-gray-700 text-[11px] text-gray-500">
            Chair not configured yet.
          </div>
        )}
      </section>
    </div>
  );
};

export default StudentDashboard;
