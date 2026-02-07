import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { Award, Users, ExternalLink, Github, Globe, Plus, Filter } from 'lucide-react'
import Loading from '../components/Loading'

export default function ProjectsPage() {
  const [projects, setProjects] = useState([])
  const [myProjects, setMyProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const [allRes, myRes] = await Promise.all([
        api.get('/projects'),
        api.get('/projects/my')
      ])
      setProjects(allRes.data)
      setMyProjects(myRes.data)
    } catch (error) {
      console.error('Failed to fetch projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleJoinProject = async (projectId) => {
    try {
      await api.post(`/projects/${projectId}/join`)
      alert('Successfully joined project!')
      fetchProjects()
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to join project')
    }
  }

  const filteredProjects = projects.filter(p => {
    if (filter === 'all') return true
    if (filter === 'vacancies') return p.vacancies > 0
    if (filter === 'approved') return p.status === 'approved'
    if (filter === 'ongoing') return p.status === 'ongoing'
    return true
  })

  if (loading) return <Loading />

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Projects</h1>
            <p className="text-gray-400">Explore, create, and collaborate on exciting projects</p>
          </div>
          <Link
            to="/projects/create"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition"
          >
            <Plus className="w-5 h-5" />
            Create Project
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-800">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'all'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            All Projects ({projects.length})
          </button>
          <button
            onClick={() => setActiveTab('my')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'my'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            My Projects ({myProjects.length})
          </button>
          <button
            onClick={() => setActiveTab('vacancies')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'vacancies'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Join Projects ({projects.filter(p => p.vacancies > 0).length})
          </button>
        </div>

        {/* Filter */}
        {activeTab === 'all' && (
          <div className="flex items-center gap-3 mb-6">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 text-white"
            >
              <option value="all">All Projects</option>
              <option value="vacancies">With Vacancies</option>
              <option value="approved">Approved</option>
              <option value="ongoing">Ongoing</option>
            </select>
          </div>
        )}

        {/* Projects Grid */}
        {activeTab === 'all' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map(project => (
              <ProjectCard key={project.id} project={project} onJoin={handleJoinProject} />
            ))}
          </div>
        )}

        {activeTab === 'my' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myProjects.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Award className="w-16 h-16 mx-auto mb-4 text-gray-700" />
                <p className="text-gray-500 mb-4">You haven't created any projects yet</p>
                <Link
                  to="/projects/create"
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition"
                >
                  <Plus className="w-5 h-5" />
                  Create Your First Project
                </Link>
              </div>
            ) : (
              myProjects.map(project => (
                <ProjectCard key={project.id} project={project} isOwner />
              ))
            )}
          </div>
        )}

        {activeTab === 'vacancies' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.filter(p => p.vacancies > 0).length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Users className="w-16 h-16 mx-auto mb-4 text-gray-700" />
                <p className="text-gray-500">No projects with vacancies at the moment</p>
              </div>
            ) : (
              projects
                .filter(p => p.vacancies > 0)
                .map(project => (
                  <ProjectCard key={project.id} project={project} onJoin={handleJoinProject} showJoinButton />
                ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function ProjectCard({ project, onJoin, isOwner, showJoinButton }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition">
      {project.image_url && (
        <img src={project.image_url} alt={project.title} className="w-full h-40 object-cover rounded-lg mb-4" />
      )}
      
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-xl font-bold">{project.title}</h3>
        <span className={`px-2 py-1 rounded text-xs ${
          project.status === 'approved' ? 'bg-green-600' :
          project.status === 'ongoing' ? 'bg-blue-600' :
          project.status === 'pending' ? 'bg-yellow-600' :
          project.status === 'completed' ? 'bg-purple-600' :
          'bg-red-600'
        }`}>
          {project.status}
        </span>
      </div>

      <p className="text-gray-400 text-sm mb-4 line-clamp-3">{project.description}</p>

      {project.skills_required && project.skills_required.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {project.skills_required.slice(0, 3).map(skill => (
            <span key={skill} className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-300">
              {skill}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-4 mb-4 text-sm text-gray-400">
        {project.vacancies > 0 && (
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{project.vacancies} slots</span>
          </div>
        )}
        {project.creator && (
          <span className="text-xs">By: {project.creator.username}</span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {project.github_url && (
          <a
            href={project.github_url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition"
          >
            <Github className="w-4 h-4" />
          </a>
        )}
        {project.demo_url && (
          <a
            href={project.demo_url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition"
          >
            <Globe className="w-4 h-4" />
          </a>
        )}
        
        {showJoinButton && project.vacancies > 0 && (
          <button
            onClick={() => onJoin(project.id)}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm transition"
          >
            <Users className="w-4 h-4" />
            Join Project
          </button>
        )}
        
        {isOwner && (
          <Link
            to={`/projects/${project.id}/edit`}
            className="flex-1 text-center bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg text-sm transition"
          >
            Edit
          </Link>
        )}
      </div>
    </div>
  )
}
