import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { Calendar, Plus, X } from 'lucide-react'

export default function CreateEventPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: '',
    location: '',
    image_url: '',
    tasks: []
  })
  const [taskInput, setTaskInput] = useState('')

  const defaultTasks = [
    'Design Event Poster',
    'Design Event Banner',
    'Event Photography',
    'Event Videography',
    'Social Media Posts',
    'Write Event Report',
    'Arrange Venue',
    'Send Invitations'
  ]

  const handleAddTask = (taskName) => {
    if (!formData.tasks.find(t => t.name === taskName)) {
      setFormData({
        ...formData,
        tasks: [...formData.tasks, { name: taskName, completed: false, assigned_to: null }]
      })
    }
  }

  const handleAddCustomTask = () => {
    if (taskInput.trim() && !formData.tasks.find(t => t.name === taskInput.trim())) {
      setFormData({
        ...formData,
        tasks: [...formData.tasks, { name: taskInput.trim(), completed: false, assigned_to: null }]
      })
      setTaskInput('')
    }
  }

  const handleRemoveTask = (taskName) => {
    setFormData({
      ...formData,
      tasks: formData.tasks.filter(t => t.name !== taskName)
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await api.post('/events', formData)
      alert('Event created! Waiting for approval.')
      navigate('/events')
    } catch (error) {
      alert('Failed to create event')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-purple-600 rounded-lg">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Create New Event</h1>
              <p className="text-gray-400">Plan an amazing event for the club</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-xl p-8 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Event Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Tech Talk: AI & Future"
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
              placeholder="Describe the event, agenda, and what attendees can expect..."
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white h-32 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Date & Time *
              </label>
              <input
                type="datetime-local"
                value={formData.event_date}
                onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Location *
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., Seminar Hall A"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Event Image URL
            </label>
            <input
              type="url"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              placeholder="https://example.com/event-image.jpg"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Tasks */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Event Tasks
            </label>
            
            {/* Default Tasks */}
            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-2">Quick Add:</p>
              <div className="flex flex-wrap gap-2">
                {defaultTasks.map(task => (
                  <button
                    key={task}
                    type="button"
                    onClick={() => handleAddTask(task)}
                    disabled={formData.tasks.find(t => t.name === task)}
                    className={`px-3 py-1 rounded-lg text-sm transition ${
                      formData.tasks.find(t => t.name === task)
                        ? 'bg-blue-600 text-white cursor-not-allowed'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    {formData.tasks.find(t => t.name === task) ? '✓ ' : '+ '}{task}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Task */}
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={taskInput}
                onChange={(e) => setTaskInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomTask())}
                placeholder="Add custom task..."
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={handleAddCustomTask}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            {/* Added Tasks */}
            <div className="space-y-2">
              {formData.tasks.map((task, idx) => (
                <div key={idx} className="flex items-center justify-between bg-gray-800 px-4 py-2 rounded-lg">
                  <span className="text-sm">{task.name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTask(task.name)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 py-3 rounded-lg font-medium transition"
            >
              {loading ? 'Creating...' : 'Create Event'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/events')}
              className="px-6 bg-gray-800 hover:bg-gray-700 py-3 rounded-lg transition"
            >
              Cancel
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center">
            Event will be sent for approval to Chair/Admin
          </p>
        </form>
      </div>
    </div>
  )
}
