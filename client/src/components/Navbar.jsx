import { Link, useNavigate } from 'react-router-dom'
import { LogOut, User, Home, BookOpen, Award, Calendar, Users } from 'lucide-react'

export default function Navbar({ user, setUser }) {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    navigate('/login')
  }

  return (
    <nav className="bg-black/90 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link to="/dashboard" className="flex items-center gap-3">
            <img 
              src="https://via.placeholder.com/40x40/3b82f6/ffffff?text=LOGO" 
              alt="Club Logo" 
              className="w-10 h-10 rounded-lg"
            />
            <div>
              <div className="text-lg font-bold text-white">Science & Tech Club</div>
              <div className="text-xs text-gray-500">MECS</div>
            </div>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-white transition">
              <Home className="w-4 h-4" />
              Dashboard
            </Link>
            <Link to="/courses" className="flex items-center gap-2 text-gray-400 hover:text-white transition">
              <BookOpen className="w-4 h-4" />
              Courses
            </Link>
            <Link to="/projects" className="flex items-center gap-2 text-gray-400 hover:text-white transition">
              <Award className="w-4 h-4" />
              Projects
            </Link>
            <Link to="/events" className="flex items-center gap-2 text-gray-400 hover:text-white transition">
              <Calendar className="w-4 h-4" />
              Events
            </Link>
            {user?.is_committee && (
              <Link to="/committee/team" className="flex items-center gap-2 text-gray-400 hover:text-white transition">
                <Users className="w-4 h-4" />
                Team
              </Link>
            )}
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            <Link to="/profile" className="flex items-center gap-2 text-gray-400 hover:text-white transition">
              <User className="w-4 h-4" />
              <span className="hidden md:inline">{user?.username}</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
