import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { 
  User, Award, BookOpen, Bell, ExternalLink, TrendingUp, Target
} from 'lucide-react'
import Loading from '../components/Loading'

export default function StudentDashboard() {
  const [profile, setProfile] = useState(null)
  const [announcements, setAnnouncements] = useState([])
  const [myProjects, setMyProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [profileRes, announcementsRes, projectsRes] = await Promise.all([
        api.get('/users/me'),
        api.get('/announcements'),
        api.get('/projects/my')
      ])
      
      setProfile(profileRes.data)
      setAnnouncements(announcementsRes.data.slice(0, 5))
      setMyProjects(projectsRes.data)
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Loading />

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {profile?.username}! 👋
          </h1>
          <p className="text-gray-400">
            {profile?.department} • Year {profile?.year}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-xl">
            <Award className="w-8 h-8 mb-4" />
            <h3 className="text-2xl font-bold">{myProjects.length}</h3>
            <p className="text-blue-100">My Projects</p>
          </div>

          <div className="bg-gradient-to-br from-green-600 to-green-800 p-6 rounded-xl">
            <BookOpen className="w-8 h-8 mb-4" />
            <h3 className="text-2xl font-bold">0</h3>
            <p className="text-green-100">Courses Completed</p>
          </div>

          <div className="bg-gradient-to-br from-purple-600 to-purple-800 p-6 rounded-xl">
            <Target className="w-8 h-8 mb-4" />
            <h3 className="text-2xl font-bold">0</h3>
            <p className="text-purple-100">Quizzes Taken</p>
          </div>

          <div className="bg-gradient-to-br from-orange-600 to-orange-800 p-6 rounded-xl">
            <TrendingUp className="w-8 h-8 mb-4" />
            <h3 className="text-2xl font-bold">0</h3>
            <p className="text-orange-100">Points Earned</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Quick Actions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Link
                  to="/profile"
                  className="flex flex-col items-center gap-3 p-4 bg-gray-800 hover:bg-gray-750 rounded-lg transition"
                >
                  <User className="w-8 h-8 text-blue-400" />
                  <span className="text-sm text-center">View/Edit Profile</span>
                </Link>

                <Link
                  to="/projects"
                  className="flex flex-col items-center gap-3 p-4 bg-gray-800 hover:bg-gray-750 rounded-lg transition"
                >
                  <Award className="w-8 h-8 text-purple-400" />
                  <span className="text-sm text-center">My Projects</span>
                </Link>

                <Link
                  to="/projects/browse"
                  className="flex flex-col items-center gap-3 p-4 bg-gray-800 hover:bg-gray-750 rounded-lg transition"
                >
                  <Target className="w-8 h-8 text-green-400" />
                  <span className="text-sm text-center">Join Projects</span>
                </Link>

                <Link
                  to="/quizzes"
                  className="flex flex-col items-center gap-3 p-4 bg-gray-800 hover:bg-gray-750 rounded-lg transition"
                >
                  <BookOpen className="w-8 h-8 text-yellow-400" />
                  <span className="text-sm text-center">Take Quiz</span>
                </Link>

                <Link
                  to="/courses"
                  className="flex flex-col items-center gap-3 p-4 bg-gray-800 hover:bg-gray-750 rounded-lg transition"
                >
                  <BookOpen className="w-8 h-8 text-cyan-400" />
                  <span className="text-sm text-center">Browse Courses</span>
                </Link>

                <a
                  href="https://ndl.iitkgp.ac.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-3 p-4 bg-gradient-to-br from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 rounded-lg transition"
                >
                  <ExternalLink className="w-8 h-8" />
                  <span className="text-sm text-center">Visit NDLI</span>
                </a>
              </div>
            </div>

            {/* My Projects */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">My Projects</h2>
                <Link to="/projects/create" className="text-blue-400 hover:text-blue-300 text-sm">
                  + Create New
                </Link>
              </div>
              
              {myProjects.length === 0 ? (
                <div className="text-center py-8">
                  <Award className="w-16 h-16 mx-auto mb-4 text-gray-700" />
                  <p className="text-gray-500 mb-4">No projects yet. Start your first project!</p>
                  <Link
                    to="/projects/create"
                    className="inline-block bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg transition"
                  >
                    Create Project
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {myProjects.map(project => (
                    <div key={project.id} className="bg-gray-800 p-4 rounded-lg">
                      <h3 className="font-semibold">{project.title}</h3>
                      <p className="text-sm text-gray-400 mt-1">{project.description}</p>
                      <div className="flex items-center gap-3 mt-3">
                        <span className={`px-2 py-1 rounded text-xs ${
                          project.status === 'approved' ? 'bg-green-600' :
                          project.status === 'pending' ? 'bg-yellow-600' :
                          'bg-red-600'
                        }`}>
                          {project.status}
                        </span>
                        <Link to={`/projects/${project.id}`} className="text-blue-400 text-sm">
                          View Details →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Research Encouragement */}
            <div className="bg-gradient-to-br from-indigo-900 to-purple-900 border border-indigo-700 rounded-xl p-6">
              <h2 className="text-xl font-bold mb-3">🔬 Get into Research!</h2>
              <p className="text-indigo-100 mb-4">
                Join ongoing research projects, publish papers, and collaborate with faculty on cutting-edge technology.
              </p>
              <div className="flex gap-3">
                <Link
                  to="/research"
                  className="bg-white text-indigo-900 px-4 py-2 rounded-lg font-medium hover:bg-indigo-50 transition"
                >
                  Explore Research
                </Link>
                <a
                  href="https://scholar.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-indigo-800 px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                >
                  Google Scholar
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
                <div className="space-y-4">
                  {announcements.map(announcement => (
                    <div key={announcement.id} className="bg-gray-800 p-4 rounded-lg">
                      <h3 className="font-semibold text-sm">{announcement.title}</h3>
                      <p className="text-xs text-gray-400 mt-2">{announcement.content}</p>
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
              <h2 className="text-xl font-bold mb-4">Profile Completion</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Basic Info</span>
                  <span className="text-green-400">✓</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Profile Photo</span>
                  <span className={profile?.profile_photo_url ? "text-green-400" : "text-red-400"}>
                    {profile?.profile_photo_url ? "✓" : "✗"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Interests</span>
                  <span className={profile?.interests?.length > 0 ? "text-green-400" : "text-red-400"}>
                    {profile?.interests?.length > 0 ? "✓" : "✗"}
                  </span>
                </div>
              </div>
              <Link
                to="/profile"
                className="block mt-4 text-center bg-blue-600 hover:bg-blue-700 py-2 rounded-lg text-sm transition"
              >
                Complete Profile
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
