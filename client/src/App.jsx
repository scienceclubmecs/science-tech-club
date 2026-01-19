import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
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

const RoleRoute = ({ roleCheck, children }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (!roleCheck(user)) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      
      {/* Student */}
      <Route
        path="/student"
        element={
          <RoleRoute roleCheck={(u) => u.role === "student"}>
            <StudentDashboard />
          </RoleRoute>
        }
      />
      
      {/* Faculty */}
      <Route
        path="/faculty"
        element={
          <RoleRoute roleCheck={(u) => u.role === "faculty"}>
            <FacultyDashboard />
          </RoleRoute>
        }
      />
      
      {/* Admin */}
      <Route
        path="/admin"
        element={
          <RoleRoute roleCheck={(u) => u.role === "admin"}>
            <AdminDashboard />
          </RoleRoute>
        }
      />
      
      {/* Committee */}
      <Route
        path="/committee"
        element={
          <RoleRoute 
            roleCheck={(u) => 
              ["committee_chair", "committee_vice_chair", "secretary", "vice_secretary", "executive_head", "representative_head"].includes(u.role)
            }
          >
            <CommitteeDashboard />
          </RoleRoute>
        }
      />
      
      {/* Executives */}
      <RoleRoute
        path="/executives"
        element={
          <RoleRoute roleCheck={(u) => u.isExecutive}>
            <ExecDashboard />
          </RoleRoute>
        }
      />
      
      {/* Representatives */}
      <Route
        path="/representatives"
        element={
          <RoleRoute roleCheck={(u) => u.isRepresentative}>
            <RepDashboard />
          </RoleRoute>
        }
      />
      
      {/* Developers */}
      <Route
        path="/developers"
        element={
          <RoleRoute roleCheck={(u) => u.isDeveloper}>
            <DeveloperDashboard />
          </RoleRoute>
        }
      />
    </Routes>
  );
};

export default App;
