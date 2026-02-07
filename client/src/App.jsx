import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Courses from './pages/Courses'
import CourseView from './pages/CourseView'
import Chat from './pages/Chat'
import AdminPanel from './pages/AdminPanel'

function PrivateRoute({ children, adminOnly = false, committeeOnly = false }) {
  const { user } = useAuthStore()
  
  if (!user) return <Navigate to="/login" replace />
  
  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/" replace />
  }
  
  if (committeeOnly && !['admin', 'committee_chair', 'committee_vice_chair', 'secretary', 'vice_secretary'].includes(user.role) && !user.is_committee) {
    return <Navigate to="/" replace />
  }
  
  return children
}

export default function App() {
  const { user } = useAuthStore()

  return (
    <BrowserRouter>
      {user && <Navbar />}
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/login" 
          element={user ? <Navigate to="/" replace /> : <Login />} 
        />
        
        {/* Protected Routes */}
        <Route path="/" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />
        
        <Route path="/courses" element={
          <PrivateRoute>
            <Courses />
          </PrivateRoute>
        } />
        
        <Route path="/courses/:id" element={
          <PrivateRoute>
            <CourseView />
          </PrivateRoute>
        } />
        
        <Route path="/chat" element={
          <PrivateRoute>
            <Chat />
          </PrivateRoute>
        } />
        
        <Route path="/admin" element={
          <PrivateRoute adminOnly>
            <AdminPanel />
          </PrivateRoute>
        } />
        
        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
