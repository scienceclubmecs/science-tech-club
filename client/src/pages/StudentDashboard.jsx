import { useState, useEffect } from 'react'
import { Plus, Edit3, Trash2, Download, Eye, Users, Code, Calendar, Award } from 'lucide-react'
import { Link } from 'react-router-dom'
import api from '../services/api'

export default function StudentDashboard() {
  const [projects, setProjects] = useState([])
  const [myProjects, setMyProjects] = useState([])
  const [reportFormat, setReportFormat] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  
  // Create project form
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    domain: '',
    technologies: '',
    image_url: '',
    github_url: '',
    live_url: '',
    max_members: 5
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [allRes, myRes, formatRes] = await Promise.all([
        api.get('/api/projects'),
        api.get('/api/projects/my-projects'),
        api.get('/api/report-formats/active').catch(() => ({ data: null }))
      ])
      setProjects(allRes.data)
      setMyProjects(myRes.data)
      setReportFormat(formatRes.data)
    } catch (error) {
      console.error('Dashboard fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProject = async (e) => {
    e.preventDefault()
    setCreating(true)

    try {
      const techArray = formData.technologies
        .split(',')
        .map(t => t.trim())
        .filter(t => t)

      await api.post('/api/projects', {
        ...formData,
        technologies: techArray
      })

      alert('🎉 Project created successfully!')
      setShowCreateModal(false)
      setFormData({
        title: '',
        description: '',
        domain: '',
        technologies: '',
        image_url: '',
        github_url: '',
        live_url: '',
        max_members: 5
      })
      fetchData()
    } catch (error) {
      console.error('Create error:', error)
      alert(error.response?.data?.message || 'Failed to create project')
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading Dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            Student Dashboard
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Manage your projects, track progress, and collaborate with your team.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 text-center hover:bg-white/20 transition-all">
            <div className="text-3xl mb-2">{myProjects.length}</div>
            <div className="text-gray-300">Active Projects</div>
          </div>
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 text-center hover:bg-white/20 transition-all">
            <div className="text-3xl mb-2">{projects.length}</div>
            <div className="text-gray-300">Available Projects</div>
          </div>
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 text-center hover:bg-white/20 transition-all">
            <div className="text-3xl mb-2">{reportFormat ? 1 : 0}</div>
            <div className="text-gray-300">Report Formats</div>
          </div>
        </div>

        {/* Projects Section */}
        <div className="space-y-12">
          {/* My Projects */}
          <section>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                My Projects
              </h2>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-3 shadow-2xl hover:shadow-3xl transition-all backdrop-blur-xl"
              >
                <Plus className="w-6 h-6" />
                Create Project
              </button>
            </div>

            {/* My Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {myProjects.length === 0 ? (
                <div className="col-span-full text-center py-20 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10">
                  <Eye className="w-20 h-20 text-gray-400 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold mb-4 text-gray-200">No projects yet</h3>
                  <p className="text-gray-400 mb-8 max-w-md mx-auto">
                    Create your first project to get started and collaborate with your team!
                  </p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-10 py-4 rounded-2xl font-bold flex items-center gap-3 mx-auto shadow-2xl hover:shadow-3xl transition-all"
                  >
                    <Plus className="w-6 h-6" />
                    Create First Project
                  </button>
                </div>
              ) : (
                myProjects.map((project) => (
                  <div key={project.id} className="group bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl overflow-hidden hover:border-white/40 hover:bg-white/20 transition-all hover:scale-[1.02]">
                    {project.image_url && (
                      <div className="h-56 bg-gradient-to-br from-gray-800 to-gray-900 group-hover:from-gray-700 group-hover:to-gray-800 transition-all overflow-hidden">
                        <img 
                          src={project.image_url} 
                          alt={project.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                    )}
                    <div className="p-8">
                      <div className="flex items-center gap-3 mb-6">
                        <span className={`px-4 py-2 rounded-2xl text-xs font-bold ${
                          project.status === 'approved' ? 'bg-green-100/80 text-green-800' :
                          project.status === 'open' ? 'bg-blue-100/80 text-blue-800' :
                          project.status === 'pending' ? 'bg-yellow-100/80 text-yellow-800' :
                          'bg-gray-100/80 text-gray-800'
                        }`}>
                          {project.status?.toUpperCase()}
                        </span>
                        {project.role === 'creator' && (
                          <span className="px-3 py-1 bg-purple-100/80 text-purple-800 text-xs rounded-xl font-bold">
                            Creator
                          </span>
                        )}
                      </div>
                      
                      <h3 className="text-2xl font-black mb-4 line-clamp-2 leading-tight group-hover:text-white">
                        {project.title}
                      </h3>
                      
                      <p className="text-gray-300 mb-6 line-clamp-3 leading-relaxed">
                        {project.description}
                      </p>
                      
                      <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-2 text-lg text-gray-400">
                          <Users className="w-6 h-6" />
                          <span>{project.current_members || 0}/{project.max_members || 5}</span>
                        </div>
                        <div className="text-lg font-bold text-blue-400">
                          {project.role} • {project.progress || 0}%
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        {project.github_url && (
                          <a 
                            href={project.github_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex-1 bg-gray-800/50 hover:bg-gray-700 text-gray-200 px-6 py-3 rounded-2xl text-center text-sm font-medium flex items-center justify-center gap-2 group-hover:text-white transition-all"
                          >
                            <Code className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                            GitHub
                          </a>
                        )}
                        
                        {project.status === 'completed' && reportFormat && (
                          <a
                            href={reportFormat.file_url}
                            download={reportFormat.file_name}
                            className="bg-green-600/90 hover:bg-green-700 text-white px-6 py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
                          >
                            <Download className="w-5 h-5" />
                            Report Format
                          </a>
                        )}
                        
                        <button className="flex-1 bg-blue-600/90 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all">
                          <Edit3 className="w-5 h-5" />
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Available Projects */}
          <section>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-8">
              Browse Projects
            </h2>
            {projects.length === 0 ? (
              <div className="text-center py-16 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10">
                <p className="text-gray-400 text-lg">No projects available to join yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                  <div key={project.id} className="group bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 hover:border-white/40 hover:bg-white/20 transition-all cursor-pointer">
                    <h3 className="text-xl font-bold mb-3">{project.title}</h3>
                    <p className="text-gray-400 mb-6 line-clamp-3">{project.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="px-4 py-2 bg-blue-100/80 text-blue-800 text-sm rounded-xl font-bold">
                        {project.current_members}/{project.max_members}
                      </span>
                      <button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-6 py-2 rounded-xl font-bold shadow-lg">
                        Join
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Create Project Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800/50 backdrop-blur-xl border border-white/20 rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-black bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                  Create New Project
                </h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-all"
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={handleCreateProject} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-3">Project Title *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="w-full px-6 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl focus:ring-4 focus:ring-blue-500/30 focus:border-transparent text-white placeholder-gray-400"
                      placeholder="Enter compelling project title..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-3">Domain</label>
                    <select
                      value={formData.domain}
                      onChange={(e) => setFormData({...formData, domain: e.target.value})}
                      className="w-full px-6 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl focus:ring-4 focus:ring-blue-500/30 focus:border-transparent text-white"
                    >
                      <option value="">Select Domain</option>
                      <option value="Web Development">Web Development</option>
                      <option value="Mobile App">Mobile App</option>
                      <option value="AI/ML">AI/ML</option>
                      <option value="IoT">IoT</option>
                      <option value="Blockchain">Blockchain</option>
                      <option value="Data Science">Data Science</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-3">Description *</label>
                  <textarea
                    rows="5"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-6 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl focus:ring-4 focus:ring-blue-500/30 focus:border-transparent text-white placeholder-gray-400 resize-vertical"
                    placeholder="Describe your project in detail..."
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-3">Technologies (comma separated)</label>
                    <input
                      type="text"
                      value={formData.technologies}
                      onChange={(e) => setFormData({...formData, technologies: e.target.value})}
                      className="w-full px-6 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl focus:ring-4 focus:ring-blue-500/30 focus:border-transparent text-white placeholder-gray-400"
                      placeholder="React, Node.js, MongoDB, TailwindCSS"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-3">Max Team Members</label>
                    <input
                      type="number"
                      min="2"
                      max="10"
                      value={formData.max_members}
                      onChange={(e) => setFormData({...formData, max_members: parseInt(e.target.value)})}
                      className="w-full px-6 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl focus:ring-4 focus:ring-blue-500/30 focus:border-transparent text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-3">GitHub Repository</label>
                    <input
                      type="url"
                      value={formData.github_url}
                      onChange={(e) => setFormData({...formData, github_url: e.target.value})}
                      className="w-full px-6 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl focus:ring-4 focus:ring-blue-500/30 focus:border-transparent text-white placeholder-gray-400"
                      placeholder="https://github.com/username/project"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-3">Live Demo URL</label>
                    <input
                      type="url"
                      value={formData.live_url}
                      onChange={(e) => setFormData({...formData, live_url: e.target.value})}
                      className="w-full px-6 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl focus:ring-4 focus:ring-blue-500/30 focus:border-transparent text-white placeholder-gray-400"
                      placeholder="https://your-project.vercel.app"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <label className="block text-sm font-bold text-gray-300 mb-3">Project Image (Optional)</label>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                    className="w-full px-6 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl focus:ring-4 focus:ring-blue-500/30 focus:border-transparent text-white placeholder-gray-400"
                    placeholder="https://images.unsplash.com/photo-..."
                  />
                </div>

                <div className="flex gap-4 pt-8">
                  <button
                    type="submit"
                    disabled={creating}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-blue-500 disabled:to-purple-500 text-white py-5 px-8 rounded-3xl font-black text-lg flex items-center justify-center gap-3 shadow-2xl hover:shadow-3xl transition-all backdrop-blur-xl border border-white/20"
                  >
                    {creating ? (
                      <>
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="w-7 h-7" />
                        Create Project
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    disabled={creating}
                    className="flex-1 bg-white/10 hover:bg-white/20 text-white py-5 px-8 rounded-3xl font-bold text-lg flex items-center justify-center gap-3 backdrop-blur-xl border border-white/30 hover:border-white/50 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
