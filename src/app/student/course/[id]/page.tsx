'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { ArrowLeft, BookOpen, Play, CheckCircle, Clock, User, FileText, HelpCircle, ChevronLeft, ChevronRight, Lock } from 'lucide-react'

interface Course {
  id: string
  title: string
  description: string
  content: string
  thumbnail: string
  teacher: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  sections: Array<{
    id: string
    title: string
    description: string
    order: number
    isLocked: boolean
    lessons: Array<{
      id: string
      title: string
      content: string
      order: number
      isLocked: boolean
    }>
    quizzes: Array<{
      id: string
      title: string
      description: string
      passingScore: number
      isLocked: boolean
      attempts: Array<{
        id: string
        score: number
        completed: boolean
        createdAt: string
      }>
    }>
  }>
}

export default function StudentCourseView({ params }: { params: Promise<{ id: string }> }) {
  const { user, token } = useAuth()
  const router = useRouter()
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedSection, setSelectedSection] = useState<string | null>(null)
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null)
  const [selectedQuiz, setSelectedQuiz] = useState<string | null>(null)
  const [courseId, setCourseId] = useState<string | null>(null)

  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params
      setCourseId(resolvedParams.id)
    }
    resolveParams()
  }, [params])

  useEffect(() => {
    if (!user || user.role !== 'STUDENT') {
      router.push('/login')
      return
    }
    
    // Check if user needs to change password
    if (user.mustChangePassword) {
      router.push('/student/setup-profile')
      return
    }
    
    if (courseId) {
      fetchCourse()
    }
  }, [user, router, courseId, token])

  const fetchCourse = async () => {
    if (!courseId) return
    
    try {
      const response = await fetch(`/api/student/course/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setCourse(data)
        // Auto-select first section if available
        if (data.sections.length > 0) {
          setSelectedSection(data.sections[0].id)
        }
      } else {
        const errorData = await response.json()
        alert(`Error: ${errorData.error}`)
        router.push('/student')
      }
    } catch (error) {
      console.error('Error fetching course:', error)
      alert('Network error occurred')
      router.push('/student')
    } finally {
      setLoading(false)
    }
  }

  const takeQuiz = (quizId: string) => {
    router.push(`/student/quiz/${quizId}`)
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

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Course not found</h2>
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

  const currentSection = course.sections.find(s => s.id === selectedSection)
  const currentLesson = currentSection?.lessons.find(l => l.id === selectedLesson)
  const currentQuiz = currentSection?.quizzes.find(q => q.id === selectedQuiz)

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
                <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
                <p className="text-gray-600">Instructor {course.teacher.firstName} {course.teacher.lastName}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Course Content */}
          <div className="lg:col-span-1">
            <div className="card sticky top-8 max-h-screen overflow-y-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Content</h3>
              <div className="space-y-2">
                {course.sections.map((section, sectionIndex) => (
                  <div key={section.id} className="border border-gray-200 rounded-lg">
                    <button
                      onClick={() => {
                        if (!section.isLocked) {
                          setSelectedSection(section.id)
                          setSelectedLesson(null)
                          setSelectedQuiz(null)
                        }
                      }}
                      disabled={section.isLocked}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        section.isLocked
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : selectedSection === section.id
                          ? 'bg-[#792024] text-white'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        <span className="font-medium">{section.title}</span>
                        {section.isLocked && (
                          <span className="text-xs px-2 py-1 rounded bg-gray-200 text-gray-500">
                            Locked
                          </span>
                        )}
                      </div>
                      <p className={`text-sm mt-1 ${section.isLocked ? 'opacity-60' : 'opacity-90'}`}>
                        {section.description}
                      </p>
                    </button>
                    
                    {selectedSection === section.id && (
                      <div className="mt-2 ml-4 space-y-1">
                        {/* Lessons */}
                        {section.lessons.map((lesson, lessonIndex) => (
                          <button
                            key={lesson.id}
                            onClick={() => {
                              if (!lesson.isLocked) {
                                setSelectedLesson(lesson.id)
                                setSelectedQuiz(null)
                              }
                            }}
                            disabled={lesson.isLocked}
                            className={`w-full text-left p-2 rounded text-sm transition-colors ${
                              lesson.isLocked
                                ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                                : selectedLesson === lesson.id
                                ? 'bg-gray-100 text-gray-900'
                                : 'hover:bg-gray-50 text-gray-600'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <FileText className="h-3 w-3" />
                              <span>{lesson.title}</span>
                              {lesson.isLocked && (
                                <span className="text-xs px-1 py-0.5 rounded bg-gray-200 text-gray-500">
                                  Locked
                                </span>
                              )}
                            </div>
                          </button>
                        ))}
                        
                        {/* Quizzes */}
                        {section.quizzes.map((quiz, quizIndex) => {
                          const bestAttempt = quiz.attempts.length > 0 
                            ? Math.max(...quiz.attempts.map(a => a.score))
                            : 0
                          const isPassed = bestAttempt >= quiz.passingScore
                          
                          return (
                            <button
                              key={quiz.id}
                              onClick={() => {
                                if (!quiz.isLocked) {
                                  setSelectedQuiz(quiz.id)
                                  setSelectedLesson(null)
                                }
                              }}
                              disabled={quiz.isLocked}
                              className={`w-full text-left p-2 rounded text-sm transition-colors ${
                                quiz.isLocked
                                  ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                                  : selectedQuiz === quiz.id
                                  ? 'bg-gray-100 text-gray-900'
                                  : 'hover:bg-gray-50 text-gray-600'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <HelpCircle className="h-3 w-3" />
                                <span>{quiz.title}</span>
                                {quiz.isLocked ? (
                                  <span className="text-xs px-1 py-0.5 rounded bg-gray-200 text-gray-500">
                                    Locked
                                  </span>
                                ) : quiz.attempts.length > 0 ? (
                                  <span className={`text-xs px-2 py-1 rounded ${
                                    isPassed 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-red-100 text-red-800'
                                  }`}>
                                    Completed
                                  </span>
                                ) : (
                                  <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">
                                    Available
                                  </span>
                                )}
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {!selectedSection && (
              <div className="card text-center py-12">
                <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Welcome to {course.title}</h3>
                <p className="text-gray-600 mb-4">{course.description}</p>
                <p className="text-sm text-gray-500">Select a section from the sidebar to start learning</p>
              </div>
            )}

            {selectedSection && !selectedLesson && !selectedQuiz && (
              <div className="card">
                <div className="flex items-center gap-3 mb-6">
                  <BookOpen className="h-6 w-6 text-[#792024]" />
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      {currentSection?.title}
                      {currentSection?.isLocked && (
                        <span className="text-sm px-2 py-1 rounded bg-gray-200 text-gray-600 flex items-center gap-1">
                          <Lock className="h-3 w-3" />
                          Locked
                        </span>
                      )}
                    </h2>
                    <p className="text-gray-600">{currentSection?.description}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Lessons */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Lessons ({currentSection?.lessons.length || 0})
                    </h3>
                    <div className="space-y-2">
                      {currentSection?.lessons.map((lesson, index) => (
                        <button
                          key={lesson.id}
                          onClick={() => {
                            if (!lesson.isLocked) {
                              setSelectedLesson(lesson.id)
                            }
                          }}
                          disabled={lesson.isLocked}
                          className={`w-full text-left p-3 border border-gray-200 rounded-lg transition-colors ${
                            lesson.isLocked
                              ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Play className="h-4 w-4 text-[#792024]" />
                            <span className="font-medium">{lesson.title}</span>
                            {lesson.isLocked && (
                              <span className="text-xs px-2 py-1 rounded bg-gray-200 text-gray-500">
                                Locked
                              </span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quizzes */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <HelpCircle className="h-5 w-5" />
                      Quizzes ({currentSection?.quizzes.length || 0})
                    </h3>
                    <div className="space-y-2">
                      {currentSection?.quizzes.map((quiz, index) => {
                        const bestAttempt = quiz.attempts.length > 0 
                          ? Math.max(...quiz.attempts.map(a => a.score))
                          : 0
                        const isPassed = bestAttempt >= quiz.passingScore
                        
                        return (
                          <button
                            key={quiz.id}
                            onClick={() => {
                              if (!quiz.isLocked) {
                                takeQuiz(quiz.id)
                              }
                            }}
                            disabled={quiz.isLocked || quiz.attempts.length > 0}
                            className={`w-full text-left p-3 border border-gray-200 rounded-lg transition-colors ${
                              quiz.isLocked
                                ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                                : quiz.attempts.length > 0 
                                ? 'bg-gray-50 cursor-default' 
                                : 'hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <HelpCircle className="h-4 w-4 text-[#792024]" />
                              <span className="font-medium">{quiz.title}</span>
                              {quiz.isLocked ? (
                                <span className="text-xs px-2 py-1 rounded bg-gray-200 text-gray-500">
                                  Locked
                                </span>
                              ) : quiz.attempts.length > 0 ? (
                                <span className={`text-xs px-2 py-1 rounded ${
                                  isPassed 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {isPassed ? 'Completed' : 'Completed'}
                                </span>
                              ) : (
                                <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">
                                  Available
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {quiz.attempts.length > 0 
                                ? `Score: ${bestAttempt}% (Passing: ${quiz.passingScore}%)`
                                : `Passing Score: ${quiz.passingScore}%`
                              }
                            </p>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedLesson && currentLesson && (
              <div className="card">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <FileText className="h-6 w-6 text-[#792024]" />
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{currentLesson.title}</h2>
                      <p className="text-gray-600">Lesson Content</p>
                    </div>
                  </div>
                  
                  {/* Lesson Navigation */}
                  <div className="flex items-center gap-2">
                    {(() => {
                      const allLessons = course.sections.flatMap(section => 
                        section.lessons.map(lesson => ({ ...lesson, sectionId: section.id, sectionTitle: section.title }))
                      )
                      const currentIndex = allLessons.findIndex(lesson => lesson.id === selectedLesson)
                      const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null
                      const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null
                      
                      return (
                        <>
                          <button
                            onClick={() => {
                              if (prevLesson) {
                                setSelectedLesson(prevLesson.id)
                                setSelectedSection(prevLesson.sectionId)
                              }
                            }}
                            disabled={!prevLesson}
                            className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            <ChevronLeft className="h-4 w-4" />
                            Previous
                          </button>
                          <span className="text-sm text-gray-500 px-2">
                            {currentIndex + 1} of {allLessons.length}
                          </span>
                          <button
                            onClick={() => {
                              if (nextLesson) {
                                setSelectedLesson(nextLesson.id)
                                setSelectedSection(nextLesson.sectionId)
                              }
                            }}
                            disabled={!nextLesson}
                            className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            Next
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </>
                      )
                    })()}
                  </div>
                </div>
                
                <div className="prose max-w-none">
                  {currentLesson.content ? (
                    <div 
                      dangerouslySetInnerHTML={{ __html: currentLesson.content }}
                      className="rich-text-preview"
                      style={{
                        lineHeight: '1.6',
                        fontSize: '16px',
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                        padding: '24px',
                        minHeight: '400px'
                      }}
                    />
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No content available for this lesson</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {selectedQuiz && currentQuiz && (
              <div className="card">
                <div className="flex items-center gap-3 mb-6">
                  <HelpCircle className="h-6 w-6 text-[#792024]" />
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{currentQuiz.title}</h2>
                    <p className="text-gray-600">{currentQuiz.description}</p>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="text-center">
                    <HelpCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to take the quiz?</h3>
                    <p className="text-gray-600 mb-4">
                      Passing Score: {currentQuiz.passingScore}%
                    </p>
                    {currentQuiz.attempts.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-2">Previous Attempts:</p>
                        <div className="space-y-1">
                          {currentQuiz.attempts.map((attempt, index) => (
                            <div key={attempt.id} className="flex justify-between items-center text-sm">
                              <span>Attempt {index + 1}</span>
                              <span className={`px-2 py-1 rounded ${
                                attempt.score >= currentQuiz.passingScore
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {attempt.score}%
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <button
                      onClick={() => takeQuiz(currentQuiz.id)}
                      className="btn-primary flex items-center gap-2 mx-auto"
                    >
                      <Play className="h-4 w-4" />
                      {currentQuiz.attempts.length > 0 ? 'Retake Quiz' : 'Start Quiz'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
