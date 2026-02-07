import { useEffect, useState } from 'react'
import api from '../services/api'
import { Users, BookOpen, Upload, UserPlus, Key } from 'lucide-react'
import Loading from '../components/Loading'

export default function AdminPanel() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [newStudent, setNewStudent] = useState({ username: '', email: '', department: '', year: 1, password: '' })
  const [newFaculty, setNewFaculty] = useState({ username: '', email: '', department: '', password: '' })

  useEffect(() => {
    fetchDashboard()
  }, [])

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

  const handleAddStudent = async (e) => {
    e.preventDefault()
    try {
      await api.post('/admin/add-student', newStudent)
      alert('Student added successfully')
      setNewStudent({ username: '', email: '', department: '', year: 1, password: '' })
      fetchDashboard()
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to add student')
    }
  }

  const handleAddFaculty = async (e) => {
    e.preventDefault()
    try {
      await api.post('/admin/add-faculty', newFaculty)
      alert('Faculty added successfully')
      setNewFaculty({ username: '', email: '', department: '', password: '' })
      fetchDashboard()
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to add faculty')
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
      alert('Students uploaded successfully')
      fetchDashboard()
    } catch (error) {
      alert('Failed to upload students')
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
      alert('Faculty uploaded successfully')
      fetchDashboard()
    } catch (error) {
      alert('Failed to upload faculty')
    }
  }

  if (loading) return <Loading />

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Admin Panel</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <Users className="w-8 h-8 text-blue-400 mb-4" />
          <h3 className="text-2xl font-bold text-white">{stats?.totalUsers || 0}</h3>
          <p className="text-gray-400">Total Users</p>
        </div>

        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <BookOpen className="w-8 h-8 text-green-400 mb-4" />
          <h3 className="text-2xl font-bold text-white">{stats?.totalCourses || 0}</h3>
          <p className="text-gray-400">Total Courses</p>
        </div>

        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <Users className="w-8 h-8 text-purple-400 mb-4" />
          <h3 className="text-2xl font-bold text-white">{stats?.students || 0}</h3>
          <p className="text-gray-400">Students</p>
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700">
        <div className="flex border-b border-slate-700">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-4 font-medium ${
              activeTab === 'overview' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('add-student')}
            className={`px-6 py-4 font-medium ${
              activeTab === 'add-student' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'
            }`}
          >
            Add Student
          </button>
          <button
            onClick={() => setActiveTab('add-faculty')}
            className={`px-6 py-4 font-medium ${
              activeTab === 'add-faculty' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'
            }`}
          >
            Add Faculty
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-6 py-4 font-medium ${
              activeTab === 'upload' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'
            }`}
          >
            Upload CSV
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Dashboard Overview</h2>
              <p className="text-gray-400">Manage users, courses, and system settings from here.</p>
            </div>
          )}

          {activeTab === 'add-student' && (
            <div>
              <h2 className="text-xl font-bold text-white mb-6">Add New Student</h2>
              <form onSubmit={handleAddStudent} className="space-y-4 max-w-2xl">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
                    <input
                      type="text"
                      value={newStudent.username}
                      onChange={(e) => setNewStudent({ ...newStudent, username: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                    <input
                      type="email"
                      value={newStudent.email}
                      onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Department</label>
                    <input
                      type="text"
                      value={newStudent.department}
                      onChange={(e) => setNewStudent({ ...newStudent, department: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Year</label>
                    <select
                      value={newStudent.year}
                      onChange={(e) => setNewStudent({ ...newStudent, year: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    >
                      <option value={1}>1</option>
                      <option value={2}>2</option>
                      <option value={3}>3</option>
                      <option value={4}>4</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                  <input
                    type="password"
                    value={newStudent.password}
                    onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg transition"
                >
                  <UserPlus className="w-5 h-5" />
                  <span>Add Student</span>
                </button>
              </form>
            </div>
          )}

          {activeTab === 'add-faculty' && (
            <div>
              <h2 className="text-xl font-bold text-white mb-6">Add New Faculty</h2>
              <form onSubmit={handleAddFaculty} className="space-y-4 max-w-2xl">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
                    <input
                      type="text"
                      value={newFaculty.username}
                      onChange={(e) => setNewFaculty({ ...newFaculty, username: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                    <input
                      type="email"
                      value={newFaculty.email}
                      onChange={(e) => setNewFaculty({ ...newFaculty, email: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Department</label>
                  <input
                    type="text"
                    value={newFaculty.department}
                    onChange={(e) => setNewFaculty({ ...newFaculty, department: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                  <input
                    type="password"
                    value={newFaculty.password}
                    onChange={(e) => setNewFaculty({ ...newFaculty, password: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg transition"
                >
                  <UserPlus className="w-5 h-5" />
                  <span>Add Faculty</span>
                </button>
              </form>
            </div>
          )}

          {activeTab === 'upload' && (
            <div>
              <h2 className="text-xl font-bold text-white mb-6">Upload CSV Files</h2>
              <div className="space-y-6 max-w-2xl">
                <div className="bg-slate-700 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-4">Upload Students CSV</h3>
                  <p className="text-gray-400 text-sm mb-4">
                    CSV format: username,email,department,year,password,interests
                  </p>
                  <label className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg cursor-pointer inline-flex transition">
                    <Upload className="w-5 h-5" />
                    <span>Choose File</span>
                    <input type="file" accept=".csv" onChange={handleUploadStudents} className="hidden" />
                  </label>
                </div>

                <div className="bg-slate-700 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-4">Upload Faculty CSV</h3>
                  <p className="text-gray-400 text-sm mb-4">
                    CSV format: username,email,department,password
                  </p>
                  <label className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg cursor-pointer inline-flex transition">
                    <Upload className="w-5 h-5" />
                    <span>Choose File</span>
                    <input type="file" accept=".csv" onChange={handleUploadFaculty} className="hidden" />
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
