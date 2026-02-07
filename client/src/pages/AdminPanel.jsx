import { useState, useEffect } from 'react'
import { admin, courses } from '../services/api'
import { 
  Users, Upload, Settings, BookOpen, Plus, 
  Key, Shield, GraduationCap, TrendingUp, X 
} from 'lucide-react'
import Loading from '../components/Loading'

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const { data } = await admin.getDashboard()
      setStats(data)
    } catch (err) {
      console.error('Load stats error:', err)
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: TrendingUp },
    { id: 'users', name: 'Add Users', icon: Users },
    { id: 'courses', name: 'Courses', icon: BookOpen },
    { id: 'roles', name: 'Manage Roles', icon: Shield },
    { id: 'passwords', name: 'Passwords', icon: Key },
  ]

  if (loading) return <Loading fullScreen />

  return (
    <div className="min-h-screen bg-darker">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">Admin Panel</h1>
          <p className="text-gray-400 text-lg">Manage users, courses, and settings</p>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon={<Users className="text-primary" size={28} />}
              label="Total Students"
              value={stats.students}
              color="primary"
            />
            <StatCard
              icon={<GraduationCap className="text-blue-400" size={28} />}
              label="Faculty Members"
              value={stats.faculty}
              color="blue"
            />
            <StatCard
              icon={<BookOpen className="text-purple-400" size={28} />}
              label="Total Courses"
              value={stats.courses}
              color="purple"
            />
            <StatCard
              icon={<TrendingUp className="text-green-400" size={28} />}
              label="Total Users"
              value={stats.total}
              color="green"
            />
          </div>
        )}

        {/* Tabs */}
        <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary text-black'
                    : 'bg-dark-card text-gray-400 hover:text-gray-100 hover:bg-gray-800'
                }`}
              >
                <Icon size={18} />
                <span>{tab.name}</span>
              </button>
            )
          })}
        </div>

        {/* Tab Content */}
        <div className="card">
          {activeTab === 'overview' && <OverviewTab stats={stats} />}
          {activeTab === 'users' && <AddUsersTab onSuccess={loadStats} />}
          {activeTab === 'courses' && <CoursesTab />}
          {activeTab === 'roles' && <RolesTab />}
          {activeTab === 'passwords' && <PasswordsTab />}
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, color }) {
  const colorClasses = {
    primary: 'from-primary/10 to-primary/5 border-primary/20',
    blue: 'from-blue-500/10 to-blue-500/5 border-blue-500/20',
    purple: 'from-purple-500/10 to-purple-500/5 border-purple-500/20',
    green: 'from-green-500/10 to-green-500/5 border-green-500/20',
  }

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} border rounded-xl p-6`}>
      <div className="mb-4">{icon}</div>
      <p className="text-gray-400 text-sm mb-1">{label}</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  )
}

// ==================== OVERVIEW TAB ====================
function OverviewTab({ stats }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Dashboard Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 bg-dark-card border border-border rounded-lg">
          <h3 className="font-semibold mb-2 text-primary">User Distribution</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Students:</span>
              <span className="font-semibold">{stats?.students || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Faculty:</span>
              <span className="font-semibold">{stats?.faculty || 0}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-2">
              <span className="text-gray-400">Total:</span>
              <span className="font-semibold text-primary">{stats?.total || 0}</span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-dark-card border border-border rounded-lg">
          <h3 className="font-semibold mb-2 text-purple-400">Content Library</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Total Courses:</span>
              <span className="font-semibold">{stats?.courses || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Active:</span>
              <span className="font-semibold text-green-400">{stats?.courses || 0}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl">
        <h3 className="font-bold text-lg mb-2">Quick Actions</h3>
        <p className="text-gray-400 mb-4">Common admin tasks</p>
        <div className="flex flex-wrap gap-3">
          <button className="btn-primary">Add Student</button>
          <button className="btn-secondary">Create Course</button>
          <button className="btn-secondary">Bulk Upload</button>
        </div>
      </div>
    </div>
  )
}

// ==================== ADD USERS TAB ====================
function AddUsersTab({ onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  // Manual Add Student
  const [studentData, setStudentData] = useState({
    username: '',
    email: '',
    department: '',
    year: '1',
    password: '',
    interests: ''
  })

  // Manual Add Faculty
  const [facultyData, setFacultyData] = useState({
    username: '',
    email: '',
    department: '',
    password: ''
  })

  const handleAddStudent = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      await admin.addStudent(studentData)
      setMessage('✅ Student added successfully!')
      setStudentData({ username: '', email: '', department: '', year: '1', password: '', interests: '' })
      onSuccess()
    } catch (err) {
      setMessage('❌ ' + (err.response?.data?.message || 'Failed to add student'))
    } finally {
      setLoading(false)
    }
  }

  const handleAddFaculty = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      await admin.addFaculty(facultyData)
      setMessage('✅ Faculty added successfully!')
      setFacultyData({ username: '', email: '', department: '', password: '' })
      onSuccess()
    } catch (err) {
      setMessage('❌ ' + (err.response?.data?.message || 'Failed to add faculty'))
    } finally {
      setLoading(false)
    }
  }

  const handleCSVUpload = async (e, type) => {
    const file = e.target.files[0]
    if (!file) return

    setLoading(true)
    setMessage('')

    try {
      const uploadFn = type === 'students' ? admin.uploadStudents : admin.uploadFaculty
      const { data } = await uploadFn(file)
      setMessage('✅ ' + data.message)
      onSuccess()
    } catch (err) {
      setMessage('❌ ' + (err.response?.data?.message || 'Upload failed'))
    } finally {
      setLoading(false)
      e.target.value = ''
    }
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Add Users</h2>

      {message && (
        <div className={`p-4 rounded-lg ${message.includes('✅') ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
          {message}
        </div>
      )}

      {/* Manual Forms */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Add Student */}
        <div className="p-6 bg-dark-card border border-border rounded-xl">
          <h3 className="text-xl font-bold mb-4">Add Student Manually</h3>
          <form onSubmit={handleAddStudent} className="space-y-4">
            <input
              type="text"
              placeholder="Username *"
              value={studentData.username}
              onChange={(e) => setStudentData({...studentData, username: e.target.value})}
              className="input w-full"
              required
            />
            <input
              type="email"
              placeholder="Email *"
              value={studentData.email}
              onChange={(e) => setStudentData({...studentData, email: e.target.value})}
              className="input w-full"
              required
            />
            <select
              value={studentData.department}
              onChange={(e) => setStudentData({...studentData, department: e.target.value})}
              className="select w-full"
            >
              <option value="">Select Department</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Electrical">Electrical</option>
              <option value="Mechanical">Mechanical</option>
              <option value="Civil">Civil</option>
              <option value="ECE">Electronics & Communication</option>
            </select>
            <select
              value={studentData.year}
              onChange={(e) => setStudentData({...studentData, year: e.target.value})}
              className="select w-full"
            >
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
            </select>
            <input
              type="password"
              placeholder="Password (min 6 chars) *"
              value={studentData.password}
              onChange={(e) => setStudentData({...studentData, password: e.target.value})}
              className="input w-full"
              minLength={6}
              required
            />
            <input
              type="text"
              placeholder="Interests (comma-separated)"
              value={studentData.interests}
              onChange={(e) => setStudentData({...studentData, interests: e.target.value})}
              className="input w-full"
            />
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Adding...' : 'Add Student'}
            </button>
          </form>
        </div>

        {/* Add Faculty */}
        <div className="p-6 bg-dark-card border border-border rounded-xl">
          <h3 className="text-xl font-bold mb-4">Add Faculty Manually</h3>
          <form onSubmit={handleAddFaculty} className="space-y-4">
            <input
              type="text"
              placeholder="Username *"
              value={facultyData.username}
              onChange={(e) => setFacultyData({...facultyData, username: e.target.value})}
              className="input w-full"
              required
            />
            <input
              type="email"
              placeholder="Email *"
              value={facultyData.email}
              onChange={(e) => setFacultyData({...facultyData, email: e.target.value})}
              className="input w-full"
              required
            />
            <select
              value={facultyData.department}
              onChange={(e) => setFacultyData({...facultyData, department: e.target.value})}
              className="select w-full"
            >
              <option value="">Select Department</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Electrical">Electrical</option>
              <option value="Mechanical">Mechanical</option>
              <option value="Civil">Civil</option>
              <option value="ECE">Electronics & Communication</option>
            </select>
            <input
              type="password"
              placeholder="Password (min 6 chars) *"
              value={facultyData.password}
              onChange={(e) => setFacultyData({...facultyData, password: e.target.value})}
              className="input w-full"
              minLength={6}
              required
            />
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Adding...' : 'Add Faculty'}
            </button>
          </form>
        </div>
      </div>

      {/* CSV Upload */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 bg-dark-card border border-border rounded-xl">
          <h3 className="text-xl font-bold mb-2">Bulk Upload Students</h3>
          <p className="text-sm text-gray-400 mb-4">CSV format: username,email,department,year,password,interests</p>
          <label className="btn-secondary w-full cursor-pointer flex items-center justify-center space-x-2">
            <Upload size={20} />
            <span>Choose CSV File</span>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => handleCSVUpload(e, 'students')}
              className="hidden"
              disabled={loading}
            />
          </label>
        </div>

        <div className="p-6 bg-dark-card border border-border rounded-xl">
          <h3 className="text-xl font-bold mb-2">Bulk Upload Faculty</h3>
          <p className="text-sm text-gray-400 mb-4">CSV format: username,email,department,password</p>
          <label className="btn-secondary w-full cursor-pointer flex items-center justify-center space-x-2">
            <Upload size={20} />
            <span>Choose CSV File</span>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => handleCSVUpload(e, 'faculty')}
              className="hidden"
              disabled={loading}
            />
          </label>
        </div>
      </div>
    </div>
  )
}

// ==================== COURSES TAB ====================
function CoursesTab() {
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    video_url: '',
    thumbnail_url: '',
    category: 'General',
    duration: 0
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      await courses.create(courseData)
      setMessage('✅ Course created successfully!')
      setCourseData({ title: '', description: '', video_url: '', thumbnail_url: '', category: 'General', duration: 0 })
      setShowForm(false)
    } catch (err) {
      setMessage('❌ ' + (err.response?.data?.message || 'Failed to create course'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Manage Courses</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center space-x-2"
        >
          {showForm ? <X size={20} /> : <Plus size={20} />}
          <span>{showForm ? 'Cancel' : 'Create Course'}</span>
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${message.includes('✅') ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
          {message}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="p-6 bg-dark-card border border-border rounded-xl space-y-4">
          <h3 className="text-xl font-bold">Create New Course</h3>
          
          <input
            type="text"
            placeholder="Course Title *"
            value={courseData.title}
            onChange={(e) => setCourseData({...courseData, title: e.target.value})}
            className="input w-full"
            required
          />
          
          <textarea
            placeholder="Description"
            value={courseData.description}
            onChange={(e) => setCourseData({...courseData, description: e.target.value})}
            className="textarea w-full"
            rows={3}
          />
          
          <input
            type="url"
            placeholder="Video URL (YouTube, Vimeo, etc.) *"
            value={courseData.video_url}
            onChange={(e) => setCourseData({...courseData, video_url: e.target.value})}
            className="input w-full"
            required
          />
          
          <input
            type="url"
            placeholder="Thumbnail URL (optional)"
            value={courseData.thumbnail_url}
            onChange={(e) => setCourseData({...courseData, thumbnail_url: e.target.value})}
            className="input w-full"
          />
          
          <div className="grid grid-cols-2 gap-4">
            <select
              value={courseData.category}
              onChange={(e) => setCourseData({...courseData, category: e.target.value})}
              className="select w-full"
            >
              <option value="General">General</option>
              <option value="Web Development">Web Development</option>
              <option value="Mobile Development">Mobile Development</option>
              <option value="Data Science">Data Science</option>
              <option value="AI & ML">AI & ML</option>
              <option value="Cloud Computing">Cloud Computing</option>
              <option value="DevOps">DevOps</option>
              <option value="Cybersecurity">Cybersecurity</option>
            </select>
            
            <input
              type="number"
              placeholder="Duration (seconds)"
              value={courseData.duration}
              onChange={(e) => setCourseData({...courseData, duration: parseInt(e.target.value) || 0})}
              className="input w-full"
              min="0"
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Creating...' : 'Create Course'}
          </button>
        </form>
      )}

      <div className="p-6 bg-dark-card border border-border rounded-xl">
        <p className="text-gray-400">
          Visit the <a href="/courses" className="text-primary hover:underline">Courses page</a> to view and manage all courses.
        </p>
      </div>
    </div>
  )
}

// ==================== ROLES TAB ====================
function RolesTab() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [roleData, setRoleData] = useState({
    username: '',
    role: 'student',
    department: '',
    flag: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      await admin.setRole(roleData)
      setMessage('✅ Role updated successfully!')
      setRoleData({ username: '', role: 'student', department: '', flag: '' })
    } catch (err) {
      setMessage('❌ ' + (err.response?.data?.message || 'Failed to update role'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Manage User Roles</h2>

      {message && (
        <div className={`p-4 rounded-lg ${message.includes('✅') ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-6 bg-dark-card border border-border rounded-xl space-y-4">
        <input
          type="text"
          placeholder="Username *"
          value={roleData.username}
          onChange={(e) => setRoleData({...roleData, username: e.target.value})}
          className="input w-full"
          required
        />

        <select
          value={roleData.role}
          onChange={(e) => setRoleData({...roleData, role: e.target.value})}
          className="select w-full"
        >
          <option value="student">Student</option>
          <option value="faculty">Faculty</option>
          <option value="admin">Admin</option>
          <option value="committee_chair">Committee Chair</option>
          <option value="committee_vice_chair">Committee Vice Chair</option>
          <option value="secretary">Secretary</option>
          <option value="vice_secretary">Vice Secretary</option>
        </select>

        <select
          value={roleData.department}
          onChange={(e) => setRoleData({...roleData, department: e.target.value})}
          className="select w-full"
        >
          <option value="">Select Department (optional)</option>
          <option value="Computer Science">Computer Science</option>
          <option value="Electrical">Electrical</option>
          <option value="Mechanical">Mechanical</option>
          <option value="Civil">Civil</option>
          <option value="ECE">Electronics & Communication</option>
        </select>

        <select
          value={roleData.flag}
          onChange={(e) => setRoleData({...roleData, flag: e.target.value})}
          className="select w-full"
        >
          <option value="">Additional Flags (optional)</option>
          <option value="isCommittee">Committee Member</option>
          <option value="isExecutive">Executive</option>
          <option value="isRepresentative">Representative</option>
          <option value="isDeveloper">Developer</option>
        </select>

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Updating...' : 'Update Role'}
        </button>
      </form>
    </div>
  )
}

// ==================== PASSWORDS TAB ====================
function PasswordsTab() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [passwordData, setPasswordData] = useState({
    username: '',
    password: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      await admin.resetPassword(passwordData)
      setMessage('✅ Password reset successfully!')
      setPasswordData({ username: '', password: '' })
    } catch (err) {
      setMessage('❌ ' + (err.response?.data?.message || 'Failed to reset password'))
    } finally {
      setLoading(false)
    }
  }

  const handleBulkUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setLoading(true)
    setMessage('')

    try {
      const { data } = await admin.bulkPasswords(file)
      setMessage('✅ ' + data.message)
    } catch (err) {
      setMessage('❌ ' + (err.response?.data?.message || 'Upload failed'))
    } finally {
      setLoading(false)
      e.target.value = ''
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Reset Passwords</h2>

      {message && (
        <div className={`p-4 rounded-lg ${message.includes('✅') ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Single Reset */}
        <div className="p-6 bg-dark-card border border-border rounded-xl">
          <h3 className="text-xl font-bold mb-4">Reset Single User</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Username *"
              value={passwordData.username}
              onChange={(e) => setPasswordData({...passwordData, username: e.target.value})}
              className="input w-full"
              required
            />
            <input
              type="password"
              placeholder="New Password (min 6 chars) *"
              value={passwordData.password}
              onChange={(e) => setPasswordData({...passwordData, password: e.target.value})}
              className="input w-full"
              minLength={6}
              required
            />
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        </div>

        {/* Bulk Reset */}
        <div className="p-6 bg-dark-card border border-border rounded-xl">
          <h3 className="text-xl font-bold mb-2">Bulk Password Reset</h3>
          <p className="text-sm text-gray-400 mb-4">CSV format: username,password</p>
          <label className="btn-secondary w-full cursor-pointer flex items-center justify-center space-x-2">
            <Upload size={20} />
            <span>Choose CSV File</span>
            <input
              type="file"
              accept=".csv"
              onChange={handleBulkUpload}
              className="hidden"
              disabled={loading}
            />
          </label>
        </div>
      </div>
    </div>
  )
}
