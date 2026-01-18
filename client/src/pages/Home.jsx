import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import EventCalendar from "../components/EventCalendar";

const Home = () => {
  const [counts, setCounts] = useState({ students: 0, faculty: 0 });

  useEffect(() => {
    api
      .get("/admin/dashboard")
      .then((res) => setCounts(res.data))
      .catch(() => {});
  }, []);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 py-6">
      <section className="grid gap-6 lg:grid-cols-2">
        <div>
          <h1 className="mb-3 text-2xl font-semibold uppercase tracking-[0.25em]">
            Science & Tech Club
          </h1>
          <p className="mb-4 text-sm text-gray-300">
            A **black** and white hub for students and faculty to build real
            projects, explore research, and turn ideas into working prototypes.
          </p>
          <p className="mb-4 text-xs text-gray-400">
            From first-year curiosity to final-year research, the club guides
            you with projects, mentoring, events, and a dedicated developer
            team.
          </p>
          <div className="mb-4 flex gap-4 text-xs">
            <div className="border border-gray-700 px-3 py-2">
              <div className="text-gray-400">Students</div>
              <div className="text-lg font-semibold">{counts.students}</div>
            </div>
            <div className="border border-gray-700 px-3 py-2">
              <div className="text-gray-400">Faculty</div>
              <div className="text-lg font-semibold">{counts.faculty}</div>
            </div>
          </div>
          <a
            href="https://ndl.iitkgp.ac.in/"
            target="_blank"
            rel="noreferrer"
            className="inline-block border border-gray-500 px-4 py-2 text-xs uppercase tracking-wide hover:bg-white hover:text-black"
          >
            Visit NDLI
          </a>
        </div>
        <EventCalendar />
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide">
          Club Teams
        </h2>
        <div className="grid gap-4 text-xs md:grid-cols-4">
          <Link
            to="/committee"
            className="border border-gray-700 p-4 hover:bg-white hover:text-black"
          >
            <h3 className="mb-1 font-semibold">Committee Members</h3>
            <p>Chair, vice chair, secretaries, heads and vice heads of all departments.</p>
          </Link>
          <Link
            to="/executives"
            className="border border-gray-700 p-4 hover:bg-white hover:text-black"
          >
            <h3 className="mb-1 font-semibold">Executives</h3>
            <p>Event execution team for photos, posters, banners, reports, and on‑ground work.</p>
          </Link>
          <Link
            to="/representatives"
            className="border border-gray-700 p-4 hover:bg-white hover:text-black"
          >
            <h3 className="mb-1 font-semibold">Representatives</h3>
            <p>Communication bridge for announcements, permissions, and student/faculty queries.</p>
          </Link>
          <Link
            to="/developers"
            className="border border-gray-700 p-4 hover:bg-white hover:text-black"
          >
            <h3 className="mb-1 font-semibold">Developers</h3>
            <p>Customise club website, integrate Git repo, and build new features.</p>
          </Link>
        </div>
      </section>

      <section>
        <Link
          to="/login"
          className="border border-gray-500 px-6 py-2 text-xs uppercase tracking-[0.3em] hover:bg-white hover:text-black"
        >
          Login
        </Link>
      </section>
    </div>
  );
};

export default Home;
