import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import StudentDashboard from './pages/StudentDashboard'
import FacultyDashboard from './pages/FacultyDashboard'
import AdminPanel from './pages/AdminPanel'
import CommitteeDashboard from './pages/CommitteeDashboard'
import CoursesPage from './pages/CoursesPage'
import ProjectsPage from './pages/ProjectsPage'
import CreateProjectPage from './pages/CreateProjectPage'
import QuizzesPage from './pages/QuizzesPage'
import TakeQuizPage from './pages/TakeQuizPage'
import EventsPage from './pages/EventsPage'
import CreateEventPage from './pages/CreateEventPage'
import TeamViewPage from './pages/TeamViewPage'
import DeveloperPanel from './pages/DeveloperPanel'
import DashboardRouter from './components/DashboardRouter'
import ProfilePage from './pages/ProfilePage'
import ChatbotButton from './components/ChatbotButton'
import { ThemeProvider } from './components/ThemeProvider'
import api from './services/api'
import TasksPage from './pages/TasksPage'
import MessagesPage from './pages/MessagesPage'
import TasksFloatingButton from './components/TasksFloatingButton'
import MyProjectsPage from './pages/MyProjectsPage'


// Import all role-specific dashboards
import ChairDashboard from './pages/ChairDashboard'
import SecretaryDashboard from './pages/SecretaryDashboard'
import ViceChairDashboard from './pages/ViceChairDashboard'
import ViceSecretaryDashboard from './pages/ViceSecretaryDashboard'
import DeptHeadDashboard from './pages/DeptHeadDashboard'
import DeptViceHeadDashboard from './pages/DeptViceHeadDashboard'
import DeveloperDashboard from './pages/DeveloperDashboard'
import ExecutiveDashboard from './pages/ExecutiveDashboard'
import RepresentativeDashboard from './pages/RepresentativeDashboard'

function AppContent() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const location = useLocation()

  useEffect(() => {
    // Check if user is logged in on mount and verify token
    const token = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    
    if (token && storedUser) {
      // Verify token is still valid
      api.get('/auth/verify')
        .then(({ data }) => {
          setUser(data.user)
          localStorage.setItem('user', JSON.stringify(data.user))
        })
        .catch(() => {
          // Token invalid, clear storage
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          setUser(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  const hideNavbar = location.pathname === '/' || location.pathname === '/login' || location.pathname === '/register'

  return (
    <div className="min-h-screen bg-black">
      {user && !hideNavbar && <Navbar user={user} setUser={setUser} />}
      
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Home />} />
        <Route 
          path="/login" 
          element={!user ? <Login setUser={setUser} /> : <Navigate to="/dashboard" />} 
        />
        <Route 
          path="/register" 
          element={!user ? <RegisterPage setUser={setUser} /> : <Navigate to="/dashboard" />} 
        />

        {/* Main Dashboard Route - Role-based routing */}
        <Route 
          path="/dashboard" 
          element={
            user ? (
              user.role === 'admin' ? <Navigate to="/admin" replace /> :
              user.role === 'faculty' ? <Navigate to="/faculty" replace /> :
              user.is_committee ? <DashboardRouter /> :
              <StudentDashboard />
            ) : <Navigate to="/login" replace />
          } 
        />
       
        {/* Admin Routes */}
        <Route 
          path="/admin" 
          element={user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/dashboard" replace />} 
        />

        {/* Faculty Route */}
        <Route 
          path="/faculty" 
          element={user?.role === 'faculty' ? <FacultyDashboard /> : <Navigate to="/dashboard" replace />} 
        />

        {/* Committee Routes */}
        <Route 
          path="/committee" 
          element={user?.is_committee ? <CommitteeDashboard /> : <Navigate to="/dashboard" replace />} 
        />
        <Route 
          path="/committee/team" 
          element={user?.is_committee ? <TeamViewPage /> : <Navigate to="/dashboard" replace />} 
        />

        {/* Developer Panel */}
        <Route 
          path="/developer" 
          element={
            user?.committee_role === 'developer' || user?.committee_post === 'Developer' 
              ? <DeveloperDashboard /> 
              : <Navigate to="/dashboard" replace />
          } 
        />

        {/* Protected Routes */}
        <Route 
          path="/profile" 
          element={user ? <ProfilePage /> : <Navigate to="/login" replace />} 
        />
        
        <Route 
          path="/courses" 
          element={user ? <CoursesPage /> : <Navigate to="/login" replace />} 
        />
        
        <Route 
          path="/projects" 
          element={user ? <ProjectsPage /> : <Navigate to="/login" replace />} 
        />
        
        <Route 
          path="/projects/create" 
          element={user ? <CreateProjectPage /> : <Navigate to="/login" replace />} 
        />

        <Route
          path="/my-projects"
          element={user ? <MyProjectsPage /> : <Navigate to="/login" replace />}
        />
        
        <Route 
          path="/quizzes" 
          element={user ? <QuizzesPage /> : <Navigate to="/login" replace />} 
        />
        
        <Route 
          path="/quizzes/:id" 
          element={user ? <TakeQuizPage /> : <Navigate to="/login" replace />} 
        />
        
        <Route 
          path="/events" 
          element={user ? <EventsPage /> : <Navigate to="/login" replace />} 
        />
        
        <Route 
          path="/events/create" 
          element={user ? <CreateEventPage /> : <Navigate to="/login" replace />} 
        />

        <Route 
          path="/tasks" 
          element={user ? <TasksPage /> : <Navigate to="/login" replace />} 
        />

        <Route 
          path="/messages" 
          element={user ? <MessagesPage /> : <Navigate to="/login" replace />} 
        />
        
        <Route 
          path="/messages/:channelId" 
          element={user ? <MessagesPage /> : <Navigate to="/login" replace />} 
        />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      {user && (
        <>
          <TasksFloatingButton />
          <ChatbotButton />
        </>
      )}
    </div>
  )
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
