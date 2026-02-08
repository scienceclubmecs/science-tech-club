import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  User, Award, BookOpen, Bell, ExternalLink, TrendingUp, Target,
  Code, MessageSquare, Calendar, ArrowRight
} from 'lucide-react'
import Loading from '../components/Loading'
import TasksFloatingButton from '../components/TasksFloatingButton'
import MessagesFloatingButton from '../components/MessagesFloatingButton'
import api from '../services/api'

export default function StudentDashboard() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [profileRes, announcementsRes] = await Promise.all([
        api.get('/users/profile'),
        api.get('/announcements')
      ])
      
      setProfile(profileRes.data)
      setAnnouncements(announcementsRes.data.slice(0, 5))
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Loading />

  return (
    <div className="min-h-screen bg-black text-white pt-20 px-4 pb-12">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Welcome back, {profile?.username}! 👋
          </h1>
          <p className="text-gray-400 text-lg">
            {profile?.department} • Year {profile?.year}
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <button
                onClick={() => navigate('/profile')}
                className="group bg-gradient-to-br from-blue-900 to-blue-950 hover:from-blue-800 hover:to-blue-900 border border-blue-800 rounded-xl p-6 transition-all"
              >
                <User className="w-8 h-8 text-blue-400 mb-3 group-hover:scale-110 transition" />
                <h3 className="font-semibold text-white mb-1">Profile</h3>
                <p className="text-xs text-blue-300">View & Edit</p>
              </button>

              <button
                onClick={() => navigate('/messages')}
                className="group bg-gradient-to-br from-purple-900 to-purple-950 hover:from-purple-800 hover:to-purple-900 border border-purple-800 rounded-xl p-6 transition-all"
              >
                <MessageSquare className="w-8 h-8 text-purple-400 mb-3 group-hover:scale-110 transition" />
                <h3 className="font-semibold text-white mb-1">Messages</h3>
                <p className="text-xs text-purple-300">Chat & DMs</p>
              </button>

              <button
                onClick={() => navigate('/projects')}
                className="group bg-gradient-to-br from-pink-900 to-pink-950 hover:from-pink-800 hover:to-pink-900 border border-pink-800 rounded-xl p-6 transition-all"
              >
                <Code className="w-8 h-8 text-pink-400 mb-3 group-hover:scale-110 transition" />
                <h3 className="font-semibold text-white mb-1">Projects</h3>
                <p className="text-xs text-pink-300">Join & Create</p>
              </button>

              <button
                onClick={() => navigate('/courses')}
                className="group bg-gradient-to-br from-green-900 to-green-950 hover:from-green-800 hover:to-green-900 border border-green-800 rounded-xl p-6 transition-all"
              >
                <BookOpen className="w-8 h-8 text-green-400 mb-3 group-hover:scale-110 transition" />
                <h3 className="font-semibold text-white mb-1">Courses</h3>
                <p className="text-xs text-green-300">Learn</p>
              </button>

              <button
                onClick={() => navigate('/events')}
                className="group bg-gradient-to-br from-orange-900 to-orange-950 hover:from-orange-800 hover:to-orange-900 border border-orange-800 rounded-xl p-6 transition-all"
              >
                <Calendar className="w-8 h-8 text-orange-400 mb-3 group-hover:scale-110 transition" />
                <h3 className="font-semibold text-white mb-1">Events</h3>
                <p className="text-xs text-orange-300">Upcoming</p>
              </button>

              <a
                href="https://club.ndl.iitkgp.ac.in"
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-gradient-to-br from-cyan-900 to-cyan-950 hover:from-cyan-800 hover:to-cyan-900 border border-cyan-800 rounded-xl p-6 transition-all"
              >
                <ExternalLink className="w-8 h-8 text-cyan-400 mb-3 group-hover:scale-110 transition" />
                <h3 className="font-semibold text-white mb-1">NDLI</h3>
                <p className="text-xs text-cyan-300">Resources</p>
              </a>
            </div>

            {/* Research Section */}
            <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border border-indigo-700/50 rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-3 flex items-center gap-2">
                🔬 Get into Research!
              </h2>
              <p className="text-indigo-100 mb-4">
                Join ongoing research projects, publish papers, and collaborate with faculty on cutting-edge technology.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => navigate('/research')}
                  className="bg-white text-indigo-900 px-6 py-2 rounded-lg font-medium hover:bg-indigo-50 transition"
                >
                  Explore Research
                </button>
                <a
                  href="https://scholar.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-indigo-800 px-6 py-2 rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
                >
                  Google Scholar
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Right Column - Announcements */}
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Bell className="w-5 h-5 text-blue-400" />
                <h2 className="text-xl font-bold">Announcements</h2>
              </div>
              
              {announcements.length === 0 ? (
                <p className="text-gray-500 text-sm">No announcements yet.</p>
              ) : (
                <div className="space-y-3">
                  {announcements.map(announcement => (
                    <div key={announcement.id} className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition">
                      <h3 className="font-semibold text-sm mb-2">{announcement.title}</h3>
                      <p className="text-xs text-gray-400 line-clamp-2">{announcement.content}</p>
                      <span className="text-xs text-gray-600 mt-2 block">
                        {new Date(announcement.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Profile Completion */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4">Profile Status</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Basic Info</span>
                  <span className="text-green-400">✓</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Profile Photo</span>
                  <span className={profile?.profile_photo_url ? "text-green-400" : "text-yellow-400"}>
                    {profile?.profile_photo_url ? "✓" : "○"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Interests</span>
                  <span className={profile?.interests?.length > 0 ? "text-green-400" : "text-yellow-400"}>
                    {profile?.interests?.length > 0 ? "✓" : "○"}
                  </span>
                </div>
              </div>
              <button
                onClick={() => navigate('/profile')}
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700 py-2 rounded-lg text-sm transition flex items-center justify-center gap-2"
              >
                Update Profile
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Buttons - Messages above Tasks */}
      <MessagesFloatingButton />
      <TasksFloatingButton />
    </div>
  )
}
