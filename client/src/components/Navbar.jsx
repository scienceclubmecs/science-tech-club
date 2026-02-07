import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { Home, BookOpen, MessageCircle, Settings, LogOut } from 'lucide-react'

export default function Navbar() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isActive = (path) => location.pathname === path

  return (
    <nav className="bg-slate-800 border-b border-slate-700">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/dashboard" className="text-xl font-bold text-blue-400">
              Science & Tech Club
            </Link>
            
            <div className="hidden md:flex space-x-4">
              <Link
                to="/dashboard"
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition ${
                  isActive('/dashboard') ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-slate-700'
                }`}
              >
                <Home className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
              
              <Link
                to="/courses"
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition ${
                  isActive('/courses') ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-slate-700'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Courses</span>
              </Link>
              
              <Link
                to="/chat"
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition ${
                  isActive('/chat') ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-slate-700'
                }`}
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat</span>
              </Link>
              
              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition ${
                    isActive('/admin') ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-slate-700'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  <span>Admin</span>
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-300">
              {user?.username} ({user?.role})
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
