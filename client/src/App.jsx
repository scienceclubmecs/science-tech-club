import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardRouter from './components/DashboardRouter'
import ProfilePage from './pages/ProfilePage'
import ProjectsPage from './pages/ProjectsPage'
import TasksPage from './pages/TasksPage'
import MessagesPage from './pages/MessagesPage'
import AdminDashboard from './pages/AdminDashboard'

// Import all role-specific dashboards
import StudentDashboard from './pages/StudentDashboard'
import ChairDashboard from './pages/ChairDashboard'
import SecretaryDashboard from './pages/SecretaryDashboard'
import ViceChairDashboard from './pages/ViceChairDashboard'
import ViceSecretaryDashboard from './pages/ViceSecretaryDashboard'
import DeptHeadDashboard from './pages/DeptHeadDashboard'
import DeptViceHeadDashboard from './pages/DeptViceHeadDashboard'
import DeveloperDashboard from './pages/DeveloperDashboard'
import ExecutiveDashboard from './pages/ExecutiveDashboard'
import RepresentativeDashboard from './pages/RepresentativeDashboard'

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Protected Dashboard Routes */}
        <Route path="/dashboard" element={<DashboardRouter />} />
        <Route path="/admin" element={<AdminDashboard />} />
        
        {/* Common Protected Routes */}
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/messages/:channelId" element={<MessagesPage />} />
        
        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
