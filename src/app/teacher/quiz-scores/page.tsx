'use client'
// FORCE DEPLOYMENT 5 - Major UI fix for quiz retake display

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { 
  Download, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  RotateCcw, 
  User, 
  Calendar,
  Filter,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  ArrowLeft
} from 'lucide-react'

interface QuizScore {
  id: string
  courseId: string
  courseTitle: string
  sectionId: string
  sectionTitle: string
  quizId: string
  quizTitle: string
  passingScore: number
  maxRetakes: number
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  latestScore: number
  bestScore: number
  totalAttempts: number
  isPassed: boolean
  latestAttemptDate: string
  allAttempts: Array<{
    id: string
    score: number
    completed: boolean
    isRetake: boolean
    createdAt: string
  }>
  retakePermission: {
    id: string
    retakeCount: number
    maxRetakes: number
    isActive: boolean
    allowedBy: string
    createdAt: string
  } | null
  canRetake: boolean
}

export default function QuizScoresPage() {
  const { user, token } = useAuth()
  const router = useRouter()
  const [quizScores, setQuizScores] = useState<QuizScore[]>([])
  const [loading, setLoading] = useState(true)
  const [filteredScores, setFilteredScores] = useState<QuizScore[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'passed' | 'failed' | 'not_attempted' | 'can_retake'>('all')
  const [selectedCourse, setSelectedCourse] = useState<string>('all')
  const [selectedQuiz, setSelectedQuiz] = useState<string>('all')
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    if (!user || user.role !== 'TEACHER') {
      router.push('/login')
      return
    }
    fetchQuizScores()
  }, [user, router])

  useEffect(() => {
    filterScores()
  }, [quizScores, searchTerm, filterStatus, selectedCourse, selectedQuiz])

  const fetchQuizScores = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/teacher/quiz-scores', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setQuizScores(data.quizScores || [])
      } else {
        console.error('Failed to fetch quiz scores')
      }
    } catch (error) {
      console.error('Error fetching quiz scores:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterScores = () => {
    let filtered = [...quizScores]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(score => 
        score.user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        score.user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        score.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        score.quizTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        score.courseTitle.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (filterStatus === 'passed') {
      filtered = filtered.filter(score => score.isPassed)
    } else if (filterStatus === 'failed') {
      filtered = filtered.filter(score => !score.isPassed)
    } else if (filterStatus === 'can_retake') {
      filtered = filtered.filter(score => score.canRetake)
    }

    // Course filter
    if (selectedCourse !== 'all') {
      filtered = filtered.filter(score => score.courseId === selectedCourse)
    }

    // Quiz filter
    if (selectedQuiz !== 'all') {
      filtered = filtered.filter(score => score.quizId === selectedQuiz)
    }

    setFilteredScores(filtered)
  }

  const handleRetakeAction = async (action: string, userId: string, quizId: string, maxRetakes?: number) => {
    try {
      setUpdating(`${userId}-${quizId}`)
      const response = await fetch('/api/teacher/quiz-scores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action,
          userId,
          quizId,
          maxRetakes
        })
      })

      if (response.ok) {
        await fetchQuizScores() // Refresh data
      } else {
        console.error('Failed to update retake permission')
      }
    } catch (error) {
      console.error('Error updating retake permission:', error)
    } finally {
      setUpdating(null)
    }
  }

  const exportToCSV = () => {
    const csvData = filteredScores.map(score => ({
      'Course': score.courseTitle,
      'Section': score.sectionTitle,
      'Quiz': score.quizTitle,
      'Student': `${score.user.firstName || ''} ${score.user.lastName || ''}`.trim() || score.user.email,
      'Email': score.user.email,
      'Latest Score': score.latestScore,
      'Best Score': score.bestScore,
      'Total Attempts': score.totalAttempts,
      'All Attempts': score.allAttempts
        .filter(attempt => attempt.score > 0 || attempt.completed)
        .map((attempt, index) => `Attempt ${index + 1}: ${attempt.score}%`).join(', '),
      'Status': score.isPassed ? 'Passed' : 'Failed',
      'Can Retake': score.canRetake ? 'Yes' : 'No',
      'Retake Count': score.retakePermission?.retakeCount || 0,
      'Max Retakes': score.retakePermission?.maxRetakes || score.maxRetakes,
      'Latest Attempt': new Date(score.latestAttemptDate).toLocaleDateString()
    }))

    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `quiz-scores-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const getUniqueCourses = () => {
    const courses = quizScores.reduce((acc, score) => {
      if (!acc.find(c => c.id === score.courseId)) {
        acc.push({ id: score.courseId, title: score.courseTitle })
      }
      return acc
    }, [] as { id: string; title: string }[])
    return courses
  }

  const getUniqueQuizzes = () => {
    const quizzes = quizScores.reduce((acc, score) => {
      if (!acc.find(q => q.id === score.quizId)) {
        acc.push({ 
          id: score.quizId, 
          title: score.quizTitle,
          courseTitle: score.courseTitle,
          sectionTitle: score.sectionTitle
        })
      }
      return acc
    }, [] as { id: string; title: string; courseTitle: string; sectionTitle: string }[])
    return quizzes
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading quiz scores...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/teacher')}
                className="btn-ghost flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5" />
                Back to Dashboard
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Quiz Scores Management</h1>
                <p className="mt-2 text-gray-600">View and manage student quiz scores and retake permissions</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={fetchQuizScores}
                className="btn-secondary flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
              <button
                onClick={exportToCSV}
                className="btn-primary flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="form-label">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search students..."
                  className="input-field pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="form-label">Quiz</label>
              <select
                className="input-field"
                value={selectedQuiz}
                onChange={(e) => setSelectedQuiz(e.target.value)}
              >
                <option value="all">All Quizzes</option>
                {getUniqueQuizzes().map(quiz => (
                  <option key={quiz.id} value={quiz.id}>
                    {quiz.title} ({quiz.courseTitle})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">Status</label>
              <select
                className="input-field"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as 'all' | 'passed' | 'failed' | 'not_attempted' | 'can_retake')}
              >
                <option value="all">All</option>
                <option value="passed">Passed</option>
                <option value="failed">Failed</option>
                <option value="not_attempted">Not Attempted</option>
                <option value="can_retake">Can Retake</option>
              </select>
            </div>
            <div>
              <label className="form-label">Course</label>
              <select
                className="input-field"
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
              >
                <option value="all">All Courses</option>
                {getUniqueCourses().map(course => (
                  <option key={course.id} value={course.id}>{course.title}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <div className="text-sm text-gray-500">
                Showing {filteredScores.length} of {quizScores.length} results
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quiz Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Scores
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Retake Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredScores.map((score) => (
                  <tr key={score.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#792024] to-[#103352] flex items-center justify-center">
                            <User className="h-5 w-5 text-white" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {score.user.firstName && score.user.lastName 
                              ? `${score.user.firstName} ${score.user.lastName}`
                              : score.user.email
                            }
                          </div>
                          <div className="text-sm text-gray-500">{score.user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{score.quizTitle}</div>
                      <div className="text-sm text-gray-500">{score.courseTitle}</div>
                      <div className="text-sm text-gray-500">{score.sectionTitle}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        {score.allAttempts
                          .filter(attempt => attempt.score > 0) // Only show attempts with actual scores
                          .map((attempt, index) => (
                            <div key={attempt.id} className="text-sm">
                              <span className="text-gray-600">Attempt {index + 1}:</span>
                              <span className={`ml-2 font-medium ${
                                attempt.score >= score.passingScore
                                  ? 'text-green-600'
                                  : 'text-red-600'
                              }`}>
                                {attempt.score}%
                              </span>
                              {attempt.isRetake && <span className="ml-1 text-xs text-gray-500">(R)</span>}
                            </div>
                          ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {score.isPassed ? (
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500 mr-2" />
                        )}
                        <span className={`text-sm font-medium ${
                          score.isPassed ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {score.isPassed ? 'Passed' : 'Failed'}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Passing: {score.passingScore}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {score.retakePermission ? (
                        <div>
                          <div className="text-sm text-gray-900">
                            {score.retakePermission.retakeCount}/{score.retakePermission.maxRetakes} retakes used
                          </div>
                          <div className="text-xs text-gray-500">
                            {score.canRetake ? 'Can retake' : 'No retakes left'}
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">No permission</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        {!score.isPassed && (
                          <>
                            {!score.retakePermission ? (
                              <button
                                onClick={() => handleRetakeAction('grant_retake', score.user.id, score.quizId)}
                                disabled={updating === `${score.user.id}-${score.quizId}`}
                                className="btn-primary text-xs py-1 px-3 disabled:opacity-50"
                              >
                                {updating === `${score.user.id}-${score.quizId}` ? (
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                ) : (
                                  'Grant Retake'
                                )}
                              </button>
                            ) : score.canRetake ? (
                              <button
                                onClick={() => handleRetakeAction('grant_retake', score.user.id, score.quizId)}
                                disabled={updating === `${score.user.id}-${score.quizId}`}
                                className="btn-primary text-xs py-1 px-3 disabled:opacity-50"
                              >
                                {updating === `${score.user.id}-${score.quizId}` ? (
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                ) : (
                                  'Grant Retake'
                                )}
                              </button>
                            ) : (
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                Max Retakes Used
                              </span>
                            )}
                          </>
                        )}
                        {score.isPassed && (
                          <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                            Passed
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredScores.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">No quiz scores found</div>
            <div className="text-gray-400 text-sm mt-2">
              {searchTerm || filterStatus !== 'all' || selectedCourse !== 'all' || selectedQuiz !== 'all'
                ? 'Try adjusting your filters'
                : 'Students need to take quizzes to see scores here. Once students attempt quizzes, their scores will appear in this table.'
              }
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
