'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Clock, CheckCircle, XCircle, AlertCircle, HelpCircle, ChevronLeft, ChevronRight } from 'lucide-react'

interface QuizQuestion {
  id: string
  type: 'multiple-choice' | 'true-false' | 'short-answer' | 'essay'
  question: string
  options?: string[]
  shuffledOptions?: string[]
  correctAnswer?: string
  points?: number
}

interface Quiz {
  id: string
  title: string
  description: string
  questions: QuizQuestion[]
  timeLimit: number | null
  passingScore: number
}

interface QuizAttempt {
  id: string
  score: number
  completed: boolean
  createdAt: string
  isRetake?: boolean
}

interface RetakePermission {
  retakeCount: number
  maxRetakes: number
  isActive: boolean
}

export default function StudentQuiz({ params }: { params: Promise<{ id: string }> }) {
  const { user, token } = useAuth()
  const router = useRouter()
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [attempts, setAttempts] = useState<QuizAttempt[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Array<{ answer: string }>>([])
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [quizId, setQuizId] = useState<string | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [lastScore, setLastScore] = useState<number | null>(null)
  const [courseId, setCourseId] = useState<string | null>(null)
  const [alreadyAttempted, setAlreadyAttempted] = useState(false)
  const [canRetake, setCanRetake] = useState(false)
  const [retakePermission, setRetakePermission] = useState<RetakePermission | null>(null)

  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params
      setQuizId(resolvedParams.id)
    }
    resolveParams()
  }, [params])

  useEffect(() => {
    if (!user || user.role !== 'STUDENT') {
      router.push('/login')
      return
    }
    if (quizId) {
      fetchQuiz()
    }
  }, [user, router, quizId, token])

  useEffect(() => {
    if (quiz && quiz.timeLimit && timeLeft !== null) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev === null || prev <= 1) {
            handleSubmitQuiz()
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [quiz, timeLeft])

  const fetchQuiz = async () => {
    if (!quizId) return
    
    try {
      const response = await fetch(`/api/student/quiz/${quizId}/attempt`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setQuiz(data.quiz)
        setAttempts(data.attempts)
        setCourseId(data.courseId)
        setAlreadyAttempted(data.alreadyAttempted || false)
        setCanRetake(data.canRetake || false)
        setRetakePermission(data.retakePermission || null)
        
        // If already attempted and can't retake, show results immediately
        if (data.alreadyAttempted && !data.canRetake) {
          setShowResults(true)
          setLastScore(data.attempts[0]?.score || 0)
          return
        }
        
        // Initialize answers array
        if (data.quiz.questions) {
          setAnswers(new Array(data.quiz.questions.length).fill(null).map(() => ({ answer: '' })))
        }
        
        // Set timer if time limit exists
        if (data.quiz.timeLimit) {
          setTimeLeft(data.quiz.timeLimit * 60) // Convert minutes to seconds
        }
      } else {
        const errorData = await response.json()
        alert(`Error: ${errorData.error}`)
        router.push('/student')
      }
    } catch (error) {
      console.error('Error fetching quiz:', error)
      alert('Network error occurred')
      router.push('/student')
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerChange = (questionIndex: number, answer: string) => {
    const newAnswers = [...answers]
    newAnswers[questionIndex] = { answer }
    setAnswers(newAnswers)
  }

  const handleSubmitQuiz = async () => {
    if (submitting) return
    
    setSubmitting(true)
    try {
      const response = await fetch(`/api/student/quiz/${quizId}/attempt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ answers })
      })
      
      if (response.ok) {
        const data = await response.json()
        setLastScore(data.attempt.score)
        setShowResults(true)
        await fetchQuiz() // Refresh attempts
      } else {
        const errorData = await response.json()
        alert(`Error: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error submitting quiz:', error)
      alert('Network error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getBestScore = () => {
    if (attempts.length === 0) return null
    return Math.max(...attempts.map(a => a.score))
  }

  const isPassed = (score: number) => {
    return quiz && score >= quiz.passingScore
  }

  if (!user) {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#792024]"></div>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Quiz not found</h2>
          <button
            onClick={() => router.push('/student')}
            className="btn-primary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  if (alreadyAttempted && lastScore !== null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <div className="max-w-4xl mx-auto py-8 sm:px-6 lg:px-8">
          <div className="card text-center">
            <div className="mb-6">
              {isPassed(lastScore) ? (
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              ) : (
                <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              )}
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {isPassed(lastScore) ? 'Congratulations!' : 'Quiz Completed!'}
              </h1>
              <p className="text-gray-600 mb-4">
                {isPassed(lastScore) 
                  ? 'You passed the quiz!' 
                  : `You need ${quiz.passingScore}% to pass.`
                }
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-blue-600 mr-2" />
                  <p className="text-blue-800 text-sm">
                    {canRetake 
                      ? `You can retake this quiz. Retakes used: ${retakePermission?.retakeCount || 0}/${retakePermission?.maxRetakes || 0}`
                      : 'You have already taken this quiz. Retake permission is required.'
                    }
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{lastScore}%</div>
                  <div className="text-sm text-gray-600">Your Score</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{quiz.passingScore}%</div>
                  <div className="text-sm text-gray-600">Passing Score</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">10</div>
                  <div className="text-sm text-gray-600">Total Questions</div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              {canRetake && (
                <button
                  onClick={() => {
                    setShowResults(false)
                    setAlreadyAttempted(false)
                    setLastScore(null)
                    setAnswers(new Array(quiz.questions.length).fill(null).map(() => ({ answer: '' })))
                    setCurrentQuestion(0)
                    if (quiz.timeLimit) {
                      setTimeLeft(quiz.timeLimit * 60)
                    }
                  }}
                  className="btn-primary"
                >
                  Retake Quiz
                </button>
              )}
              <button
                onClick={() => courseId ? router.push(`/student/course/${courseId}`) : router.push('/student')}
                className="btn-outline"
              >
                Back to Course
              </button>
              <button
                onClick={() => router.push('/student')}
                className="btn-primary"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (showResults && lastScore !== null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <div className="max-w-4xl mx-auto py-8 sm:px-6 lg:px-8">
          <div className="card text-center">
            <div className="mb-6">
              {isPassed(lastScore) ? (
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              ) : (
                <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              )}
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {isPassed(lastScore) ? 'Congratulations!' : 'Quiz Completed!'}
              </h1>
              <p className="text-gray-600 mb-4">
                {isPassed(lastScore) 
                  ? 'You passed the quiz!' 
                  : `You need ${quiz.passingScore}% to pass.`
                }
              </p>
              {alreadyAttempted && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-blue-600 mr-2" />
                    <p className="text-blue-800 text-sm">
                      You have already taken this quiz. Only one attempt is allowed per quiz.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{lastScore}%</div>
                  <div className="text-sm text-gray-600">Your Score</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{quiz.passingScore}%</div>
                  <div className="text-sm text-gray-600">Passing Score</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{quiz.questions.length}</div>
                  <div className="text-sm text-gray-600">Total Questions</div>
                </div>
              </div>
            </div>


            <div className="flex gap-4 justify-center">
              <button
                onClick={() => courseId ? router.push(`/student/course/${courseId}`) : router.push('/student')}
                className="btn-outline"
              >
                Back to Course
              </button>
              <button
                onClick={() => router.push('/student')}
                className="btn-primary"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const currentQ = quiz.questions[currentQuestion]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/student')}
                className="btn-ghost flex items-center gap-2"
              >
                <ArrowLeft className="h-5 w-5" />
                Back to Dashboard
              </button>
              <div className="h-px bg-gray-300 w-8"></div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
                <p className="text-gray-600">{quiz.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {timeLeft !== null && (
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <Clock className="h-5 w-5" />
                  <span className={timeLeft < 300 ? 'text-red-600' : 'text-gray-900'}>
                    {formatTime(timeLeft)}
                  </span>
                </div>
              )}
              <div className="text-sm text-gray-600">
                Question {currentQuestion + 1} of {quiz.questions.length}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="card">
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>{Math.round(((currentQuestion + 1) / quiz.questions.length) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-[#792024] h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Question */}
          <div className="mb-8">
            <div className="flex items-start gap-3 mb-4">
              <HelpCircle className="h-6 w-6 text-[#792024] mt-1 flex-shrink-0" />
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {currentQ.question}
                </h2>
                <p className="text-sm text-gray-600">
                  {currentQ.type === 'multiple-choice' && 'Select the correct answer'}
                  {currentQ.type === 'true-false' && 'Select True or False'}
                  {currentQ.type === 'short-answer' && 'Type your answer'}
                  {currentQ.type === 'essay' && 'Write your detailed answer'}
                </p>
              </div>
            </div>

            {/* Answer Options */}
            <div className="space-y-3">
              {currentQ.type === 'multiple-choice' && (currentQ.shuffledOptions || currentQ.options) && (
                (currentQ.shuffledOptions || currentQ.options)!.map((option, index) => (
                  <label key={index} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name={`question-${currentQuestion}`}
                      value={index.toString()}
                      checked={answers[currentQuestion]?.answer === index.toString()}
                      onChange={(e) => handleAnswerChange(currentQuestion, e.target.value)}
                      className="h-4 w-4 text-[#792024] focus:ring-[#792024]"
                    />
                    <span className="text-gray-900">{option}</span>
                  </label>
                ))
              )}

              {currentQ.type === 'true-false' && (
                <div className="space-y-3">
                  {['True', 'False'].map((option) => (
                    <label key={option} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="radio"
                        name={`question-${currentQuestion}`}
                        value={option}
                        checked={answers[currentQuestion]?.answer === option}
                        onChange={(e) => handleAnswerChange(currentQuestion, e.target.value)}
                        className="h-4 w-4 text-[#792024] focus:ring-[#792024]"
                      />
                      <span className="text-gray-900">{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {(currentQ.type === 'short-answer' || currentQ.type === 'essay') && (
                <textarea
                  value={answers[currentQuestion]?.answer || ''}
                  onChange={(e) => handleAnswerChange(currentQuestion, e.target.value)}
                  placeholder={currentQ.type === 'short-answer' ? 'Enter your answer...' : 'Write your detailed answer...'}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#792024] focus:border-transparent resize-none"
                  rows={currentQ.type === 'essay' ? 6 : 3}
                />
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
              disabled={currentQuestion === 0}
              className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>

            <div className="text-sm text-gray-600">
              Question {currentQuestion + 1} of {quiz.questions.length}
            </div>

            {currentQuestion === quiz.questions.length - 1 ? (
              <button
                onClick={handleSubmitQuiz}
                disabled={submitting || !answers[currentQuestion]?.answer}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Submitting...
                  </>
                ) : (
                  'Submit Quiz'
                )}
              </button>
            ) : (
              <button
                onClick={() => setCurrentQuestion(Math.min(quiz.questions.length - 1, currentQuestion + 1))}
                disabled={!answers[currentQuestion]?.answer}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Warning for incomplete answers */}
          {!answers[currentQuestion]?.answer && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm text-yellow-800">
                Please answer this question before proceeding.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
