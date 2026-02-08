import { useState, useEffect } from 'react'
import { BookOpen, Clock, Award } from 'lucide-react'
import api from '../services/api'

export default function CoursesPage() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      const { data } = await api.get('/courses')
      setCourses(data)
    } catch (error) {
      console.error('Failed to fetch courses:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black pt-20 px-4 flex items-center justify-center">
        <div className="text-white">Loading courses...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black pt-20 px-4 pb-12">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Learning Courses</h1>
          <p className="text-gray-400">Explore our curated tech courses</p>
        </div>

        {courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <BookOpen className="w-16 h-16 text-gray-700 mx-auto mb-4" />
            <p className="text-gray-500">No courses available yet</p>
          </div>
        )}
      </div>
    </div>
  )
}

function CourseCard({ course }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-blue-600 transition">
      <div className="flex items-start justify-between mb-4">
        <BookOpen className="w-8 h-8 text-blue-500" />
        <span className="text-xs bg-blue-600 px-3 py-1 rounded-full">{course.level}</span>
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{course.title}</h3>
      <p className="text-gray-400 text-sm mb-4">{course.description}</p>
      <div className="flex items-center gap-4 text-sm text-gray-500">
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          {course.duration}
        </div>
        <div className="flex items-center gap-1">
          <Award className="w-4 h-4" />
          Certificate
        </div>
      </div>
    </div>
  )
}
