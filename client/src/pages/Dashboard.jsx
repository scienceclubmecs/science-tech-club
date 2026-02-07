import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { courses, admin } from '../services/api'
import { 
  BookOpen, Users, GraduationCap, TrendingUp, 
  ArrowRight, PlayCircle, Clock, Sparkles 
} from 'lucide-react'
import Loading from '../components/Loading'

export default function Dashboard() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState(null)
  const [recentCourses, setRecentCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [coursesRes, statsRes] = await Promise.all([
        courses.getAll(),
        user?.role === 'admin' ? admin.getDashboard() : Promise.resolve(null)
      ])
      
      setRecentCourses(coursesRes.data.slice(0, 4))
      if (statsRes) setStats(statsRes.data)
    } catch (err) {
      console.error('Load dashboard error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Loading fullScreen />

  return (
    <div className="min-h-screen bg-darker">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-2">
            <Sparkles className="text-primary" size={24} />
            <h1 className="text-4xl font-bold">
              Welcome back, <span className="gradient-text">{user?.username}</span>!
            </h1>
          </div>
          <p className="text-gray-400 text-lg">
            Here's what's happening with your club today.
          </p>
        </div>

        {/* Stats Grid (Admin Only) */}
        {user?.role === 'admin' && stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon={<Users className="text-primary" size={28} />}
              label="Total Students"
              value={stats.students}
              trend="+12% this month"
              color="primary"
            />
            <StatCard
              icon={<GraduationCap className="text-blue-400" size={28} />}
              label="Faculty Members"
              value={stats.faculty}
              trend="+3 new members"
              color="blue"
            />
            <StatCard
              icon={<BookOpen className="text-purple-400" size={28} />}
              label="Total Courses"
              value={stats.courses}
              trend="+5 this week"
              color="purple"
            />
            <StatCard
              icon={<TrendingUp className="text-green-400" size={28} />}
              label="Active Users"
              value={stats.total}
              trend="+15% growth"
              color="green"
            />
          </div>
        )}

        {/* Recent Courses */}
        <div className="mb-10">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-100 mb-1">Recent Courses</h2>
              <p className="text-gray-400">Continue your learning journey</p>
            </div>
            <Link 
              to="/courses" 
              className="flex items-center space-x-2 text-primary hover:text-secondary font-medium transition-colors"
            >
              <span>View All</span>
              <ArrowRight size={18} />
            </Link>
          </div>

          {recentCourses.length === 0 ? (
            <div className="card text-center py-16">
              <BookOpen className="mx-auto text-gray-600 mb-4" size={56} />
              <h3 className="text-xl font-semibold mb-2">No courses available yet</h3>
              <p className="text-gray-400 mb-6">Be the first to create amazing content</p>
              {(user?.role === 'admin' || user?.is_committee) && (
                <Link to="/admin" className="btn-primary">
                  Create First Course
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {recentCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <QuickLink
              to="/courses"
              title="Browse Courses"
              description="Explore video tutorials and lectures"
              icon={<BookOpen size={32} />}
              color="primary"
            />
            <QuickLink
              to="/chat"
              title="Team Chat"
              description="Connect with committee and students"
              icon={<Users size={32} />}
              color="blue"
            />
            {user?.role === 'admin' && (
              <QuickLink
                to="/admin"
                title="Admin Panel"
                description="Manage users, roles and content"
                icon={<GraduationCap size={32} />}
                color="purple"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, trend, color }) {
  const colorClasses = {
    primary: 'from-primary/10 to-primary/5 border-primary/20',
    blue: 'from-blue-500/10 to-blue-500/5 border-blue-500/20',
    purple: 'from-purple-500/10 to-purple-500/5 border-purple-500/20',
    green: 'from-green-500/10 to-green-500/5 border-green-500/20',
  }

  return (
    <div className={`card bg-gradient-to-br ${colorClasses[color]} hover:scale-105 transition-transform duration-200`}>
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-dark/50 rounded-xl">{icon}</div>
        <span className="text-green-400 text-xs font-semibold px-2 py-1 bg-green-500/10 rounded">
          {trend}
        </span>
      </div>
      <p className="text-gray-400 text-sm mb-1">{label}</p>
      <p className="text-3xl font-bold text-gray-100">{value}</p>
    </div>
  )
}

function CourseCard({ course }) {
  return (
    <Link to={`/courses/${course.id}`} className="card-hover group">
      <div className="relative mb-4 overflow-hidden rounded-lg">
        <img
          src={course.thumbnail_url || 'https://via.placeholder.com/400x225?text=Course'}
          alt={course.title}
          className="w-full h-40 object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute top-3 right-3 bg-primary text-black text-xs px-2 py-1 rounded-md font-semibold">
          {course.category}
        </div>
        <div className="absolute bottom-3 left-3 flex items-center space-x-2">
          <PlayCircle className="text-white" size={20} />
          {course.duration && (
            <span className="text-white text-sm flex items-center space-x-1">
              <Clock size={14} />
              <span>{Math.floor(course.duration / 60)}min</span>
            </span>
          )}
        </div>
      </div>
      <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
        {course.title}
      </h3>
      <p className="text-gray-400 text-sm line-clamp-2">
        {course.description || 'Explore this course to learn more'}
      </p>
    </Link>
  )
}

function QuickLink({ to, title, description, icon, color }) {
  const colorClasses = {
    primary: 'from-primary/20 to-primary/5 border-primary/30 hover:border-primary/50',
    blue: 'from-blue-500/20 to-blue-500/5 border-blue-500/30 hover:border-blue-500/50',
    purple: 'from-purple-500/20 to-purple-500/5 border-purple-500/30 hover:border-purple-500/50',
  }

  return (
    <Link
      to={to}
      className={`card bg-gradient-to-br ${colorClasses[color]} group hover:scale-105 transition-all duration-200`}
    >
      <div className="mb-4 transform group-hover:scale-110 transition-transform duration-200">
        {icon}
      </div>
      <h3 className="font-bold text-xl mb-2 group-hover:text-primary transition-colors">
        {title}
      </h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </Link>
  )
}
