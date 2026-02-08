import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
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
import ProfilePage from './pages/ProfilePage'
import ChatbotButton from './components/ChatbotButton'
import { ThemeProvider } from './components/ThemeProvider'
import api from './services/api'

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

  const hideNavbar = location.pathname === '/' || location.pathname === '/login'

  return (
    <div className="min-h-screen bg-black">
      {user && !hideNavbar && <Navbar user={user} setUser={setUser} />}
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route 
          path="/login" 
          element={!user ? <Login setUser={setUser} /> : <Navigate to="/dashboard" />} 
        />
        
        <Route 
          path="/dashboard" 
          element={
            user ? (
              user.role === 'admin' ? <Navigate to="/admin" /> :
              user.role === 'faculty' ? <Navigate to="/faculty" /> :
              user.is_committee ? <Navigate to="/committee" /> :
              <StudentDashboard />
            ) : <Navigate to="/login" />
          } 
        />
        
        <Route 
          path="/admin" 
          element={user?.role === 'admin' ? <AdminPanel /> : <Navigate to="/dashboard" />} 
        />
        <Route 
          path="/faculty" 
          element={user?.role === 'faculty' ? <FacultyDashboard /> : <Navigate to="/dashboard" />} 
        />
        <Route 
          path="/committee" 
          element={user?.is_committee ? <CommitteeDashboard /> : <Navigate to="/dashboard" />} 
        />
        <Route 
          path="/committee/team" 
          element={user?.is_committee ? <TeamViewPage /> : <Navigate to="/dashboard" />} 
        />
        
        <Route 
          path="/profile" 
          element={user ? <ProfilePage /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/courses" 
          element={user ? <CoursesPage /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/projects" 
          element={user ? <ProjectsPage /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/projects/create" 
          element={user ? <CreateProjectPage /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/quizzes" 
          element={user ? <QuizzesPage /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/quizzes/:id" 
          element={user ? <TakeQuizPage /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/events" 
          element={user ? <EventsPage /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/events/create" 
          element={user ? <CreateEventPage /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/developer" 
          element={user?.committee_post === 'Developer' ? <DeveloperPanel /> : <Navigate to="/dashboard" />} 
        />
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      
      {user && <ChatbotButton />}
    </div>
  )
}

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  )
}

export default App
