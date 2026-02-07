import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import Home from './pages/Home'
import Login from './pages/Login'
import StudentDashboard from './pages/StudentDashboard'
import FacultyDashboard from './pages/FacultyDashboard'
import AdminPanel from './pages/AdminPanel'
import Courses from './pages/Courses'
import CourseView from './pages/CourseView'
import Chat from './pages/Chat'
import Navbar from './components/Navbar'
import FloatingChatbot from './components/FloatingChatbot'

function App() {
  const { user } = useAuthStore()

  const getDashboard = () => {
    if (!user) return <Navigate to="/login" />
    
    if (user.role === 'admin') return <Navigate to="/admin" />
    if (user.role === 'faculty') return <FacultyDashboard />
    return <StudentDashboard />
  }

  return (
    <Router>
      <div className="min-h-screen bg-black">
        {user && <Navbar />}
        <Routes>
          <Route path="/" element={!user ? <Home /> : getDashboard()} />
          <Route path="/login" element={!user ? <Login /> : getDashboard()} />
          <Route path="/dashboard" element={getDashboard()} />
          <Route path="/courses" element={user ? <Courses /> : <Navigate to="/login" />} />
          <Route path="/courses/:id" element={user ? <CourseView /> : <Navigate to="/login" />} />
          <Route path="/chat" element={user ? <Chat /> : <Navigate to="/login" />} />
          <Route path="/admin" element={user?.role === 'admin' ? <AdminPanel /> : <Navigate to="/dashboard" />} />
        </Routes>
        
        <FloatingChatbot />
      </div>
    </Router>
  )
}

export default App
