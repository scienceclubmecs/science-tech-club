import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { courses } from '../services/api'
import { BookOpen, PlayCircle, Clock, Search, Filter, Sparkles } from 'lucide-react'
import Loading from '../components/Loading'

export default function Courses() {
  const [allCourses, setAllCourses] = useState([])
  const [filteredCourses, setFilteredCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  useEffect(() => {
    loadCourses()
  }, [])

  useEffect(() => {
    filterCourses()
  }, [searchQuery, selectedCategory, allCourses])

  const loadCourses = async () => {
    try {
      const { data } = await courses.getAll()
      setAllCourses(data)
      setFilteredCourses(data)
    } catch (err) {
      console.error('Load courses error:', err)
    } finally {
      setLoading(false)
    }
  }

  const filterCourses = () => {
    let filtered = allCourses

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(course => course.category === selectedCategory)
    }

    setFilteredCourses(filtered)
  }

  const categories = ['All', ...new Set(allCourses.map(c => c.category))]

  if (loading) return <Loading fullScreen />

  return (
    <div className="min-h-screen bg-darker">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-2">
            <BookOpen className="text-primary" size={32} />
            <h1 className="text-4xl font-bold gradient-text">Course Library</h1>
          </div>
          <p className="text-gray-400 text-lg">
            Explore our collection of video courses and tutorials
          </p>
        </div>

        {/* Search & Filter */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search courses..."
              className="input w-full pl-12 pr-4 py-3"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center space-x-3 overflow-x-auto pb-2">
            <Filter className="text-gray-500 flex-shrink-0" size={20} />
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                  selectedCategory === category
                    ? 'bg-primary text-black'
                    : 'bg-dark-card text-gray-400 hover:text-gray-100 hover:bg-gray-800'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Courses Grid */}
        {filteredCourses.length === 0 ? (
          <div className="card text-center py-16">
            <BookOpen className="mx-auto text-gray-600 mb-4" size={64} />
            <h3 className="text-2xl font-semibold mb-2">
              {searchQuery || selectedCategory !== 'All' ? 'No courses found' : 'No courses available'}
            </h3>
            <p className="text-gray-400 mb-6">
              {searchQuery || selectedCategory !== 'All'
                ? 'Try adjusting your search or filters'
                : 'Check back later for new content'}
            </p>
            {(searchQuery || selectedCategory !== 'All') && (
              <button
                onClick={() => {
                  setSearchQuery('')
                  setSelectedCategory('All')
                }}
                className="btn-primary"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Results Count */}
            <div className="mb-6">
              <p className="text-gray-400">
                Showing <span className="text-primary font-semibold">{filteredCourses.length}</span> course
                {filteredCourses.length !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Courses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function CourseCard({ course }) {
  return (
    <Link to={`/courses/${course.id}`} className="card-hover group">
      {/* Thumbnail */}
      <div className="relative mb-4 overflow-hidden rounded-lg bg-dark aspect-video">
        <img
          src={course.thumbnail_url || 'https://via.placeholder.com/640x360?text=Course'}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/640x360?text=Course'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
        
        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform">
            <PlayCircle className="text-black" size={32} />
          </div>
        </div>

        {/* Category Badge */}
        <div className="absolute top-3 right-3 bg-primary text-black text-xs px-3 py-1 rounded-full font-semibold">
          {course.category}
        </div>

        {/* Duration */}
        {course.duration > 0 && (
          <div className="absolute bottom-3 left-3 flex items-center space-x-1 bg-black/70 backdrop-blur-sm px-2 py-1 rounded text-white text-sm">
            <Clock size={14} />
            <span>{Math.floor(course.duration / 60)}min</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div>
        <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
          {course.title}
        </h3>
        <p className="text-gray-400 text-sm line-clamp-2 mb-3">
          {course.description || 'No description available'}
        </p>

        {/* Creator */}
        {course.creator && (
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <div className="w-6 h-6 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
              <span className="text-black font-semibold text-xs">
                {course.creator.username?.charAt(0).toUpperCase()}
              </span>
            </div>
            <span>by {course.creator.username}</span>
          </div>
        )}
      </div>
    </Link>
  )
}
