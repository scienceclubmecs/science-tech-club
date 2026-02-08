import { useState, useEffect } from 'react'
import { X, Plus, CheckSquare, Trash2, Calendar, Flag } from 'lucide-react'
import api from '../services/api'

export default function TasksModal({ isOpen, onClose }) {
  const [tasks, setTasks] = useState([])
  const [newTask, setNewTask] = useState({ title: '', priority: 'medium', due_date: '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchTasks()
    }
  }, [isOpen])

  const fetchTasks = async () => {
    try {
      const { data } = await api.get('/tasks')
      setTasks(data)
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
    }
  }

  const handleAddTask = async () => {
    if (!newTask.title.trim()) return

    setLoading(true)
    try {
      const { data } = await api.post('/tasks', newTask)
      setTasks([data, ...tasks])
      setNewTask({ title: '', priority: 'medium', due_date: '' })
    } catch (error) {
      alert('Failed to add task')
    } finally {
      setLoading(false)
    }
  }

  const toggleTask = async (taskId, completed) => {
    try {
      await api.put(`/tasks/${taskId}`, { completed: !completed })
      setTasks(tasks.map(t => t.id === taskId ? { ...t, completed: !completed } : t))
    } catch (error) {
      alert('Failed to update task')
    }
  }

  const deleteTask = async (taskId) => {
    if (!confirm('Delete this task?')) return
    
    try {
      await api.delete(`/tasks/${taskId}`)
      setTasks(tasks.filter(t => t.id !== taskId))
    } catch (error) {
      alert('Failed to delete task')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <CheckSquare className="w-6 h-6 text-blue-400" />
            <h2 className="text-2xl font-bold text-white">My Tasks</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Add Task Form */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Add a new task..."
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
              className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
            <select
              value={newTask.priority}
              onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
              className="px-3 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <button
              onClick={handleAddTask}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 px-6 py-3 rounded-lg transition"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tasks List */}
        <div className="flex-1 overflow-y-auto p-6">
          {tasks.length === 0 ? (
            <div className="text-center py-12">
              <CheckSquare className="w-16 h-16 mx-auto mb-4 text-gray-700" />
              <p className="text-gray-500">No tasks yet. Add your first task!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={`bg-gray-800 border border-gray-700 rounded-lg p-4 transition ${
                    task.completed ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggleTask(task.id, task.completed)}
                      className={`mt-1 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition ${
                        task.completed
                          ? 'bg-green-600 border-green-600'
                          : 'border-gray-600 hover:border-blue-500'
                      }`}
                    >
                      {task.completed && <CheckSquare className="w-4 h-4 text-white" />}
                    </button>

                    <div className="flex-1">
                      <h3
                        className={`font-medium ${
                          task.completed ? 'line-through text-gray-500' : 'text-white'
                        }`}
                      >
                        {task.title}
                      </h3>
                      
                      <div className="flex items-center gap-3 mt-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            task.priority === 'high'
                              ? 'bg-red-600'
                              : task.priority === 'medium'
                              ? 'bg-yellow-600'
                              : 'bg-green-600'
                          }`}
                        >
                          {task.priority}
                        </span>
                        
                        {task.due_date && (
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <Calendar className="w-3 h-3" />
                            {new Date(task.due_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => deleteTask(task.id)}
                      className="text-gray-500 hover:text-red-500 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Stats */}
        <div className="p-6 border-t border-gray-800 bg-gray-900/50">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">
              {tasks.filter(t => t.completed).length} of {tasks.length} completed
            </span>
            <span className="text-gray-400">
              {tasks.filter(t => !t.completed && t.priority === 'high').length} high priority pending
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
