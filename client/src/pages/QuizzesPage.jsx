import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { BookOpen, Clock, Trophy, Play, Award } from 'lucide-react'
import Loading from '../components/Loading'

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState([])
  const [mySubmissions, setMySubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchQuizzes()
  }, [])

  const fetchQuizzes = async () => {
    try {
      const [quizzesRes, submissionsRes] = await Promise.all([
        api.get('/quizzes'),
        api.get('/quizzes/my-submissions')
      ])
      setQuizzes(quizzesRes.data.filter(q => q.status === 'published'))
      setMySubmissions(submissionsRes.data)
    } catch (error) {
      console.error('Failed to fetch quizzes:', error)
    } finally {
      setLoading(false)
    }
  }

  const hasAttempted = (quizId) => {
    return mySubmissions.some(s => s.quiz_id === quizId)
  }

  const getScore = (quizId) => {
    const submission = mySubmissions.find(s => s.quiz_id === quizId)
    return submission?.score
  }

  const filteredQuizzes = quizzes.filter(q => {
    if (filter === 'all') return true
    if (filter === 'attempted') return hasAttempted(q.id)
    if (filter === 'new') return !hasAttempted(q.id)
    return true
  })

  if (loading) return <Loading />

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Quizzes</h1>
          <p className="text-gray-400">Test your knowledge and compete with peers</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-xl">
            <BookOpen className="w-8 h-8 mb-4" />
            <h3 className="text-2xl font-bold">{quizzes.length}</h3>
            <p className="text-blue-100">Available Quizzes</p>
          </div>

          <div className="bg-gradient-to-br from-green-600 to-green-800 p-6 rounded-xl">
            <Trophy className="w-8 h-8 mb-4" />
            <h3 className="text-2xl font-bold">{mySubmissions.length}</h3>
            <p className="text-green-100">Completed</p>
          </div>

          <div className="bg-gradient-to-br from-purple-600 to-purple-800 p-6 rounded-xl">
            <Award className="w-8 h-8 mb-4" />
            <h3 className="text-2xl font-bold">
              {mySubmissions.length > 0 
                ? Math.round(mySubmissions.reduce((acc, s) => acc + (s.score || 0), 0) / mySubmissions.length) 
                : 0}%
            </h3>
            <p className="text-purple-100">Average Score</p>
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'all' ? 'bg-blue-600' : 'bg-gray-800 hover:bg-gray-700'
            }`}
          >
            All Quizzes
          </button>
          <button
            onClick={() => setFilter('new')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'new' ? 'bg-blue-600' : 'bg-gray-800 hover:bg-gray-700'
            }`}
          >
            New
          </button>
          <button
            onClick={() => setFilter('attempted')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'attempted' ? 'bg-blue-600' : 'bg-gray-800 hover:bg-gray-700'
            }`}
          >
            Attempted
          </button>
        </div>

        {/* Quizzes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuizzes.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-700" />
              <p className="text-gray-500">No quizzes available</p>
            </div>
          ) : (
            filteredQuizzes.map(quiz => (
              <QuizCard
                key={quiz.id}
                quiz={quiz}
                attempted={hasAttempted(quiz.id)}
                score={getScore(quiz.id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function QuizCard({ quiz, attempted, score }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold mb-2">{quiz.title}</h3>
          <p className="text-gray-400 text-sm line-clamp-2">{quiz.description}</p>
        </div>
        {attempted && (
          <div className="ml-4 text-center">
            <div className="text-2xl font-bold text-green-400">{score}%</div>
            <div className="text-xs text-gray-500">Score</div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 mb-4 text-sm text-gray-400">
        <div className="flex items-center gap-1">
          <BookOpen className="w-4 h-4" />
          <span>{quiz.questions?.length || 0} questions</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          <span>{quiz.time_limit} min</span>
        </div>
      </div>

      {quiz.department && quiz.year && (
        <div className="flex gap-2 mb-4">
          <span className="px-2 py-1 bg-blue-600 rounded text-xs">{quiz.department}</span>
          <span className="px-2 py-1 bg-purple-600 rounded text-xs">Year {quiz.year}</span>
        </div>
      )}

      <Link
        to={`/quizzes/${quiz.id}`}
        className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 py-2 rounded-lg transition"
      >
        <Play className="w-4 h-4" />
        {attempted ? 'Retake Quiz' : 'Start Quiz'}
      </Link>
    </div>
  )
}
