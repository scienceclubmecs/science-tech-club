import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import StudentDashboard from "./pages/StudentDashboard";
import FacultyDashboard from "./pages/FacultyDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import CommitteeDashboard from "./pages/CommitteeDashboard";
import ExecDashboard from "./pages/ExecDashboard";
import RepDashboard from "./pages/RepDashboard";
import DeveloperDashboard from "./pages/DeveloperDashboard";
import { useAuth } from "./context/AuthContext";

const RoleRoute = ({ roleCheck, element }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!roleCheck(user)) return <Navigate to="/" replace />;
  return element;
};

const App = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/student"
          element={
            <RoleRoute
              roleCheck={(u) => u.role === "student"}
              element={<StudentDashboard />}
            />
          }
        />
        <Route
          path="/faculty"
          element={
            <RoleRoute
              roleCheck={(u) => u.role === "faculty"}
              element={<FacultyDashboard />}
            />
          }
        />
        <Route
          path="/admin"
          element={
            <RoleRoute
              roleCheck={(u) => u.role === "admin"}
              element={<AdminDashboard />}
            />
          }
        />
        <Route
          path="/committee"
          element={
            <RoleRoute
              roleCheck={(u) =>
                [
                  "committee_chair",
                  "committee_vice_chair",
                  "secretary",
                  "vice_secretary",
                  "executive_head",
                  "representative_head"
                ].includes(u.role)
              }
              element={<CommitteeDashboard />}
            />
          }
        />
        <Route
          path="/executives"
          element={
            <RoleRoute
              roleCheck={(u) => u.isExecutive}
              element={<ExecDashboard />}
            />
          }
        />
        <Route
          path="/representatives"
          element={
            <RoleRoute
              roleCheck={(u) => u.isRepresentative}
              element={<RepDashboard />}
            />
          }
        />
        <Route
          path="/developers"
          element={
            <RoleRoute
              roleCheck={(u) => u.isDeveloper}
              element={<DeveloperDashboard />}
            />
          }
        />
      </Routes>
    </Layout>
  );
};

export default App;
