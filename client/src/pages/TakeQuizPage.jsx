import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { Clock, AlertCircle, CheckCircle } from 'lucide-react'
import Loading from '../components/Loading'

export default function TakeQuizPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [quiz, setQuiz] = useState(null)
  const [loading, setLoading] = useState(true)
  const [answers, setAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState(null)

  useEffect(() => {
    fetchQuiz()
  }, [id])

  useEffect(() => {
    if (timeLeft <= 0 && quiz && !submitted) {
      handleSubmit()
      return
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft, quiz, submitted])

  const fetchQuiz = async () => {
    try {
      const { data } = await api.get(`/quizzes/${id}`)
      setQuiz(data)
      setTimeLeft(data.time_limit * 60) // Convert minutes to seconds
    } catch (error) {
      console.error('Failed to fetch quiz:', error)
      alert('Quiz not found')
      navigate('/quizzes')
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerSelect = (questionIndex, answerIndex) => {
    setAnswers({
      ...answers,
      [questionIndex]: answerIndex
    })
  }

  const handleSubmit = async () => {
    if (submitted) return

    const confirmed = window.confirm('Are you sure you want to submit? You cannot change answers after submission.')
    if (!confirmed && timeLeft > 0) return

    setSubmitted(true)

    try {
      const answerArray = Object.keys(answers).sort().map(key => answers[key])
      const { data } = await api.post(`/quizzes/${id}/submit`, { answers: answerArray })
      setResult(data)
    } catch (error) {
      alert('Failed to submit quiz')
      setSubmitted(false)
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) return <Loading />

  if (submitted && result) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
          <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-400" />
          <h1 className="text-3xl font-bold mb-4">Quiz Submitted!</h1>
          
          <div className="mb-6">
            <div className="text-5xl font-bold mb-2 text-blue-400">{result.score}%</div>
            <p className="text-gray-400">Your Score</p>
          </div>

          <div className="bg-gray-800 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-400">
              You scored {result.score}% in {quiz.title}
            </p>
          </div>

          <button
            onClick={() => navigate('/quizzes')}
            className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg transition"
          >
            Back to Quizzes
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">{quiz.title}</h1>
              <p className="text-gray-400 text-sm">{quiz.description}</p>
            </div>
            <div className="text-center">
              <div className={`text-3xl font-bold ${timeLeft < 60 ? 'text-red-400' : 'text-blue-400'}`}>
                {formatTime(timeLeft)}
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                <span>Time Left</span>
              </div>
            </div>
          </div>
        </div>

        {/* Warning */}
        {timeLeft < 60 && (
          <div className="bg-red-900/20 border border-red-700 rounded-xl p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-400 font-medium">Time Running Out!</p>
              <p className="text-red-300 text-sm">Quiz will auto-submit when time expires</p>
            </div>
          </div>
        )}

        {/* Questions */}
        <div className="space-y-6 mb-6">
          {quiz.questions.map((question, qIndex) => (
            <div key={qIndex} className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <div className="flex items-start gap-3 mb-4">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-sm">
                  {qIndex + 1}
                </span>
                <p className="font-medium flex-1">{question.question}</p>
              </div>

              <div className="space-y-3 ml-11">
                {question.options.map((option, oIndex) => (
                  <button
                    key={oIndex}
                    onClick={() => handleAnswerSelect(qIndex, oIndex)}
                    className={`w-full text-left px-4 py-3 rounded-lg border transition ${
                      answers[qIndex] === oIndex
                        ? 'bg-blue-600 border-blue-500'
                        : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <span className="font-medium mr-2">{String.fromCharCode(65 + oIndex)}.</span>
                    {option}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-medium">Ready to submit?</p>
              <p className="text-sm text-gray-400">
                {Object.keys(answers).length} / {quiz.questions.length} questions answered
              </p>
            </div>
            <button
              onClick={handleSubmit}
              disabled={Object.keys(answers).length === 0}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed px-8 py-3 rounded-lg font-medium transition"
            >
              Submit Quiz
            </button>
          </div>
          
          {Object.keys(answers).length < quiz.questions.length && (
            <p className="text-xs text-yellow-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              You haven't answered all questions yet
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
