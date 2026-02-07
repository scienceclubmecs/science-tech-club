import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { Home, BookOpen, MessageSquare, Shield, LogOut, Menu, X, User } from 'lucide-react'
import { useState } from 'react'

export default function Navbar() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const links = [
    { to: '/', label: 'Dashboard', icon: Home },
    { to: '/courses', label: 'Courses', icon: BookOpen },
    { to: '/chat', label: 'Chat', icon: MessageSquare },
  ]

  if (user?.role === 'admin') {
    links.push({ to: '/admin', label: 'Admin', icon: Shield })
  }

  const isActive = (path) => location.pathname === path

  return (
    <nav className="bg-dark/95 border-b border-border sticky top-0 z-50 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-200">
              <span className="text-black font-bold text-xl">S</span>
            </div>
            <span className="hidden sm:block font-bold text-lg gradient-text">
              Science & Tech Club
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {links.map((link) => {
              const Icon = link.icon
              const active = isActive(link.to)
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    active
                      ? 'bg-primary/10 text-primary border border-primary/20'
                      : 'text-gray-400 hover:text-gray-100 hover:bg-dark-card'
                  }`}
                >
                  <Icon size={18} />
                  <span>{link.label}</span>
                </Link>
              )
            })}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {/* User Info */}
            <div className="hidden sm:flex items-center space-x-3 px-3 py-2 bg-dark-card border border-border rounded-lg">
              <div className="w-9 h-9 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                <span className="text-black font-semibold">
                  {user?.username?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-100">
                  {user?.username}
                </span>
                <span className="text-xs text-gray-500 capitalize">
                  {user?.role?.replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="hidden md:flex items-center space-x-2 px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-all duration-200"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-gray-400 hover:text-gray-100 hover:bg-dark-card rounded-lg transition-all"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 border-t border-border mt-2 pt-4 animate-in slide-in-from-top duration-200">
            {/* User Info Mobile */}
            <div className="flex items-center space-x-3 px-4 py-3 mb-3 bg-dark-card rounded-lg">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                <span className="text-black font-semibold">
                  {user?.username?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold">{user?.username}</span>
                <span className="text-xs text-gray-500 capitalize">
                  {user?.role?.replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* Mobile Links */}
            <div className="flex flex-col space-y-1">
              {links.map((link) => {
                const Icon = link.icon
                const active = isActive(link.to)
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all ${
                      active
                        ? 'bg-primary/10 text-primary border border-primary/20'
                        : 'text-gray-400 hover:text-gray-100 hover:bg-dark-card'
                    }`}
                  >
                    <Icon size={20} />
                    <span>{link.label}</span>
                  </Link>
                )
              })}

              {/* Logout Mobile */}
              <button
                onClick={() => {
                  handleLogout()
                  setMobileOpen(false)
                }}
                className="flex items-center space-x-3 px-4 py-3 text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
              >
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
