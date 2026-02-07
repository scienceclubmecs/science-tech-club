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
import ProfilePage from './pages/ProfilePage'
import CommitteeDashboard from './pages/CommitteeDashboard'
import ProjectsPage from './pages/ProjectsPage'
import CreateProjectPage from './pages/CreateProjectPage'
import QuizzesPage from './pages/QuizzesPage'
import EventsPage from './pages/EventsPage'
import CreateEventPage from './pages/CreateEventPage'
import TeamViewPage from './pages/TeamViewPage'
import TakeQuizPage from './pages/TakeQuizPage'
import DeveloperPanel from './pages/DeveloperPanel'

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
          <Route path="/profile" element={user ? <ProfilePage /> : <Navigate to="/login" />} />
          <Route path="/committee" element={user?.is_committee ? <CommitteeDashboard /> : <Navigate to="/dashboard" />} />
          <Route path="/projects" element={user ? <ProjectsPage /> : <Navigate to="/login" />} />
          <Route path="/projects/create" element={user ? <CreateProjectPage /> : <Navigate to="/login" />} />
          <Route path="/quizzes" element={user ? <QuizzesPage /> : <Navigate to="/login" />} />
          <Route path="/events" element={user ? <EventsPage /> : <Navigate to="/login" />} />
          <Route path="/events/create" element={user ? <CreateEventPage /> : <Navigate to="/login" />} />
          <Route path="/committee/team" element={user?.is_committee ? <TeamViewPage /> : <Navigate to="/dashboard" />} />
          <Route path="/quizzes/:id" element={user ? <TakeQuizPage /> : <Navigate to="/login" />} />
          <Route path="/developer" element={user?.committee_post === 'Developer' ? <DeveloperPanel /> : <Navigate to="/dashboard" />} />

        </Routes>
        
        <FloatingChatbot />
      </div>
    </Router>
  )
}

export default App
