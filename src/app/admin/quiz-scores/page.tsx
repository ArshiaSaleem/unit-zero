'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { 
  Search, 
  Download, 
  Filter, 
  Users, 
  BookOpen, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock,
  RefreshCw,
  Eye,
  EyeOff,
  ArrowLeft,
  RotateCcw,
  UserCheck,
  UserX
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
  latestAttemptDate: string | null
  hasAttempted: boolean
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

export default function AdminQuizScores() {
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
    if (!user || user.role !== 'ADMIN') {
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
      const response = await fetch('/api/admin/quiz-scores', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setQuizScores(data.quizScores || [])
      } else {
        // Handle error gracefully without showing console error for empty data
        const errorData = await response.json().catch(() => ({}))
        if (response.status === 500) {
          console.log('No quiz scores available yet')
        } else {
          console.error('Failed to fetch quiz scores:', errorData.error || 'Unknown error')
        }
        setQuizScores([])
      }
    } catch (error) {
      console.error('Error fetching quiz scores:', error)
      setQuizScores([])
    } finally {
      setLoading(false)
    }
  }

  const filterScores = () => {
    let filtered = [...(quizScores || [])]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(score => 
        score?.user?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        score?.user?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        score?.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        score?.quizTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        score?.courseTitle?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (filterStatus === 'passed') {
      filtered = filtered.filter(score => score.isPassed)
    } else if (filterStatus === 'failed') {
      filtered = filtered.filter(score => score.hasAttempted && !score.isPassed)
    } else if (filterStatus === 'not_attempted') {
      filtered = filtered.filter(score => !score.hasAttempted)
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

  const handleAdminRetakeAction = async (action: 'grant' | 'revoke', userId: string, quizId: string, studentName: string) => {
    try {
      setUpdating(`${userId}-${quizId}`)

      const response = await fetch('/api/admin/quiz-retake', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action,
          userId,
          quizId
        })
      })

      if (response.ok) {
        const data = await response.json()
        alert(data.message)
        await fetchQuizScores() // Refresh data
      } else {
        const errorData = await response.json()
        alert(`Failed to ${action} retake permission: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error(`Error ${action}ing retake permission:`, error)
      alert(`Failed to ${action} retake permission`)
    } finally {
      setUpdating(null)
    }
  }



  const exportToCSV = () => {
    const headers = [
      'Student Name',
      'Email',
      'Course',
      'Section',
      'Quiz',
      'Latest Score (%)',
      'Best Score (%)',
      'Total Attempts',
      'Status',
      'Passing Score (%)',
      'Has Attempted',
      'Can Retake',
      'Retake Count',
      'Last Attempt Date'
    ]

    const csvData = filteredScores.map(score => [
      `${score?.user?.firstName || ''} ${score?.user?.lastName || ''}`,
      score?.user?.email || '',
      score?.courseTitle || '',
      score?.sectionTitle || '',
      score?.quizTitle || '',
      score?.latestScore || 0,
      score?.bestScore || 0,
      score?.totalAttempts || 0,
      score?.isPassed ? 'Passed' : (score?.hasAttempted ? 'Failed' : 'Not Attempted'),
      score?.passingScore || 0,
      score?.hasAttempted ? 'Yes' : 'No',
      score?.canRetake ? 'Yes' : 'No',
      score?.retakePermission?.retakeCount || 0,
      score?.latestAttemptDate ? new Date(score.latestAttemptDate).toLocaleDateString() : 'N/A'
    ])

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `admin-quiz-scores-${new Date().toISOString().split('T')[0]}.csv`
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

  const getStatusIcon = (score: QuizScore) => {
    if (!score.hasAttempted) {
      return <Clock className="h-4 w-4 text-gray-400" />
    }
    return score.isPassed ? 
      <CheckCircle className="h-4 w-4 text-green-500" /> : 
      <XCircle className="h-4 w-4 text-red-500" />
  }

  const getStatusText = (score: QuizScore) => {
    if (!score.hasAttempted) return 'Not Attempted'
    return score.isPassed ? 'Passed' : 'Failed'
  }

  const getStatusColor = (score: QuizScore) => {
    if (!score.hasAttempted) return 'text-gray-500 bg-gray-100'
    return score.isPassed ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
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
                onClick={() => router.push('/admin')}
                className="btn-ghost flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5" />
                Back to Dashboard
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Quiz Scores Management</h1>
                <p className="mt-2 text-gray-600">View and manage all student quiz scores across all courses</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={exportToCSV}
                className="btn-primary flex items-center"
                disabled={filteredScores.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </button>
              <button
                onClick={fetchQuizScores}
                className="btn-outline flex items-center"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="stat-card">
            <div className="flex items-center">
              <div className="stat-icon bg-gradient-to-br from-blue-400 to-blue-500 text-white">
                <Users className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <div className="stat-value">{filteredScores.length}</div>
                <div className="stat-label">Total Records</div>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center">
              <div className="stat-icon bg-gradient-to-br from-green-400 to-green-500 text-white">
                <CheckCircle className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <div className="stat-value">
                  {filteredScores.filter(s => s.isPassed).length}
                </div>
                <div className="stat-label">Passed</div>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center">
              <div className="stat-icon bg-gradient-to-br from-red-400 to-red-500 text-white">
                <XCircle className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <div className="stat-value">
                  {filteredScores.filter(s => s.hasAttempted && !s.isPassed).length}
                </div>
                <div className="stat-label">Failed</div>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center">
              <div className="stat-icon bg-gradient-to-br from-gray-400 to-gray-500 text-white">
                <Clock className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <div className="stat-value">
                  {filteredScores.filter(s => !s.hasAttempted).length}
                </div>
                <div className="stat-label">Not Attempted</div>
              </div>
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
                  placeholder="Search students, quizzes, courses..."
                  className="input-field pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
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
                    Course & Quiz
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
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center">
                            <span className="text-white font-medium text-sm">
                              {score.user.firstName?.charAt(0) || ''}{score.user.lastName?.charAt(0) || ''}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {score.user.firstName} {score.user.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{score.user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{score.courseTitle}</div>
                      <div className="text-sm text-gray-500">{score.sectionTitle}</div>
                      <div className="text-sm text-gray-500">{score.quizTitle}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        Latest: <span className="font-medium">{score.latestScore}%</span>
                      </div>
                      <div className="text-sm text-gray-500">
                        Best: <span className="font-medium">{score.bestScore}%</span>
                      </div>
                      <div className="text-sm text-gray-500">
                        Attempts: <span className="font-medium">{score.totalAttempts}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(score)}
                        <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(score)}`}>
                          {getStatusText(score)}
                        </span>
                      </div>
                      {score.latestAttemptDate && (
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(score.latestAttemptDate).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {score.retakePermission ? (
                        <div>
                          <div>Used: {score.retakePermission.retakeCount}/{score.retakePermission.maxRetakes}</div>
                          <div className={`text-xs ${score.retakePermission.isActive ? 'text-green-600' : 'text-red-600'}`}>
                            {score.retakePermission.isActive ? 'Active' : 'Inactive'}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">No permission</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex flex-col space-y-2">
                        {/* Admin Super Powers - Always Available */}
                        <div className="flex space-x-2">
                          {!score.retakePermission?.isActive ? (
                            <button
                              onClick={() => handleAdminRetakeAction('grant', score.user.id, score.quizId, `${score.user.firstName} ${score.user.lastName}`)}
                              className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                              disabled={updating === `${score.user.id}-${score.quizId}`}
                            >
                              <UserCheck className="h-3 w-3 mr-1" />
                              {updating === `${score.user.id}-${score.quizId}` ? 'Granting...' : 'Grant Retake'}
                            </button>
                          ) : (
                            <button
                              onClick={() => handleAdminRetakeAction('revoke', score.user.id, score.quizId, `${score.user.firstName} ${score.user.lastName}`)}
                              className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                              disabled={updating === `${score.user.id}-${score.quizId}`}
                            >
                              <UserX className="h-3 w-3 mr-1" />
                              {updating === `${score.user.id}-${score.quizId}` ? 'Revoking...' : 'Revoke Retake'}
                            </button>
                          )}
                        </div>
                        
                        {/* Status Indicator */}
                        <div className="text-xs">
                          {!score.hasAttempted ? (
                            <span className="text-gray-400">No attempts yet</span>
                          ) : score.isPassed ? (
                            <span className="text-green-600 font-medium">✓ Passed</span>
                          ) : (
                            <span className="text-red-600 font-medium">✗ Failed</span>
                          )}
                        </div>
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
                : 'No quiz scores available yet. Students need to take quizzes to see scores here.'
              }
            </div>
          </div>
        )}
      </div>

    </div>
  )
}
