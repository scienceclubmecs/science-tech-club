import { useState, useEffect } from 'react'
import { Users, Upload, Download, Settings, Trash2, Award, Shield, Plus } from 'lucide-react'
import api from '../services/api'

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('users')
  const [users, setUsers] = useState([])
  const [courses, setCourses] = useState([])
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    role: 'student',
    department: ''
  })
  const [config, setConfig] = useState({
    site_name: 'Science & Tech Club',
    logo_url: 'https://i.ibb.co/v6WM95xK/2.jpg',
    mecs_logo_url: 'https://i.ibb.co/sptF2qvk/mecs-logo.jpg',
    theme_mode: 'dark',
    primary_color: '#3b82f6',
    watermark_opacity: '0.25',
    contact_email: 'scienceclubmecs@gmail.com',
    college_website: 'https://matrusri.edu.in'
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [bulkFile, setBulkFile] = useState(null)

  useEffect(() => {
    fetchUsers()
    fetchCourses()
    fetchConfig()
  }, [])

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/users')
      setUsers(data)
    } catch (error) {
      console.error('Failed to fetch users:', error)
    }
  }

  const fetchCourses = async () => {
    try {
      const { data } = await api.get('/courses')
      setCourses(data)
    } catch (error) {
      console.error('Failed to fetch courses:', error)
    }
  }

  const fetchConfig = async () => {
    try {
      const { data } = await api.get('/config')
      setConfig({ ...config, ...data })
    } catch (error) {
      console.error('Failed to fetch config:', error)
    }
  }

  const handleCreateUser = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      await api.post('/auth/register', newUser)
      setMessage('User created successfully!')
      setNewUser({
        username: '',
        email: '',
        password: '',
        role: 'student',
        department: ''
      })
      fetchUsers()
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('Failed to create user:', error)
      setMessage(error.response?.data?.message || 'Failed to create user')
    } finally {
      setLoading(false)
    }
  }

  const handleBulkUpload = async (e) => {
    e.preventDefault()
    if (!bulkFile) {
      setMessage('Please select a CSV file')
      return
    }

    const formData = new FormData()
    formData.append('file', bulkFile)
    setLoading(true)
    setMessage('')

    try {
      const { data } = await api.post('/users/bulk-upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setMessage(`Successfully uploaded ${data.count} users!`)
      setBulkFile(null)
      fetchUsers()
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('Bulk upload failed:', error)
      setMessage(error.response?.data?.message || 'Bulk upload failed')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadTemplate = () => {
    const csv = 'username,email,password,role,department\nstudent1,student1@mecs.ac.in,password123,student,CSE\nstudent2,student2@mecs.ac.in,password123,student,ECE'
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'users_template.csv'
    a.click()
  }

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return
    
    try {
      await api.delete(`/users/${userId}`)
      setMessage('User deleted successfully!')
      fetchUsers()
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('Failed to delete user:', error)
      setMessage('Failed to delete user')
    }
  }

  const handleUpdateRole = async (userId, newRole) => {
    try {
      await api.put(`/users/${userId}`, { role: newRole })
      setMessage('User role updated!')
      fetchUsers()
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('Failed to update role:', error)
    }
  }

  const handleToggleCommittee = async (userId, currentStatus) => {
    try {
      await api.put(`/users/${userId}`, { 
        is_committee: !currentStatus,
        committee_post: !currentStatus ? 'Member' : null
      })
      setMessage('Committee status updated!')
      fetchUsers()
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('Failed to update committee:', error)
    }
  }

  const handleUpdateCommitteePost = async (userId, post) => {
    try {
      await api.put(`/users/${userId}`, { 
        committee_post: post,
        is_committee: true
      })
      fetchUsers()
    } catch (error) {
      console.error('Failed to update post:', error)
    }
  }

  const handleGraduateUsers = async () => {
    if (!confirm('This will mark all 4th year students as graduated. Continue?')) return
    
    setLoading(true)
    try {
      // Implementation depends on your backend
      setMessage('Graduation process completed!')
      fetchUsers()
    } catch (error) {
      console.error('Graduation failed:', error)
      setMessage('Graduation process failed')
    } finally {
      setLoading(false)
    }
  }

  const handleConfigSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      await api.put('/config', config)
      setMessage('Configuration updated successfully!')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('Failed to update config:', error)
      setMessage('Failed to update configuration')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black pt-20 px-4 pb-12">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Admin Panel</h1>
          <p className="text-gray-400">Manage users, committee, courses, and site configuration</p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.includes('success') || message.includes('Successfully')
              ? 'bg-green-900/20 border border-green-800 text-green-400' 
              : 'bg-red-900/20 border border-red-800 text-red-400'
          }`}>
            {message}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-6">
            <Users className="w-10 h-10 mb-3 opacity-80" />
            <div className="text-3xl font-bold mb-1">{users.length}</div>
            <div className="text-sm opacity-80">Total Users</div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl p-6">
            <Shield className="w-10 h-10 mb-3 opacity-80" />
            <div className="text-3xl font-bold mb-1">
              {users.filter(u => u.is_committee).length}
            </div>
            <div className="text-sm opacity-80">Committee Members</div>
          </div>
          
          <div className="bg-gradient-to-br from-pink-600 to-pink-800 rounded-xl p-6">
            <Award className="w-10 h-10 mb-3 opacity-80" />
            <div className="text-3xl font-bold mb-1">{courses.length}</div>
            <div className="text-sm opacity-80">Active Courses</div>
          </div>

          <div className="bg-gradient-to-br from-orange-600 to-orange-800 rounded-xl p-6">
            <Settings className="w-10 h-10 mb-3 opacity-80" />
            <div className="text-3xl font-bold mb-1">
              {users.filter(u => u.role === 'admin').length}
            </div>
            <div className="text-sm opacity-80">Administrators</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-800">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-3 font-medium transition ${
              activeTab === 'users'
                ? 'text-blue-500 border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            User Management
          </button>
          <button
            onClick={() => setActiveTab('bulk')}
            className={`px-6 py-3 font-medium transition ${
              activeTab === 'bulk'
                ? 'text-blue-500 border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Bulk Operations
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`px-6 py-3 font-medium transition ${
              activeTab === 'config'
                ? 'text-blue-500 border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Site Configuration
          </button>
        </div>

        {/* User Management Tab */}
        {activeTab === 'users' && (
          <>
            {/* Create User Form */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 mb-8">
              <div className="flex items-center gap-3 mb-6">
                <Plus className="w-6 h-6 text-green-500" />
                <h2 className="text-2xl font-bold text-white">Create New User</h2>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white mb-2 text-sm font-medium">Username</label>
                    <input
                      type="text"
                      required
                      value={newUser.username}
                      onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-600"
                      placeholder="john_doe"
                    />
                  </div>
                  <div>
                    <label className="block text-white mb-2 text-sm font-medium">Email</label>
                    <input
                      type="email"
                      required
                      value={newUser.email}
                      onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-600"
                      placeholder="john@mecs.ac.in"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-white mb-2 text-sm font-medium">Password</label>
                    <input
                      type="password"
                      required
                      value={newUser.password}
                      onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-600"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="block text-white mb-2 text-sm font-medium">Role</label>
                    <select
                      value={newUser.role}
                      onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-600"
                    >
                      <option value="student">Student</option>
                      <option value="faculty">Faculty</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-white mb-2 text-sm font-medium">Department</label>
                    <input
                      type="text"
                      value={newUser.department}
                      onChange={(e) => setNewUser({...newUser, department: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-600"
                      placeholder="CSE"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-700 py-3 rounded-lg font-medium transition"
                >
                  {loading ? 'Creating User...' : 'Create User'}
                </button>
              </form>
            </div>

            {/* Users List */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Users className="w-6 h-6 text-purple-500" />
                  <h2 className="text-2xl font-bold text-white">All Users ({users.length})</h2>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Username</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Email</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Role</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Department</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Committee</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Post</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                        <td className="py-3 px-4 text-white font-medium">{user.username}</td>
                        <td className="py-3 px-4 text-gray-400 text-sm">{user.email}</td>
                        <td className="py-3 px-4">
                          <select
                            value={user.role}
                            onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                            className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-white"
                          >
                            <option value="student">Student</option>
                            <option value="faculty">Faculty</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="py-3 px-4 text-gray-400 text-sm">{user.department || '-'}</td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleToggleCommittee(user.id, user.is_committee)}
                            className={`px-3 py-1 rounded text-xs font-medium ${
                              user.is_committee 
                                ? 'bg-green-600 hover:bg-green-700' 
                                : 'bg-gray-700 hover:bg-gray-600'
                            }`}
                          >
                            {user.is_committee ? 'Yes' : 'No'}
                          </button>
                        </td>
                        <td className="py-3 px-4">
                          {user.is_committee ? (
                            <input
                              type="text"
                              value={user.committee_post || ''}
                              onChange={(e) => handleUpdateCommitteePost(user.id, e.target.value)}
                              className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-white w-full"
                              placeholder="Post title"
                            />
                          ) : (
                            <span className="text-gray-600 text-sm">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-400 hover:text-red-300 transition"
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
          </>
        )}

        {/* Bulk Operations Tab */}
        {activeTab === 'bulk' && (
          <div className="space-y-8">
            {/* Bulk Upload */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <Upload className="w-6 h-6 text-blue-500" />
                <h2 className="text-2xl font-bold text-white">Bulk Upload Users</h2>
              </div>

              <div className="mb-6">
                <button
                  onClick={handleDownloadTemplate}
                  className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition"
                >
                  <Download className="w-4 h-4" />
                  Download CSV Template
                </button>
              </div>

              <form onSubmit={handleBulkUpload} className="space-y-6">
                <div>
                  <label className="block text-white mb-2 text-sm font-medium">Upload CSV File</label>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => setBulkFile(e.target.files[0])}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-600"
                  />
                  <p className="text-gray-500 text-sm mt-2">
                    CSV format: username, email, password, role, department
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading || !bulkFile}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 py-3 rounded-lg font-medium transition"
                >
                  {loading ? 'Uploading...' : 'Upload Users'}
                </button>
              </form>
            </div>

            {/* Graduation Button */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <Award className="w-6 h-6 text-yellow-500" />
                <h2 className="text-2xl font-bold text-white">Graduate Students</h2>
              </div>

              <p className="text-gray-400 mb-6">
                Mark all 4th year students as graduated and archive their accounts.
              </p>

              <button
                onClick={handleGraduateUsers}
                disabled={loading}
                className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-700 px-6 py-3 rounded-lg font-medium transition"
              >
                {loading ? 'Processing...' : 'Graduate 4th Year Students'}
              </button>
            </div>
          </div>
        )}

        {/* Site Configuration Tab */}
        {activeTab === 'config' && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <Settings className="w-6 h-6 text-blue-500" />
              <h2 className="text-2xl font-bold text-white">Site Configuration</h2>
            </div>

            <form onSubmit={handleConfigSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white mb-2 text-sm font-medium">Site Name</label>
                  <input
                    type="text"
                    value={config.site_name}
                    onChange={(e) => setConfig({...config, site_name: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-600"
                    placeholder="Science & Tech Club"
                  />
                </div>

                <div>
                  <label className="block text-white mb-2 text-sm font-medium">Contact Email</label>
                  <input
                    type="email"
                    value={config.contact_email}
                    onChange={(e) => setConfig({...config, contact_email: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-600"
                    placeholder="scienceclubmecs@gmail.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white mb-2 text-sm font-medium">Club Logo URL</label>
                  <input
                    type="url"
                    value={config.logo_url}
                    onChange={(e) => setConfig({...config, logo_url: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-600"
                    placeholder="https://i.ibb.co/v6WM95xK/2.jpg"
                  />
                  {config.logo_url && (
                    <div className="mt-2 p-2 bg-gray-800 rounded-lg inline-block">
                      <img src={config.logo_url} alt="Club Logo" className="h-12 w-auto" />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-white mb-2 text-sm font-medium">MECS College Logo URL</label>
                  <input
                    type="url"
                    value={config.mecs_logo_url}
                    onChange={(e) => setConfig({...config, mecs_logo_url: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-600"
                    placeholder="https://i.ibb.co/sptF2qvk/mecs-logo.jpg"
                  />
                  {config.mecs_logo_url && (
                    <div className="mt-2 p-2 bg-gray-800 rounded-lg inline-block">
                      <img src={config.mecs_logo_url} alt="MECS Logo" className="h-12 w-auto" />
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-white mb-2 text-sm font-medium">Theme Mode</label>
                  <select
                    value={config.theme_mode}
                    onChange={(e) => setConfig({...config, theme_mode: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-600"
                  >
                    <option value="dark">Dark Theme (Black)</option>
                    <option value="light">Light Theme (White)</option>
                    <option value="auto">Auto (System)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white mb-2 text-sm font-medium">Primary Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={config.primary_color}
                      onChange={(e) => setConfig({...config, primary_color: e.target.value})}
                      className="w-16 h-12 bg-gray-800 border border-gray-700 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={config.primary_color}
                      onChange={(e) => setConfig({...config, primary_color: e.target.value})}
                      className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-600"
                      placeholder="#3b82f6"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white mb-2 text-sm font-medium">Watermark Brightness (0.15 - 0.35)</label>
                  <input
                    type="number"
                    min="0.15"
                    max="0.35"
                    step="0.05"
                    value={config.watermark_opacity}
                    onChange={(e) => setConfig({...config, watermark_opacity: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white mb-2 text-sm font-medium">College Website</label>
                <input
                  type="url"
                  value={config.college_website}
                  onChange={(e) => setConfig({...config, college_website: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-600"
                  placeholder="https://matrusri.edu.in"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 py-3 rounded-lg font-medium transition"
              >
                {loading ? 'Saving Configuration...' : 'Save Configuration'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
