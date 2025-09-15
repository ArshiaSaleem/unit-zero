'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { 
  BookOpen, 
  Users, 
  LogOut, 
  Lock, 
  Unlock, 
  Eye, 
  EyeOff,
  ChevronRight,
  ChevronDown,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  BarChart3,
  ExternalLink
} from 'lucide-react'

interface Course {
  id: string
  title: string
  description: string | null
  isPublished: boolean
  sections: Section[]
  _count: {
    enrollments: number
  }
}

interface Section {
  id: string
  title: string
  description: string | null
  order: number
  isPublished: boolean
  isLocked: boolean
  lessons: Lesson[]
  quizzes: Quiz[]
}

interface Lesson {
  id: string
  title: string
  content: string | null
  order: number
  isPublished: boolean
  isLocked: boolean
  subLessons: SubLesson[]
}

interface SubLesson {
  id: string
  title: string
  content: string | null
  order: number
  isPublished: boolean
}

interface Quiz {
  id: string
  title: string
  description: string | null
  timeLimit: number | null
  passingScore: number
  isPublished: boolean
  isLocked: boolean
}

export default function TeacherDashboard() {
  const { user, logout, token } = useAuth()
  const router = useRouter()
  
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const [expandedLessons, setExpandedLessons] = useState<Set<string>>(new Set())
  const [updating, setUpdating] = useState<string | null>(null)
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null)
  const [selectedQuiz, setSelectedQuiz] = useState<string | null>(null)
  const [viewingContent, setViewingContent] = useState<'lesson' | 'quiz' | null>(null)

  useEffect(() => {
    if (!user || user.role !== 'TEACHER') {
      router.push('/login')
      return
    }
    fetchCourses()
  }, [user, router])

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/teacher/courses', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setCourses(data)
      } else {
        console.error('Failed to fetch courses')
      }
    } catch (error) {
      console.error('Error fetching courses:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId)
    } else {
      newExpanded.add(sectionId)
    }
    setExpandedSections(newExpanded)
  }

  const toggleLesson = (lessonId: string) => {
    const newExpanded = new Set(expandedLessons)
    if (newExpanded.has(lessonId)) {
      newExpanded.delete(lessonId)
    } else {
      newExpanded.add(lessonId)
    }
    setExpandedLessons(newExpanded)
  }

  const toggleLock = async (type: 'section' | 'lesson' | 'quiz', id: string, currentLocked: boolean) => {
    setUpdating(id)
    try {
      // Handle proper pluralization for API endpoints
      const pluralType = type === 'quiz' ? 'quizzes' : `${type}s`
      const response = await fetch(`/api/teacher/${pluralType}/${id}/lock`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isLocked: !currentLocked })
      })
      
      if (response.ok) {
        await fetchCourses() // Refresh the data
      } else {
        const errorData = await response.json()
        alert(`Error: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error updating lock status:', error)
      alert('Network error occurred')
    } finally {
      setUpdating(null)
    }
  }

  const viewLesson = (lessonId: string) => {
    setSelectedLesson(lessonId)
    setSelectedQuiz(null)
    setViewingContent('lesson')
  }

  const viewQuiz = (quizId: string) => {
    setSelectedQuiz(quizId)
    setSelectedLesson(null)
    setViewingContent('quiz')
  }

  const closeContentView = () => {
    setSelectedLesson(null)
    setSelectedQuiz(null)
    setViewingContent(null)
  }

  // Helper function to find current lesson
  const getCurrentLesson = () => {
    if (!selectedLesson) return null
    for (const course of courses) {
      for (const section of course.sections) {
        const lesson = section.lessons.find(l => l.id === selectedLesson)
        if (lesson) return { ...lesson, courseTitle: course.title, sectionTitle: section.title }
      }
    }
    return null
  }

  // Helper function to find current quiz
  const getCurrentQuiz = () => {
    if (!selectedQuiz) return null
    for (const course of courses) {
      for (const section of course.sections) {
        const quiz = section.quizzes.find(q => q.id === selectedQuiz)
        if (quiz) return { ...quiz, courseTitle: course.title, sectionTitle: section.title }
      }
    }
    return null
  }

  if (!user) {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-gradient-to-br from-[#103352] to-[#1a4a6b] rounded-xl flex items-center justify-center">
                <span className="text-xl font-bold text-white">T</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Teacher Dashboard</h1>
                <p className="text-gray-600 font-medium">Welcome back, {user.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="btn-ghost flex items-center gap-2"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="stat-card">
            <div className="flex items-center">
              <div className="stat-icon stat-icon-primary">
                <BookOpen className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <div className="stat-value">{courses.length}</div>
                <div className="stat-label">Assigned Courses</div>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center">
              <div className="stat-icon stat-icon-secondary">
                <Users className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <div className="stat-value">
                  {courses.reduce((sum, course) => sum + course._count.enrollments, 0)}
                </div>
                <div className="stat-label">Total Students</div>
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
                  {courses.filter(course => course.isPublished).length}
                </div>
                <div className="stat-label">Published Courses</div>
              </div>
            </div>
          </div>

          <div className="stat-card cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/teacher/quiz-scores')}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="stat-icon bg-gradient-to-br from-purple-400 to-purple-500 text-white">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <div className="stat-value">Quiz Scores</div>
                  <div className="stat-label">Manage & Export</div>
                </div>
              </div>
              <ExternalLink className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Courses */}
        {courses.length === 0 ? (
          <div className="card">
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Courses Assigned</h3>
              <p className="text-gray-500">
                You haven&apos;t been assigned to any courses yet. Contact your administrator.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {courses.map((course) => (
              <div key={course.id} className="card">
                <div className="card-header">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="card-title flex items-center gap-3">
                        {course.title}
                        {course.isPublished ? (
                          <span className="badge badge-success">Published</span>
                        ) : (
                          <span className="badge badge-warning">Draft</span>
                        )}
                      </h2>
                      <p className="card-subtitle">
                        {course.description || 'No description available'}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {course._count.enrollments} students enrolled
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {course.sections.map((section) => (
                    <div key={section.id} className="border border-gray-200 rounded-lg">
                      <div className="p-4 bg-gray-50 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => toggleSection(section.id)}
                            className="flex items-center gap-2 text-left hover:text-[#792024] transition-colors"
                          >
                            {expandedSections.has(section.id) ? (
                              <ChevronDown className="h-5 w-5" />
                            ) : (
                              <ChevronRight className="h-5 w-5" />
                            )}
                            <h3 className="font-semibold text-gray-900">{section.title}</h3>
                            <span className="text-sm text-gray-500">
                              ({section.lessons.length} lessons, {section.quizzes.length} quizzes)
                            </span>
                          </button>
                          <button
                            onClick={() => toggleLock('section', section.id, section.isLocked)}
                            disabled={updating === section.id}
                            className={`btn-sm flex items-center gap-2 ${
                              section.isLocked 
                                ? 'btn-outline text-red-600 hover:text-red-700' 
                                : 'btn-outline text-green-600 hover:text-green-700'
                            }`}
                          >
                            {updating === section.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                            ) : section.isLocked ? (
                              <Lock className="h-4 w-4" />
                            ) : (
                              <Unlock className="h-4 w-4" />
                            )}
                            {section.isLocked ? 'Locked' : 'Unlocked'}
                          </button>
                        </div>
                        {section.description && (
                          <p className="text-sm text-gray-600 mt-2 ml-7">{section.description}</p>
                        )}
                      </div>

                      {expandedSections.has(section.id) && (
                        <div className="p-4 space-y-3">
                          {/* Lessons */}
                          {section.lessons.map((lesson) => (
                            <div key={lesson.id} className="border border-gray-200 rounded-lg">
                              <div className="p-3 bg-white">
                                <div className="flex items-center justify-between">
                                  <button
                                    onClick={() => toggleLesson(lesson.id)}
                                    className="flex items-center gap-2 text-left hover:text-[#792024] transition-colors"
                                  >
                                    {expandedLessons.has(lesson.id) ? (
                                      <ChevronDown className="h-4 w-4" />
                                    ) : (
                                      <ChevronRight className="h-4 w-4" />
                                    )}
                                    <FileText className="h-4 w-4 text-gray-500" />
                                    <span className="font-medium text-gray-900">{lesson.title}</span>
                                    {lesson.subLessons.length > 0 && (
                                      <span className="text-sm text-gray-500">
                                        ({lesson.subLessons.length} sub-lessons)
                                      </span>
                                    )}
                                  </button>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => viewLesson(lesson.id)}
                                      className="btn-sm btn-outline text-blue-600 hover:text-blue-700 flex items-center gap-2"
                                    >
                                      <Eye className="h-4 w-4" />
                                      View
                                    </button>
                                    <button
                                      onClick={() => toggleLock('lesson', lesson.id, lesson.isLocked)}
                                      disabled={updating === lesson.id}
                                      className={`btn-sm flex items-center gap-2 ${
                                        lesson.isLocked 
                                          ? 'btn-outline text-red-600 hover:text-red-700' 
                                          : 'btn-outline text-green-600 hover:text-green-700'
                                      }`}
                                    >
                                      {updating === lesson.id ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                                      ) : lesson.isLocked ? (
                                        <Lock className="h-4 w-4" />
                                      ) : (
                                        <Unlock className="h-4 w-4" />
                                      )}
                                      {lesson.isLocked ? 'Locked' : 'Unlocked'}
                                    </button>
                                  </div>
                                </div>
                                
                                {expandedLessons.has(lesson.id) && lesson.subLessons.length > 0 && (
                                  <div className="mt-3 ml-6 space-y-2">
                                    {lesson.subLessons.map((subLesson) => (
                                      <div key={subLesson.id} className="flex items-center gap-2 text-sm text-gray-600">
                                        <FileText className="h-3 w-3" />
                                        <span>{subLesson.title}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}

                          {/* Quizzes */}
                          {section.quizzes.map((quiz) => (
                            <div key={quiz.id} className="border border-gray-200 rounded-lg">
                              <div className="p-3 bg-white">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-gray-500" />
                                    <span className="font-medium text-gray-900">{quiz.title}</span>
                                    <span className="text-sm text-gray-500">
                                      {quiz.timeLimit ? `${quiz.timeLimit}min` : 'No time limit'} • {quiz.passingScore}% pass
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => viewQuiz(quiz.id)}
                                      className="btn-sm btn-outline text-blue-600 hover:text-blue-700 flex items-center gap-2"
                                    >
                                      <Eye className="h-4 w-4" />
                                      View
                                    </button>
                                    <button
                                      onClick={() => toggleLock('quiz', quiz.id, quiz.isLocked)}
                                      disabled={updating === quiz.id}
                                      className={`btn-sm flex items-center gap-2 ${
                                        quiz.isLocked 
                                          ? 'btn-outline text-red-600 hover:text-red-700' 
                                          : 'btn-outline text-green-600 hover:text-green-700'
                                      }`}
                                    >
                                      {updating === quiz.id ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                                      ) : quiz.isLocked ? (
                                        <Lock className="h-4 w-4" />
                                      ) : (
                                        <Unlock className="h-4 w-4" />
                                      )}
                                      {quiz.isLocked ? 'Locked' : 'Unlocked'}
                                    </button>
                                  </div>
                                </div>
                                {quiz.description && (
                                  <p className="text-sm text-gray-600 mt-1 ml-6">{quiz.description}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Content View Modal */}
      {viewingContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                {viewingContent === 'lesson' ? (
                  <FileText className="h-6 w-6 text-[#792024]" />
                ) : (
                  <Clock className="h-6 w-6 text-[#792024]" />
                )}
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {viewingContent === 'lesson' ? getCurrentLesson()?.title : getCurrentQuiz()?.title}
                  </h2>
                  <p className="text-gray-600">
                    {viewingContent === 'lesson' ? getCurrentLesson()?.sectionTitle : getCurrentQuiz()?.sectionTitle}
                  </p>
                </div>
              </div>
              <button
                onClick={closeContentView}
                className="btn-ghost p-2 hover:bg-gray-100 rounded-lg"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {viewingContent === 'lesson' && getCurrentLesson() && (
                <div className="prose max-w-none">
                  {getCurrentLesson()?.content ? (
                    <div 
                      dangerouslySetInnerHTML={{ __html: getCurrentLesson()?.content || '' }}
                      className="rich-text-preview"
                      style={{
                        lineHeight: '1.6',
                        fontSize: '16px',
                        fontFamily: 'system-ui, -apple-system, sans-serif'
                      }}
                    />
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No content available for this lesson</p>
                    </div>
                  )}
                </div>
              )}

              {viewingContent === 'quiz' && getCurrentQuiz() && (
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Quiz Details</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-600">Time Limit:</span>
                        <span className="ml-2">{getCurrentQuiz()?.timeLimit ? `${getCurrentQuiz()?.timeLimit} minutes` : 'No time limit'}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Passing Score:</span>
                        <span className="ml-2">{getCurrentQuiz()?.passingScore}%</span>
                      </div>
                    </div>
                    {getCurrentQuiz()?.description && (
                      <div className="mt-3">
                        <span className="font-medium text-gray-600">Description:</span>
                        <p className="mt-1 text-gray-700">{getCurrentQuiz()?.description}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium mb-2">Quiz Questions</p>
                    <p className="text-sm">Quiz questions are only visible to students when they take the quiz.</p>
                    <p className="text-sm mt-2">Teachers can view student scores and manage retakes from the Quiz Scores page.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
