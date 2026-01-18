import { useEffect, useState } from "react";
import api from "../api";

const AdminDashboard = () => {
  const [stats, setStats] = useState({ students: 0, faculty: 0 });
  const [studentsFile, setStudentsFile] = useState(null);
  const [facultyFile, setFacultyFile] = useState(null);

  useEffect(() => {
    api.get("/admin/dashboard").then((res) => setStats(res.data || {}));
  }, []);

  const promoteAll = async () => {
    await api.post("/users/promote");
  };

  const uploadStudents = async (e) => {
    e.preventDefault();
    if (!studentsFile) return;
    const formData = new FormData();
    formData.append("file", studentsFile);
    await api.post("/admin/upload-students", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
  };

  const uploadFaculty = async (e) => {
    e.preventDefault();
    if (!facultyFile) return;
    const formData = new FormData();
    formData.append("file", facultyFile);
    await api.post("/admin/upload-faculty", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
  };

  return (
    <div className="space-y-6 text-xs">
      <h1 className="text-sm font-semibold uppercase tracking-[0.2em]">
        Admin Dashboard
      </h1>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="border border-gray-700 p-3">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide">
            Counts
          </h2>
          <p className="text-[11px] text-gray-300">
            Students: <span className="font-semibold">{stats.students}</span>
          </p>
          <p className="text-[11px] text-gray-300">
            Faculty: <span className="font-semibold">{stats.faculty}</span>
          </p>
        </div>

        <div className="border border-gray-700 p-3">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide">
            Promote Students
          </h2>
          <p className="mb-2 text-[11px] text-gray-300">
            Use this when academic year changes to promote every student to next year.
          </p>
          <button
            onClick={promoteAll}
            className="border border-gray-500 px-3 py-1 text-[10px] uppercase tracking-wide hover:bg-white hover:text-black"
          >
            Promote All Students
          </button>
        </div>

        <div className="border border-gray-700 p-3">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide">
            NDLI & Club Pages
          </h2>
          <a
            href="https://ndl.iitkgp.ac.in/"
            target="_blank"
            rel="noreferrer"
            className="inline-block border border-gray-500 px-3 py-1 text-[10px] uppercase tracking-wide hover:bg-white hover:text-black"
          >
            NDLI
          </a>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <form
          onSubmit={uploadStudents}
          className="border border-gray-700 p-3"
        >
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide">
            Upload Students (CSV)
          </h2>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setStudentsFile(e.target.files?.[0] || null)}
            className="mb-2 text-[11px]"
          />
          <button
            type="submit"
            className="border border-gray-500 px-3 py-1 text-[10px] uppercase tracking-wide hover:bg-white hover:text-black"
          >
            Upload
          </button>
        </form>

        <form
          onSubmit={uploadFaculty}
          className="border border-gray-700 p-3"
        >
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide">
            Upload Faculty (CSV)
          </h2>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setFacultyFile(e.target.files?.[0] || null)}
            className="mb-2 text-[11px]"
          />
          <button
            type="submit"
            className="border border-gray-500 px-3 py-1 text-[10px] uppercase tracking-wide hover:bg-white hover:text-black"
          >
            Upload
          </button>
        </form>
      </section>
    </div>
  );
};

export default AdminDashboard;
