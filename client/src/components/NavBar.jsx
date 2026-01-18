import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import api from "../api";

const NavBar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [config, setConfig] = useState({ site_name: "Science & Tech Club", logo_url: "" });

  useEffect(() => {
    api
      .get("/admin/config")
      .then((res) => setConfig(res.data))
      .catch(() => {});
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="border-b border-gray-700">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          {config.logo_url && (
            <img
              src={config.logo_url}
              alt="logo"
              className="h-8 w-8 object-contain"
            />
          )}
          <span className="font-semibold tracking-wide">
            {config.site_name || "Science & Tech Club"}
          </span>
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link to="/" className="hover:text-accent">
            Home
          </Link>
          {user ? (
            <>
              <span className="text-gray-400">{user.username}</span>
              <button
                onClick={handleLogout}
                className="border border-gray-500 px-3 py-1 text-xs uppercase tracking-wide hover:bg-white hover:text-black"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="border border-gray-500 px-3 py-1 text-xs uppercase tracking-wide hover:bg-white hover:text-black"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default NavBar;
