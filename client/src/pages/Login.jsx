import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { auth } from '../services/api'
import { LogIn, Loader, AlertCircle } from 'lucide-react'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data } = await auth.login({ username, password })
      localStorage.setItem('club_token', data.token)
      setAuth(data.user, data.token)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-darker via-dark to-darker p-4">
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-pulse-slow delay-1000"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-block relative">
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-2xl mb-4 flex items-center justify-center transform hover:scale-110 transition-transform duration-200">
              <span className="text-black font-bold text-4xl">S</span>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-2xl blur-xl opacity-50 animate-pulse"></div>
          </div>
          
          <h1 className="text-3xl font-bold gradient-text mb-2">
            Science & Tech Club
          </h1>
          <p className="text-gray-400">Sign in to access your dashboard</p>
        </div>

        {/* Login Card */}
        <div className="card shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm flex items-start space-x-2">
                <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input w-full"
                placeholder="Enter your username"
                required
                autoFocus
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input w-full"
                placeholder="Enter your password"
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center space-x-2 text-base py-3"
            >
              {loading ? (
                <>
                  <Loader className="animate-spin" size={20} />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <LogIn size={20} />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          {/* Additional Links */}
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Forgot your password? Contact admin</p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-600 text-sm mt-8">
          Science & Tech Club © 2026
        </p>
      </div>
    </div>
  )
}
