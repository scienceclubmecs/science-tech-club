import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { Plus, X, Award } from 'lucide-react'

export default function CreateProjectPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    vacancies: 0,
    skills_required: [],
    github_url: '',
    demo_url: '',
    image_url: ''
  })
  const [skillInput, setSkillInput] = useState('')

  const handleAddSkill = () => {
    if (skillInput.trim() && !formData.skills_required.includes(skillInput.trim())) {
      setFormData({
        ...formData,
        skills_required: [...formData.skills_required, skillInput.trim()]
      })
      setSkillInput('')
    }
  }

  const handleRemoveSkill = (skill) => {
    setFormData({
      ...formData,
      skills_required: formData.skills_required.filter(s => s !== skill)
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await api.post('/projects', formData)
      alert('Project created! Waiting for faculty approval.')
      navigate('/projects')
    } catch (error) {
      alert('Failed to create project')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-600 rounded-lg">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Create New Project</h1>
              <p className="text-gray-400">Start your innovative project journey</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-xl p-8 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Project Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., AI-Powered Chatbot"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your project, its goals, and expected outcomes..."
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white h-32 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          {/* Vacancies */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Team Vacancies
            </label>
            <input
              type="number"
              min="0"
              max="10"
              value={formData.vacancies}
              onChange={(e) => setFormData({ ...formData, vacancies: parseInt(e.target.value) })}
              placeholder="0"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Number of team members you need</p>
          </div>

          {/* Skills Required */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Skills Required
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                placeholder="e.g., Python, React, ML"
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.skills_required.map(skill => (
                <span
                  key={skill}
                  className="flex items-center gap-2 px-3 py-1 bg-blue-600 rounded-full text-sm"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="hover:text-red-400"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* GitHub URL */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              GitHub Repository
            </label>
            <input
              type="url"
              value={formData.github_url}
              onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
              placeholder="https://github.com/username/repo"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Demo URL */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Demo/Live URL
            </label>
            <input
              type="url"
              value={formData.demo_url}
              onChange={(e) => setFormData({ ...formData, demo_url: e.target.value })}
              placeholder="https://demo.example.com"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Project Image URL
            </label>
            <input
              type="url"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              placeholder="https://example.com/image.jpg"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 py-3 rounded-lg font-medium transition"
            >
              {loading ? 'Creating...' : 'Create Project'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/projects')}
              className="px-6 bg-gray-800 hover:bg-gray-700 py-3 rounded-lg transition"
            >
              Cancel
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center">
            Your project will be reviewed by faculty members before approval
          </p>
        </form>
      </div>
    </div>
  )
}
