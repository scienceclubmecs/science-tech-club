import { useEffect, useState } from "react";
import api from "../api";

const DeveloperDashboard = () => {
  const [gitRepoUrl, setGitRepoUrl] = useState("");
  const [theme, setTheme] = useState({ primary: "#ffffff", background: "#000000" });

  useEffect(() => {
    api
      .get("/admin/config")
      .then((res) => {
        if (res.data.gitRepoUrl) setGitRepoUrl(res.data.gitRepoUrl);
        if (res.data.theme) setTheme(res.data.theme);
      })
      .catch(() => {});
  }, []);

  const saveConfig = async () => {
    await api.post("/admin/config", { gitRepoUrl, theme });
  };

  return (
    <div className="space-y-6 text-xs">
      <h1 className="text-sm font-semibold uppercase tracking-[0.2em]">
        Developers Dashboard
      </h1>

      <section className="border border-gray-700 p-3">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide">
          Git Repository
        </h2>
        <p className="mb-2 text-[11px] text-gray-300">
          Configure the **repo** where this club portal is maintained so future students can contribute easily.
        </p>
        <input
          className="mb-2 w-full border border-gray-700 bg-bgDark px-2 py-1"
          placeholder="https://github.com/your-org/club-portal"
          value={gitRepoUrl}
          onChange={(e) => setGitRepoUrl(e.target.value)}
        />
      </section>

      <section className="border border-gray-700 p-3">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide">
          Theme
        </h2>
        <div className="mb-2 grid gap-2 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-[11px] text-gray-400">
              Primary Color
            </label>
            <input
              type="color"
              value={theme.primary}
              onChange={(e) =>
                setTheme((t) => ({ ...t, primary: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] text-gray-400">
              Background Color
            </label>
            <input
              type="color"
              value={theme.background}
              onChange={(e) =>
                setTheme((t) => ({ ...t, background: e.target.value }))
              }
            />
          </div>
        </div>
        <button
          onClick={saveConfig}
          className="border border-gray-500 px-3 py-1 text-[10px] uppercase tracking-wide hover:bg-white hover:text-black"
        >
          Save Config
        </button>
      </section>
    </div>
  );
};

export default DeveloperDashboard;
