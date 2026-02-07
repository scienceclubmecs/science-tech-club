import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { courses } from '../services/api'
import { ArrowLeft, Clock, User, Calendar, Trash2 } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import ReactPlayer from 'react-player'
import Loading from '../components/Loading'

export default function CourseView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    loadCourse()
  }, [id])

  const loadCourse = async () => {
    try {
      const { data } = await courses.getOne(id)
      setCourse(data)
    } catch (err) {
      console.error('Load course error:', err)
      alert('Course not found')
      navigate('/courses')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this course?')) return

    setDeleting(true)
    try {
      await courses.delete(id)
      alert('Course deleted successfully')
      navigate('/courses')
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed')
      setDeleting(false)
    }
  }

  if (loading) return <Loading fullScreen />
  if (!course) return null

  const canDelete = user?.role === 'admin'

  return (
    <div className="min-h-screen bg-darker">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/courses')}
          className="flex items-center space-x-2 text-gray-400 hover:text-gray-100 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Courses</span>
        </button>

        {/* Video Player */}
        <div className="mb-8">
          <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-2xl">
            <ReactPlayer
              url={course.video_url}
              controls
              width="100%"
              height="100%"
              playing={false}
              config={{
                youtube: {
                  playerVars: { showinfo: 1 }
                }
              }}
            />
          </div>
        </div>

        {/* Course Info */}
        <div className="card">
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <span className="bg-primary text-black text-sm px-3 py-1 rounded-full font-semibold">
                  {course.category}
                </span>
                {course.duration > 0 && (
                  <span className="flex items-center space-x-1 text-gray-400 text-sm">
                    <Clock size={16} />
                    <span>{Math.floor(course.duration / 60)} minutes</span>
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-bold mb-3">{course.title}</h1>
              <p className="text-gray-400 text-lg leading-relaxed">
                {course.description || 'No description available'}
              </p>
            </div>

            {canDelete && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="btn-danger flex items-center space-x-2"
              >
                <Trash2 size={18} />
                <span>{deleting ? 'Deleting...' : 'Delete'}</span>
              </button>
            )}
          </div>

          {/* Meta Info */}
          <div className="flex flex-wrap gap-6 pt-6 border-t border-border">
            {course.creator && (
              <div className="flex items-center space-x-2 text-gray-400">
                <User size={18} />
                <span>Created by <span className="text-primary font-semibold">{course.creator.username}</span></span>
              </div>
            )}
            <div className="flex items-center space-x-2 text-gray-400">
              <Calendar size={18} />
              <span>{new Date(course.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
