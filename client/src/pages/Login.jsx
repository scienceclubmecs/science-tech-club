import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const user = await login(username, password);
      if (user.role === "student") navigate("/student");
      else if (user.role === "faculty") navigate("/faculty");
      else if (user.role === "admin") navigate("/admin");
      else if (
        [
          "committee_chair",
          "committee_vice_chair",
          "secretary",
          "vice_secretary",
          "executive_head",
          "representative_head"
        ].includes(user.role)
      )
        navigate("/committee");
      else if (user.isExecutive) navigate("/executives");
      else if (user.isRepresentative) navigate("/representatives");
      else if (user.isDeveloper) navigate("/developers");
      else navigate("/");
    } catch {
      setError("Invalid username or password");
    }
  };

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-4 py-10">
      <h1 className="text-center text-sm font-semibold uppercase tracking-[0.3em]">
        Club Login
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="mb-1 block text-gray-400">Username</label>
          <input
            className="w-full border border-gray-700 bg-bgDark px-2 py-1 outline-none"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />
        </div>
        <div>
          <label className="mb-1 block text-gray-400">Password</label>
          <input
            type="password"
            className="w-full border border-gray-700 bg-bgDark px-2 py-1 outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
        <button
          type="submit"
          className="w-full border border-gray-500 py-2 text-xs uppercase tracking-[0.3em] hover:bg-white hover:text-black"
        >
          Login
        </button>
      </form>
      <p className="text-center text-[10px] text-gray-500">
        Passwords are fixed for security and managed only by admin.
      </p>
    </div>
  );
};

export default Login;
