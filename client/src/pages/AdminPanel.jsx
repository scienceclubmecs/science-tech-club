import { useEffect, useState } from 'react'
import api from '../services/api'
import { 
  Users, BookOpen, Upload, UserPlus, Key, Trash2, GraduationCap,
  Settings, Calendar, Award, FileText, Bell, MessageSquare
} from 'lucide-react'
import Loading from '../components/Loading'

export default function AdminPanel() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [allUsers, setAllUsers] = useState([])
  const [events, setEvents] = useState([])
  const [projects, setProjects] = useState([])
  const [announcements, setAnnouncements] = useState([])
  
  // Forms
  const [newStudent, setNewStudent] = useState({ 
    username: '', email: '', department: '', year: 1, password: '', roll_number: '', dob: '' 
  })
  const [newFaculty, setNewFaculty] = useState({ 
    username: '', email: '', department: '', password: '', employment_id: '' 
  })
  const [resetUsername, setResetUsername] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '', target_audience: 'all' })

  const departments = ['CSE', 'AIML', 'CSD', 'IT', 'CME', 'Civil', 'Mech', 'ECE', 'EEE']
  
  const committeePosts = [
    'Chair',
    'Vice Chair',
    'Secretary',
    'Vice Secretary',
    'CSE Head',
    'CSE Vice Head',
    'AIML Head',
    'AIML Vice Head',
    'IT Head',
    'IT Vice Head',
    'Civil Head',
    'Civil Vice Head',
    'ECE Head',
    'ECE Vice Head',
    'EEE Head',
    'EEE Vice Head',
    'Executive Head',
    'Executive Member',
    'Representative Head',
    'Representative Member',
    'Developer'
  ]

  useEffect(() => {
    fetchDashboard()
    if (activeTab === 'users') fetchAllUsers()
    if (activeTab === 'events') fetchEvents()
    if (activeTab === 'projects') fetchProjects()
    if (activeTab === 'announcements') fetchAnnouncements()
  }, [activeTab])

  const fetchDashboard = async () => {
    try {
      const { data } = await api.get('/admin/dashboard')
      setStats(data)
    } catch (error) {
      console.error('Failed to fetch dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAllUsers = async () => {
    try {
      const { data } = await api.get('/users')
      setAllUsers(data)
    } catch (error) {
      console.error('Failed to fetch users:', error)
    }
  }

  const fetchEvents = async () => {
    try {
      const { data } = await api.get('/events')
      setEvents(data)
    } catch (error) {
      console.error('Failed to fetch events:', error)
    }
  }

  const fetchProjects = async () => {
    try {
      const { data } = await api.get('/projects')
      setProjects(data)
    } catch (error) {
      console.error('Failed to fetch projects:', error)
    }
  }

  const fetchAnnouncements = async () => {
    try {
      const { data } = await api.get('/announcements')
      setAnnouncements(data)
    } catch (error) {
      console.error('Failed to fetch announcements:', error)
    }
  }

  const handleAddStudent = async (e) => {
    e.preventDefault()
    try {
      // Generate username from surname and DOB
      const dobParts = newStudent.dob.split('-') // YYYY-MM-DD
      const username = `${newStudent.username}${dobParts[2]}${dobParts[1]}${dobParts[0].slice(-2)}`
      const password = newStudent.roll_number
      
      await api.post('/admin/add-student', {
        ...newStudent,
        username,
        password
      })
      alert('Student added successfully')
      setNewStudent({ username: '', email: '', department: '', year: 1, password: '', roll_number: '', dob: '' })
      fetchDashboard()
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to add student')
    }
  }

  const handleAddFaculty = async (e) => {
    e.preventDefault()
    try {
      // Username is email, password is employment_id
      const emailUsername = newFaculty.email.split('@')[0]
      
      await api.post('/admin/add-faculty', {
        ...newFaculty,
        username: emailUsername,
        password: newFaculty.employment_id
      })
      alert('Faculty added successfully')
      setNewFaculty({ username: '', email: '', department: '', password: '', employment_id: '' })
      fetchDashboard()
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to add faculty')
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    alert('Password reset disabled. Users cannot change passwords.')
  }

  const handleChangeRole = async (userId, newRole) => {
    try {
      await api.put(`/users/${userId}/role`, { role: newRole })
      alert('Role updated successfully')
      fetchAllUsers()
    } catch (error) {
      alert('Failed to update role')
    }
  }

  const handleAssignCommitteePost = async (userId, post) => {
    try {
      await api.put(`/users/${userId}`, { 
        committee_post: post,
        is_committee: post !== null
      })
      alert('Committee post assigned')
      fetchAllUsers()
    } catch (error) {
      alert('Failed to assign post')
    }
  }

  const handleGraduateStudents = async () => {
    if (!confirm('Graduate all students? 1→2, 2→3, 3→4, 4→deleted')) return
    
    try {
      const students = allUsers.filter(u => u.role === 'student' && u.year)
      
      for (const student of students) {
        if (student.year === 4) {
          await api.delete(`/users/${student.id}`)
        } else {
          await api.put(`/users/${student.id}`, { year: student.year + 1 })
        }
      }
      
      alert('All students graduated!')
      fetchAllUsers()
    } catch (error) {
      alert('Failed to graduate students')
    }
  }

  const handleDeleteUser = async (userId, username) => {
    if (!confirm(`Delete user ${username}?`)) return
    
    try {
      await api.delete(`/users/${userId}`)
      alert('User deleted')
      fetchAllUsers()
    } catch (error) {
      alert('Failed to delete user')
    }
  }

  const handleUploadStudents = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    try {
      await api.post('/admin/upload-students', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      alert('Students uploaded')
      fetchDashboard()
    } catch (error) {
      alert('Failed to upload')
    }
  }

  const handleUploadFaculty = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    try {
      await api.post('/admin/upload-faculty', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      alert('Faculty uploaded')
      fetchDashboard()
    } catch (error) {
      alert('Failed to upload')
    }
  }

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault()
    try {
      await api.post('/announcements', newAnnouncement)
      alert('Announcement created')
      setNewAnnouncement({ title: '', content: '', target_audience: 'all' })
      fetchAnnouncements()
    } catch (error) {
      alert('Failed to create announcement')
    }
  }

  const handleDeleteAnnouncement = async (id) => {
    if (!confirm('Delete announcement?')) return
    try {
      await api.delete(`/announcements/${id}`)
      alert('Deleted')
      fetchAnnouncements()
    } catch (error) {
      alert('Failed to delete')
    }
  }

  const handleApproveEvent = async (eventId) => {
    try {
      await api.put(`/events/${eventId}/status`, { status: 'approved' })
      alert('Event approved')
      fetchEvents()
    } catch (error) {
      alert('Failed to approve event')
    }
  }

  if (loading) return <Loading />

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Admin Control Panel</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <Users className="w-8 h-8 text-blue-400 mb-4" />
          <h3 className="text-2xl font-bold text-white">{stats?.totalUsers || 0}</h3>
          <p className="text-gray-400">Total Users</p>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <BookOpen className="w-8 h-8 text-green-400 mb-4" />
          <h3 className="text-2xl font-bold text-white">{stats?.totalCourses || 0}</h3>
          <p className="text-gray-400">Total Courses</p>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <Award className="w-8 h-8 text-purple-400 mb-4" />
          <h3 className="text-2xl font-bold text-white">{projects.length || 0}</h3>
          <p className="text-gray-400">Projects</p>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <Calendar className="w-8 h-8 text-orange-400 mb-4" />
          <h3 className="text-2xl font-bold text-white">{events.length || 0}</h3>
          <p className="text-gray-400">Events</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-gray-900 rounded-xl border border-gray-800">
        <div className="flex border-b border-gray-800 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: Settings },
            { id: 'users', label: 'Manage Users', icon: Users },
            { id: 'committee', label: 'Committee', icon: Award },
            { id: 'announcements', label: 'Announcements', icon: Bell },
            { id: 'events', label: 'Events', icon: Calendar },
            { id: 'projects', label: 'Projects', icon: FileText },
            { id: 'add-student', label: 'Add Student', icon: UserPlus },
            { id: 'add-faculty', label: 'Add Faculty', icon: UserPlus },
            { id: 'upload', label: 'Upload CSV', icon: Upload },
            { id: 'config', label: 'Site Config', icon: Settings }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 font-medium whitespace-nowrap ${
                activeTab === tab.id ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Dashboard Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-800 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <button 
                      onClick={handleGraduateStudents}
                      className="w-full flex items-center gap-2 bg-green-600 hover:bg-green-700 px-4 py-3 rounded-lg transition"
                    >
                      <GraduationCap className="w-5 h-5" />
                      Graduate All Students
                    </button>
                    <button className="w-full flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-3 rounded-lg transition">
                      <FileText className="w-5 h-5" />
                      Generate Reports
                    </button>
                  </div>
                </div>

                <div className="bg-gray-800 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-4">System Info</h3>
                  <div className="space-y-2 text-sm text-gray-400">
                    <p>Version: 2.0.0</p>
                    <p>Database: Connected</p>
                    <p>Last Backup: {new Date().toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">All Users ({allUsers.length})</h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Username</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Email</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Role</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Department</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Year</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allUsers.map((user) => (
                      <tr key={user.id} className="border-b border-gray-800">
                        <td className="py-3 px-4 text-white">{user.username}</td>
                        <td className="py-3 px-4 text-gray-400 text-sm">{user.email}</td>
                        <td className="py-3 px-4">
                          <select
                            value={user.role}
                            onChange={(e) => handleChangeRole(user.id, e.target.value)}
                            className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-sm"
                          >
                            <option value="student">Student</option>
                            <option value="faculty">Faculty</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="py-3 px-4 text-gray-400 text-sm">{user.department || '-'}</td>
                        <td className="py-3 px-4 text-gray-400 text-sm">{user.year || '-'}</td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleDeleteUser(user.id, user.username)}
                            className="p-2 bg-red-600 hover:bg-red-700 rounded transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Committee Tab */}
          {activeTab === 'committee' && (
            <div>
              <h2 className="text-xl font-bold text-white mb-6">Committee Management</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Username</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Current Post</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Assign Post</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allUsers.filter(u => u.role === 'student' || u.is_committee).map((user) => (
                      <tr key={user.id} className="border-b border-gray-800">
                        <td className="py-3 px-4 text-white">{user.username}</td>
                        <td className="py-3 px-4 text-gray-400">{user.committee_post || 'None'}</td>
                        <td className="py-3 px-4">
                          <select
                            value={user.committee_post || ''}
                            onChange={(e) => handleAssignCommitteePost(user.id, e.target.value || null)}
                            className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm"
                          >
                            <option value="">None</option>
                            {committeePosts.map(post => (
                              <option key={post} value={post}>{post}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Announcements Tab */}
          {activeTab === 'announcements' && (
            <div>
              <h2 className="text-xl font-bold text-white mb-6">Manage Announcements</h2>
              
              <form onSubmit={handleCreateAnnouncement} className="bg-gray-800 p-6 rounded-lg mb-6">
                <h3 className="text-lg font-semibold text-white mb-4">Create Announcement</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                    <input
                      type="text"
                      value={newAnnouncement.title}
                      onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Content</label>
                    <textarea
                      value={newAnnouncement.content}
                      onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white h-24"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Target Audience</label>
                    <select
                      value={newAnnouncement.target_audience}
                      onChange={(e) => setNewAnnouncement({ ...newAnnouncement, target_audience: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                    >
                      <option value="all">All</option>
                      <option value="students">Students Only</option>
                      <option value="faculty">Faculty Only</option>
                      <option value="committee">Committee Only</option>
                    </select>
                  </div>
                  <button type="submit" className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg transition">
                    Create Announcement
                  </button>
                </div>
              </form>

              <div className="space-y-4">
                {announcements.map(ann => (
                  <div key={ann.id} className="bg-gray-800 p-4 rounded-lg flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-white">{ann.title}</h4>
                      <p className="text-gray-400 text-sm mt-1">{ann.content}</p>
                      <span className="text-xs text-gray-500 mt-2 block">
                        {new Date(ann.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteAnnouncement(ann.id)}
                      className="p-2 bg-red-600 hover:bg-red-700 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Events Tab */}
          {activeTab === 'events' && (
            <div>
              <h2 className="text-xl font-bold text-white mb-6">Events Management</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {events.map(event => (
                  <div key={event.id} className="bg-gray-800 p-4 rounded-lg">
                    <h4 className="font-semibold text-white">{event.title}</h4>
                    <p className="text-gray-400 text-sm mt-2">{event.description}</p>
                    <div className="flex items-center justify-between mt-4">
                      <span className={`px-3 py-1 rounded text-xs ${
                        event.status === 'approved' ? 'bg-green-600' : 'bg-yellow-600'
                      }`}>
                        {event.status}
                      </span>
                      {event.status === 'draft' && (
                        <button
                          onClick={() => handleApproveEvent(event.id)}
                          className="bg-blue-600 hover:bg-blue-700 px-4 py-1 rounded text-sm"
                        >
                          Approve
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects Tab */}
          {activeTab === 'projects' && (
            <div>
              <h2 className="text-xl font-bold text-white mb-6">Projects Overview</h2>
              <div className="space-y-4">
                {projects.map(proj => (
                  <div key={proj.id} className="bg-gray-800 p-4 rounded-lg">
                    <h4 className="font-semibold text-white">{proj.title}</h4>
                    <p className="text-gray-400 text-sm mt-2">{proj.description}</p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                      <span>Status: {proj.status}</span>
                      <span>Vacancies: {proj.vacancies}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add Student Tab */}
          {activeTab === 'add-student' && (
            <div>
              <h2 className="text-xl font-bold text-white mb-6">Add New Student</h2>
              <form onSubmit={handleAddStudent} className="space-y-4 max-w-2xl">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Surname</label>
                    <input
                      type="text"
                      value={newStudent.username}
                      onChange={(e) => setNewStudent({ ...newStudent, username: e.target.value })}
                      placeholder="Mathsa"
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Will generate username</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Date of Birth</label>
                    <input
                      type="date"
                      value={newStudent.dob}
                      onChange={(e) => setNewStudent({ ...newStudent, dob: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Format: YYYY-MM-DD</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Roll Number</label>
                    <input
                      type="text"
                      value={newStudent.roll_number}
                      onChange={(e) => setNewStudent({ ...newStudent, roll_number: e.target.value })}
                      placeholder="21R11A0501"
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Will be used as password</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                    <input
                      type="email"
                      value={newStudent.email}
                      onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Department</label>
                    <select
                      value={newStudent.department}
                      onChange={(e) => setNewStudent({ ...newStudent, department: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                      required
                    >
                      <option value="">Select Department</option>
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Year</label>
                    <select
                      value={newStudent.year}
                      onChange={(e) => setNewStudent({ ...newStudent, year: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    >
                      <option value={1}>1st Year</option>
                      <option value={2}>2nd Year</option>
                      <option value={3}>3rd Year</option>
                      <option value={4}>4th Year</option>
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg transition"
                >
                  <UserPlus className="w-5 h-5" />
                  Add Student
                </button>
              </form>
            </div>
          )}

          {/* Add Faculty Tab */}
          {activeTab === 'add-faculty' && (
            <div>
              <h2 className="text-xl font-bold text-white mb-6">Add New Faculty</h2>
              <form onSubmit={handleAddFaculty} className="space-y-4 max-w-2xl">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                    <input
                      type="email"
                      value={newFaculty.email}
                      onChange={(e) => setNewFaculty({ ...newFaculty, email: e.target.value })}
                      placeholder="faculty@example.com"
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Username will be generated</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Employment ID</label>
                    <input
                      type="text"
                      value={newFaculty.employment_id}
                      onChange={(e) => setNewFaculty({ ...newFaculty, employment_id: e.target.value })}
                      placeholder="EMP12345"
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Will be used as password</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Department</label>
                  <select
                    value={newFaculty.department}
                    onChange={(e) => setNewFaculty({ ...newFaculty, department: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    required
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg transition"
                >
                  <UserPlus className="w-5 h-5" />
                  Add Faculty
                </button>
              </form>
            </div>
          )}

          {/* Upload CSV Tab */}
          {activeTab === 'upload' && (
            <div>
              <h2 className="text-xl font-bold text-white mb-6">Upload CSV Files</h2>
              <div className="space-y-6 max-w-3xl">
                <div className="bg-gray-800 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-4">Upload Students CSV</h3>
                  <div className="bg-black border border-gray-700 rounded p-4 mb-4">
                    <p className="text-gray-400 text-xs font-mono mb-2">CSV Format:</p>
                    <pre className="text-green-400 text-xs font-mono">
{`surname,email,roll_number,dob,department,year
Mathsa,mathsa@example.com,21R11A0501,2005-06-07,CSE,1`}
                    </pre>
                    <p className="text-gray-500 text-xs mt-2">Username: Surname + DDMMYY from DOB</p>
                    <p className="text-gray-500 text-xs">Password: Roll Number</p>
                  </div>
                  <label className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg cursor-pointer inline-flex transition">
                    <Upload className="w-5 h-5" />
                    <span>Choose CSV File</span>
                    <input type="file" accept=".csv" onChange={handleUploadStudents} className="hidden" />
                  </label>
                </div>

                <div className="bg-gray-800 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-4">Upload Faculty CSV</h3>
                  <div className="bg-black border border-gray-700 rounded p-4 mb-4">
                    <p className="text-gray-400 text-xs font-mono mb-2">CSV Format:</p>
                    <pre className="text-green-400 text-xs font-mono">
{`email,employment_id,department
prof@example.com,EMP12345,CSE`}
                    </pre>
                    <p className="text-gray-500 text-xs mt-2">Username: Email prefix (before @)</p>
                    <p className="text-gray-500 text-xs">Password: Employment ID</p>
                  </div>
                  <label className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg cursor-pointer inline-flex transition">
                    <Upload className="w-5 h-5" />
                    <span>Choose CSV File</span>
                    <input type="file" accept=".csv" onChange={handleUploadFaculty} className="hidden" />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Site Config Tab */}
          {activeTab === 'config' && (
            <div>
              <h2 className="text-xl font-bold text-white mb-6">Website Configuration</h2>
              <p className="text-sm text-gray-400 mb-6">Manage site settings and customization</p>
              
              <div className="space-y-4 max-w-2xl">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Site Name</label>
                  <input
                    type="text"
                    defaultValue="Science & Tech Club"
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Logo URL</label>
                  <input
                    type="url"
                    placeholder="https://example.com/logo.png"
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">GitHub Repository</label>
                  <input
                    type="url"
                    defaultValue="https://github.com/scienceclubmecs/science-tech-club"
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Contact Email</label>
                  <input
                    type="email"
                    defaultValue="scienceclubmecs@gmail.com"
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  />
                </div>
                
                <button className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg transition">
                  Save Configuration
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
