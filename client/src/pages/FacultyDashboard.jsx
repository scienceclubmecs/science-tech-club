import { useEffect, useState } from "react";
import api from "../api";
import { useAuth } from "../context/AuthContext";

const FacultyDashboard = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [quizTitle, setQuizTitle] = useState("");
  const [quizDept, setQuizDept] = useState("");
  const [quizYear, setQuizYear] = useState("");
  const [quizQuestions, setQuizQuestions] = useState("");

  useEffect(() => {
    api.get("/projects").then((res) => setProjects(res.data || []));
  }, []);

  const createQuiz = async () => {
    const questions = quizQuestions
      .split("\n")
      .filter(Boolean)
      .map((q) => ({
        text: q,
        options: ["Option A", "Option B", "Option C", "Option D"],
        correctIndex: 0
      }));
    await api.post("/quizzes", {
      title: quizTitle,
      department: quizDept,
      year: Number(quizYear),
      questions
    });
    setQuizTitle("");
    setQuizDept("");
    setQuizYear("");
    setQuizQuestions("");
  };

  return (
    <div className="space-y-6 text-xs">
      <h1 className="text-sm font-semibold uppercase tracking-[0.2em]">
        Faculty Dashboard
      </h1>

      <section className="border border-gray-700 p-3">
        <p className="text-[11px] text-gray-300">
          Welcome <span className="font-semibold">{user?.username}</span>. Faculty can guide projects and propose quizzes that admin will approve.
        </p>
      </section>

      <section className="border border-gray-700 p-3">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide">
          Active Projects
        </h2>
        <ul className="space-y-1">
          {projects.map((p) => (
            <li key={p._id}>
              <span className="font-semibold">{p.title}</span>{" "}
              <span className="text-gray-400">({p.department})</span>
            </li>
          ))}
          {projects.length === 0 && (
            <li className="text-gray-500">No projects added yet.</li>
          )}
        </ul>
      </section>

      <section className="border border-gray-700 p-3">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide">
          Create Quiz (needs admin approval)
        </h2>
        <div className="grid gap-2 md:grid-cols-3">
          <input
            className="border border-gray-700 bg-bgDark px-2 py-1"
            placeholder="Title"
            value={quizTitle}
            onChange={(e) => setQuizTitle(e.target.value)}
          />
          <input
            className="border border-gray-700 bg-bgDark px-2 py-1"
            placeholder="Department"
            value={quizDept}
            onChange={(e) => setQuizDept(e.target.value)}
          />
          <input
            className="border border-gray-700 bg-bgDark px-2 py-1"
            placeholder="Year"
            value={quizYear}
            onChange={(e) => setQuizYear(e.target.value)}
          />
        </div>
        <textarea
          className="mt-2 h-32 w-full border border-gray-700 bg-bgDark p-2 text-xs outline-none"
          placeholder="Write one question per line"
          value={quizQuestions}
          onChange={(e) => setQuizQuestions(e.target.value)}
        />
        <button
          onClick={createQuiz}
          className="mt-2 border border-gray-500 px-3 py-1 text-[10px] uppercase tracking-wide hover:bg-white hover:text-black"
        >
          Submit Quiz for Approval
        </button>
      </section>
    </div>
  );
};

export default FacultyDashboard;
