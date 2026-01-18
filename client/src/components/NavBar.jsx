import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NavBar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate("/");
  };
  return (
    <header className="border-b border-gray-700">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="font-semibold tracking-wide">
          S&T Club
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
