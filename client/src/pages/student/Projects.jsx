import { useState, useEffect } from 'react'
import { Plus, Edit3, Trash2, Download, Eye } from 'lucide-react'
import api from '../../services/api'

export default function StudentProjects() {
  const [projects, setProjects] = useState([])
  const [myProjects, setMyProjects] = useState([])
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
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const [allRes, myRes] = await Promise.all([
        api.get('/api/projects'),
        api.get('/api/projects/my-projects')
      ])
      setProjects(allRes.data)
      setMyProjects(myRes.data)
    } catch (error) {
      console.error('Fetch projects error:', error)
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

      alert('Project created successfully!')
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
      fetchProjects()
    } catch (error) {
      console.error('Create error:', error)
      alert(error.response?.data?.message || 'Failed to create project')
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return <div className="p-8 text-center">Loading projects...</div>
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Projects</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Create Project
        </button>
      </div>

      {/* My Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {myProjects.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-gray-50 rounded-2xl">
            <Eye className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No projects yet</h3>
            <p className="text-gray-600 mb-6">Create your first project to get started!</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 mx-auto"
            >
              <Plus className="w-5 h-5" />
              Create First Project
            </button>
          </div>
        ) : (
          myProjects.map((project) => (
            <div key={project.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all">
              {project.image_url && (
                <img 
                  src={project.image_url} 
                  alt={project.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    project.status === 'approved' ? 'bg-green-100 text-green-800' :
                    project.status === 'open' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {project.status}
                  </span>
                  {project.role === 'creator' && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                      Creator
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-bold mb-3 line-clamp-2">{project.title}</h3>
                <p className="text-gray-600 mb-4 line-clamp-3">{project.description}</p>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Users className="w-4 h-4" />
                    {project.current_members}/{project.max_members} members
                  </div>
                  <div className="text-sm text-gray-500">
                    {project.role} • {project.progress}%
                  </div>
                </div>

                <div className="flex gap-2">
                  {project.github_url && (
                    <a href={project.github_url} target="_blank" className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-center text-sm flex items-center justify-center gap-1">
                      <Code className="w-4 h-4" />
                      GitHub
                    </a>
                  )}
                  {project.status === 'completed' && reportFormat && (
                    <a
                      href={reportFormat.file_url}
                      download={reportFormat.file_name}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm flex items-center justify-center gap-1 flex-1"
                    >
                      <Download className="w-4 h-4" />
                      Report Format
                    </a>
                  )}
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm">
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">Create New Project</h2>
            
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Project Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., E-Commerce Website"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  rows="4"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                  placeholder="Describe your project..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Domain</label>
                  <select
                    value={formData.domain}
                    onChange={(e) => setFormData({...formData, domain: e.target.value})}
                    className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Domain</option>
                    <option value="Web Development">Web Development</option>
                    <option value="Mobile App">Mobile App</option>
                    <option value="AI/ML">AI/ML</option>
                    <option value="IoT">IoT</option>
                    <option value="Blockchain">Blockchain</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Max Members</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.max_members}
                    onChange={(e) => setFormData({...formData, max_members: parseInt(e.target.value)})}
                    className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Technologies (comma separated)</label>
                <input
                  type="text"
                  value={formData.technologies}
                  onChange={(e) => setFormData({...formData, technologies: e.target.value})}
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
                  placeholder="React, Node.js, MongoDB"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">GitHub URL</label>
                  <input
                    type="url"
                    value={formData.github_url}
                    onChange={(e) => setFormData({...formData, github_url: e.target.value})}
                    className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
                    placeholder="https://github.com/user/repo"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Live URL</label>
                  <input
                    type="url"
                    value={formData.live_url}
                    onChange={(e) => setFormData({...formData, live_url: e.target.value})}
                    className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
                    placeholder="https://yourapp.com"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 px-6 rounded-xl font-medium flex items-center justify-center gap-2 shadow-lg"
                >
                  {creating ? 'Creating...' : 'Create Project'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-6 rounded-xl font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
