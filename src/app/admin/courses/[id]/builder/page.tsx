'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

interface Course {
  id: string
  title: string
  description: string | null
  content: string | null
  thumbnail: string | null
  isPublished: boolean
  createdAt: string
  updatedAt: string
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
  lessons: Lesson[]
  quizzes: Quiz[]
}

interface Lesson {
  id: string
  title: string
  content: string | null
  order: number
  isPublished: boolean
  subLessons: SubLesson[]
  quizzes: Quiz[]
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
  questions: QuizQuestion[]
}

interface QuizQuestion {
  id: string
  question: string
  type: 'multiple-choice' | 'true-false' | 'short-answer' | 'essay'
  options?: string[]
  correctAnswer?: string
  points: number
  order: number
}

export default function CourseBuilderPage() {
  const { user, token } = useAuth()
  const router = useRouter()
  const params = useParams()
  const courseId = params.id as string

  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [showSectionModal, setShowSectionModal] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [showPublishNotification, setShowPublishNotification] = useState(false)
  const [showLessonModal, setShowLessonModal] = useState(false)
  const [showQuizModal, setShowQuizModal] = useState(false)
  const [selectedSection, setSelectedSection] = useState<Section | null>(null)
  const [editingItem, setEditingItem] = useState<Section | Lesson | Quiz | null>(null)
  const [editingType, setEditingType] = useState<'section' | 'lesson' | 'quiz' | null>(null)

  // Form states
  const [sectionForm, setSectionForm] = useState({
    title: '',
    description: '',
    order: 0
  })

  const [lessonForm, setLessonForm] = useState({
    title: '',
    content: '',
    order: 0
  })

  const [quizForm, setQuizForm] = useState({
    title: '',
    description: '',
    timeLimit: 30,
    passingScore: 70,
    questions: [] as QuizQuestion[]
  })

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      router.push('/login')
      return
    }
    fetchCourse()
  }, [user, router, courseId])

  const fetchCourse = async () => {
    try {
      const response = await fetch(`/api/admin/courses/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setCourse(data)
      }
    } catch (error) {
      console.error('Error fetching course:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePublishCourse = async () => {
    if (!course) return
    
    setPublishing(true)
    try {
      const response = await fetch('/api/admin/courses', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          courseId: course.id,
          isPublished: !course.isPublished
        })
      })
      
      if (response.ok) {
        const updatedCourse = await response.json()
        setCourse(updatedCourse)
        
        if (!course.isPublished) {
          setShowPublishNotification(true)
          setTimeout(() => setShowPublishNotification(false), 5000)
        }
      } else {
        const errorData = await response.json()
        alert(`Error: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error publishing course:', error)
      alert('Network error occurred')
    } finally {
      setPublishing(false)
    }
  }

  const handleCreateSection = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!course) return

    try {
      const response = await fetch(`/api/admin/courses/${course.id}/sections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(sectionForm)
      })

      if (response.ok) {
        await fetchCourse()
        setShowSectionModal(false)
        setSectionForm({ title: '', description: '', order: 0 })
      } else {
        const errorData = await response.json()
        alert(`Error: ${errorData.error || 'Failed to create section'}`)
      }
    } catch (error) {
      console.error('Error creating section:', error)
      alert('Network error occurred while creating section')
    }
  }

  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSection) return

    try {
      const response = await fetch(`/api/admin/sections/${selectedSection.id}/lessons`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(lessonForm)
      })

      if (response.ok) {
        await fetchCourse()
        setShowLessonModal(false)
        setLessonForm({ title: '', content: '', order: 0 })
      } else {
        const errorData = await response.json()
        alert(`Error: ${errorData.error || 'Failed to create lesson'}`)
      }
    } catch (error) {
      console.error('Error creating lesson:', error)
      alert('Network error occurred while creating lesson')
    }
  }

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSection) return

    // Validate that all questions have required fields
    const hasInvalidQuestions = (quizForm.questions || []).some(q => 
      !q.question.trim() || 
      (q.type === 'multiple-choice' && (!q.options || q.options.some(opt => !opt.trim()))) ||
      (q.type === 'true-false' && !q.correctAnswer)
    )

    if (hasInvalidQuestions) {
      alert('Please fill in all required question fields before creating the quiz.')
      return
    }

    try {
      const quizData = {
        ...quizForm,
        questions: JSON.stringify(quizForm.questions || []) // Serialize questions as JSON string
      }

      const response = await fetch(`/api/admin/sections/${selectedSection.id}/quizzes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(quizData)
      })

      if (response.ok) {
        await fetchCourse()
        setShowQuizModal(false)
        setQuizForm({ title: '', description: '', timeLimit: 30, passingScore: 70, questions: [] })
      } else {
        const errorData = await response.json()
        alert(`Error: ${errorData.error || 'Failed to create quiz'}`)
      }
    } catch (error) {
      console.error('Error creating quiz:', error)
      alert('Network error occurred while creating quiz')
    }
  }

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm('Are you sure you want to delete this lesson? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/lessons/${lessonId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        await fetchCourse()
        alert('Lesson deleted successfully!')
      } else {
        const errorData = await response.json()
        alert(`Error: ${errorData.error || 'Failed to delete lesson'}`)
      }
    } catch (error) {
      console.error('Error deleting lesson:', error)
      alert('Network error occurred while deleting lesson')
    }
  }

  const handleDeleteQuiz = async (quizId: string) => {
    if (!confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/quizzes/${quizId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        await fetchCourse()
        alert('Quiz deleted successfully!')
      } else {
        const errorData = await response.json()
        alert(`Error: ${errorData.error || 'Failed to delete quiz'}`)
      }
    } catch (error) {
      console.error('Error deleting quiz:', error)
      alert('Network error occurred while deleting quiz')
    }
  }

  const handlePublishSection = async (sectionId: string, isPublished: boolean) => {
    try {
      const response = await fetch(`/api/admin/sections/${sectionId}/publish`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isPublished })
      })

      if (response.ok) {
        await fetchCourse()
        alert(`Section ${isPublished ? 'published' : 'unpublished'} successfully!`)
      } else {
        const errorData = await response.json()
        alert(`Error: ${errorData.error || 'Failed to update section status'}`)
      }
    } catch (error) {
      console.error('Error updating section status:', error)
      alert('Network error occurred while updating section status')
    }
  }

  const handlePublishLesson = async (lessonId: string, isPublished: boolean) => {
    try {
      const response = await fetch(`/api/admin/lessons/${lessonId}/publish`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isPublished })
      })

      if (response.ok) {
        await fetchCourse()
        alert(`Lesson ${isPublished ? 'published' : 'unpublished'} successfully!`)
      } else {
        const errorData = await response.json()
        alert(`Error: ${errorData.error || 'Failed to update lesson status'}`)
      }
    } catch (error) {
      console.error('Error updating lesson status:', error)
      alert('Network error occurred while updating lesson status')
    }
  }

  const handlePublishQuiz = async (quizId: string, isPublished: boolean) => {
    try {
      const response = await fetch(`/api/admin/quizzes/${quizId}/publish`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isPublished })
      })

      if (response.ok) {
        await fetchCourse()
        alert(`Quiz ${isPublished ? 'published' : 'unpublished'} successfully!`)
      } else {
        const errorData = await response.json()
        alert(`Error: ${errorData.error || 'Failed to update quiz status'}`)
      }
    } catch (error) {
      console.error('Error updating quiz status:', error)
      alert('Network error occurred while updating quiz status')
    }
  }

  const openSectionModal = () => {
    setShowSectionModal(true)
  }

  const openLessonModal = (section: Section) => {
    setSelectedSection(section)
    setShowLessonModal(true)
  }

  const openQuizModal = (section: Section) => {
    setSelectedSection(section)
    setShowQuizModal(true)
  }

  const openEditor = (item: Section | Lesson | Quiz, type: 'section' | 'lesson' | 'quiz') => {
    setEditingItem(item)
    setEditingType(type)
    // Navigate to dedicated editor page
    if (type === 'section') {
      router.push(`/admin/courses/${courseId}/builder/section/${item.id}`)
    } else if (type === 'lesson') {
      router.push(`/admin/courses/${courseId}/builder/lesson/${item.id}`)
    } else if (type === 'quiz') {
      router.push(`/admin/courses/${courseId}/builder/quiz/${item.id}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Course not found</h2>
          <Link href="/admin/courses" className="btn-primary">
            Back to Courses
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Publish Notification */}
      {showPublishNotification && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <div>
            <p className="font-semibold">Course Published Successfully!</p>
            <p className="text-sm opacity-90">All sections, lessons, and quizzes have been automatically published.</p>
          </div>
          <button
            onClick={() => setShowPublishNotification(false)}
            className="ml-2 text-white hover:text-gray-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/courses"
                className="btn-ghost flex items-center gap-2 text-gray-600 hover:text-[#792024]"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Courses
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Course Builder</h1>
                <p className="mt-2 text-gray-600">{course.title}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => router.push(`/admin/courses/${courseId}/builder/section/new`)}
                className="btn-outline"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Section
              </button>
              <button 
                onClick={handlePublishCourse}
                disabled={publishing}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                {publishing ? 'Publishing...' : (course?.isPublished ? 'Unpublish Course' : 'Publish Course')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Curriculum Structure</h2>
            
            {course.sections?.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No sections yet</h3>
                <p className="text-gray-500 mb-6">Start building your course by adding sections</p>
                <button
                  onClick={openSectionModal}
                  className="btn-primary"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add First Section
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {course.sections?.map((section, sectionIndex) => (
                  <div key={section.id} className="border border-gray-200 rounded-lg">
                    {/* Section Header */}
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2 text-gray-500">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                            </svg>
                            <span className="text-sm font-medium">Section {sectionIndex + 1}</span>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
                          <span className={`badge ${section.isPublished ? 'badge-active' : 'badge-inactive'}`}>
                            {section.isPublished ? 'Published' : 'Draft'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handlePublishSection(section.id, !section.isPublished)}
                            className={`text-sm py-1 px-3 ${
                              section.isPublished 
                                ? 'btn-outline text-orange-600 hover:text-orange-700 hover:bg-orange-50' 
                                : 'btn-primary'
                            }`}
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            {section.isPublished ? 'Unpublish' : 'Publish'}
                          </button>
                          <button
                            onClick={() => openEditor(section, 'section')}
                            className="btn-ghost text-sm py-1 px-3"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </button>
                          <button
                            onClick={() => openLessonModal(section)}
                            className="btn-outline text-sm py-1 px-3"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Lesson
                          </button>
                          <button
                            onClick={() => openQuizModal(section)}
                            className="btn-outline text-sm py-1 px-3"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Quiz
                          </button>
                        </div>
                      </div>
                      {section.description && (
                        <p className="mt-2 text-sm text-gray-600">{section.description}</p>
                      )}
                    </div>

                    {/* Section Content */}
                    <div className="p-6">
                      {(section.lessons?.length || 0) === 0 && (section.quizzes?.length || 0) === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <p>No content yet. Add lessons or quizzes to this section.</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {/* Lessons */}
                          {section.lessons?.map((lesson, lessonIndex) => (
                            <div key={lesson.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-2 text-gray-500">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span className="text-sm font-medium">Lesson {lessonIndex + 1}</span>
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900">{lesson.title}</h4>
                                <p className="text-sm text-gray-500">
                                </p>
                              </div>
                              <button
                                onClick={() => handlePublishLesson(lesson.id, !lesson.isPublished)}
                                className={`text-sm py-1 px-3 ${
                                  lesson.isPublished 
                                    ? 'btn-outline text-orange-600 hover:text-orange-700 hover:bg-orange-50' 
                                    : 'btn-primary'
                                }`}
                                title={lesson.isPublished ? 'Unpublish lesson' : 'Publish lesson'}
                              >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                {lesson.isPublished ? 'Unpublish' : 'Publish'}
                              </button>
                              <button
                                onClick={() => openEditor(lesson, 'lesson')}
                                className="btn-ghost text-sm py-1 px-3"
                                title="Edit lesson"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDeleteLesson(lesson.id)}
                                className="btn-ghost text-red-500 hover:text-red-700 text-sm py-1 px-3"
                                title="Delete lesson"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          ))}

                          {/* Quizzes */}
                          {section.quizzes?.map((quiz, quizIndex) => (
                            <div key={quiz.id} className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
                              <div className="flex items-center gap-2 text-blue-600">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-sm font-medium">Quiz {quizIndex + 1}</span>
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900">{quiz.title}</h4>
                                <p className="text-sm text-gray-500">
                                  {quiz.timeLimit}min • {quiz.passingScore}% pass • 10 questions (randomized from {(() => {
                                    try {
                                      const questions = quiz.questions ? JSON.parse(quiz.questions as unknown as string) : []
                                      return Array.isArray(questions) ? questions.length : 0
                                    } catch {
                                      return 0
                                    }
                                  })()} available)
                                </p>
                              </div>
                              <button
                                onClick={() => handlePublishQuiz(quiz.id, !quiz.isPublished)}
                                className={`text-sm py-1 px-3 ${
                                  quiz.isPublished 
                                    ? 'btn-outline text-orange-600 hover:text-orange-700 hover:bg-orange-50' 
                                    : 'btn-primary'
                                }`}
                                title={quiz.isPublished ? 'Unpublish quiz' : 'Publish quiz'}
                              >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                {quiz.isPublished ? 'Unpublish' : 'Publish'}
                              </button>
                              <button
                                onClick={() => openEditor(quiz, 'quiz')}
                                className="btn-ghost text-sm py-1 px-3"
                                title="Edit quiz"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDeleteQuiz(quiz.id)}
                                className="btn-ghost text-red-500 hover:text-red-700 text-sm py-1 px-3"
                                title="Delete quiz"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Section Creation Modal */}
      {showSectionModal && (
        <div className="modal-overlay">
          <div className="modal-content max-w-2xl">
            <div className="modal-header">
              <h3 className="modal-title">Add New Section</h3>
              <button
                onClick={() => setShowSectionModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleCreateSection}>
              <div className="modal-body space-y-4">
                <div className="form-group">
                  <label className="form-label">Section Title *</label>
                  <input
                    type="text"
                    value={sectionForm.title}
                    onChange={(e) => setSectionForm({ ...sectionForm, title: e.target.value })}
                    className="input-field"
                    placeholder="Enter section title"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    value={sectionForm.description}
                    onChange={(e) => setSectionForm({ ...sectionForm, description: e.target.value })}
                    className="input-field"
                    rows={3}
                    placeholder="Enter section description"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Order</label>
                  <input
                    type="number"
                    value={sectionForm.order}
                    onChange={(e) => setSectionForm({ ...sectionForm, order: parseInt(e.target.value) || 0 })}
                    className="input-field"
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setShowSectionModal(false)}
                  className="btn-outline"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Section
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lesson Creation Modal */}
      {showLessonModal && selectedSection && (
        <div className="modal-overlay">
          <div className="modal-content max-w-2xl">
            <div className="modal-header">
              <h3 className="modal-title">Add Lesson to {selectedSection.title}</h3>
              <button
                onClick={() => setShowLessonModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleCreateLesson}>
              <div className="modal-body space-y-4">
                <div className="form-group">
                  <label className="form-label">Lesson Title *</label>
                  <input
                    type="text"
                    value={lessonForm.title}
                    onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                    className="input-field"
                    placeholder="Enter lesson title"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Order</label>
                  <input
                    type="number"
                    value={lessonForm.order}
                    onChange={(e) => setLessonForm({ ...lessonForm, order: parseInt(e.target.value) || 0 })}
                    className="input-field"
                    placeholder="0"
                    min="0"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Lesson Content</label>
                  <textarea
                    value={lessonForm.content}
                    onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })}
                    className="input-field"
                    rows={6}
                    placeholder="Enter lesson content (supports markdown)"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setShowLessonModal(false)}
                  className="btn-outline"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Lesson
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quiz Creation Modal */}
      {showQuizModal && selectedSection && (
        <div className="modal-overlay">
          <div className="modal-content max-w-2xl">
            <div className="modal-header">
              <h3 className="modal-title">Add Quiz to {selectedSection.title}</h3>
              <button
                onClick={() => setShowQuizModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleCreateQuiz}>
              <div className="modal-body space-y-4">
                <div className="form-group">
                  <label className="form-label">Quiz Title *</label>
                  <input
                    type="text"
                    value={quizForm.title}
                    onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                    className="input-field"
                    placeholder="Enter quiz title"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    value={quizForm.description}
                    onChange={(e) => setQuizForm({ ...quizForm, description: e.target.value })}
                    className="input-field"
                    rows={3}
                    placeholder="Enter quiz description"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Time Limit (minutes)</label>
                    <input
                      type="number"
                      value={quizForm.timeLimit}
                      onChange={(e) => setQuizForm({ ...quizForm, timeLimit: parseInt(e.target.value) || 30 })}
                      className="input-field"
                      placeholder="30"
                      min="1"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Passing Score (%)</label>
                    <input
                      type="number"
                      value={quizForm.passingScore}
                      onChange={(e) => setQuizForm({ ...quizForm, passingScore: parseInt(e.target.value) || 70 })}
                      className="input-field"
                      placeholder="70"
                      min="1"
                      max="100"
                    />
                  </div>
                </div>

                {/* Quiz Questions Section */}
                <div className="form-group">
                  <div className="flex items-center justify-between mb-3">
                    <label className="form-label">Quiz Questions ({(quizForm.questions || []).length})</label>
                    <button
                      type="button"
                      onClick={() => {
                        const newQuestion: QuizQuestion = {
                          id: Date.now().toString(),
                          question: '',
                          type: 'multiple-choice',
                          options: ['', '', '', ''],
                          correctAnswer: '',
                          points: 1,
                          order: (quizForm.questions || []).length
                        }
                        setQuizForm({ 
                          ...quizForm, 
                          questions: [...(quizForm.questions || []), newQuestion] 
                        })
                      }}
                      className="btn-outline text-sm py-1 px-3"
                    >
                      + Add Question
                    </button>
                  </div>
                  
                  {(quizForm.questions || []).length === 0 ? (
                    <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                      <p>No questions added yet. Click &quot;Add Question&quot; to get started.</p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {(quizForm.questions || []).map((question, index) => (
                        <div key={question.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-gray-900">Question {index + 1}</h4>
                            <button
                              type="button"
                              onClick={() => {
                                const updatedQuestions = quizForm.questions.filter(q => q.id !== question.id)
                                setQuizForm({ ...quizForm, questions: updatedQuestions })
                              }}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Remove
                            </button>
                          </div>
                          
                          <div className="space-y-3">
                            <div>
                              <label className="form-label text-sm">Question Text *</label>
                              <input
                                type="text"
                                value={question.question}
                                onChange={(e) => {
                                  const updatedQuestions = quizForm.questions.map(q => 
                                    q.id === question.id ? { ...q, question: e.target.value } : q
                                  )
                                  setQuizForm({ ...quizForm, questions: updatedQuestions })
                                }}
                                className="input-field text-sm"
                                placeholder="Enter question text"
                                required
                              />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="form-label text-sm">Question Type</label>
                                <select
                                  value={question.type}
                                  onChange={(e) => {
                                    const updatedQuestions = quizForm.questions.map(q => 
                                      q.id === question.id ? { 
                                        ...q, 
                                        type: e.target.value as QuizQuestion['type'],
                                        options: e.target.value === 'multiple-choice' ? ['', '', '', ''] : undefined
                                      } : q
                                    )
                                    setQuizForm({ ...quizForm, questions: updatedQuestions })
                                  }}
                                  className="input-field text-sm"
                                >
                                  <option value="multiple-choice">Multiple Choice</option>
                                  <option value="true-false">True/False</option>
                                  <option value="short-answer">Short Answer</option>
                                  <option value="essay">Essay</option>
                                </select>
                              </div>
                              
                              <div>
                                <label className="form-label text-sm">Points</label>
                                <input
                                  type="number"
                                  value={question.points}
                                  onChange={(e) => {
                                    const updatedQuestions = quizForm.questions.map(q => 
                                      q.id === question.id ? { ...q, points: parseInt(e.target.value) || 1 } : q
                                    )
                                    setQuizForm({ ...quizForm, questions: updatedQuestions })
                                  }}
                                  className="input-field text-sm"
                                  min="1"
                                />
                              </div>
                            </div>
                            
                            {/* Options for multiple choice */}
                            {question.type === 'multiple-choice' && question.options && (
                              <div>
                                <label className="form-label text-sm">Answer Options</label>
                                <div className="space-y-2">
                                  {question.options.map((option, optionIndex) => (
                                    <div key={optionIndex} className="flex items-center gap-2">
                                      <input
                                        type="radio"
                                        name={`correct-${question.id}`}
                                        checked={question.correctAnswer === option}
                                        onChange={() => {
                                          const updatedQuestions = quizForm.questions.map(q => 
                                            q.id === question.id ? { ...q, correctAnswer: option } : q
                                          )
                                          setQuizForm({ ...quizForm, questions: updatedQuestions })
                                        }}
                                        className="text-blue-600"
                                      />
                                      <input
                                        type="text"
                                        value={option}
                                        onChange={(e) => {
                                          const newOptions = [...question.options!]
                                          newOptions[optionIndex] = e.target.value
                                          const updatedQuestions = quizForm.questions.map(q => 
                                            q.id === question.id ? { ...q, options: newOptions } : q
                                          )
                                          setQuizForm({ ...quizForm, questions: updatedQuestions })
                                        }}
                                        className="input-field text-sm flex-1"
                                        placeholder={`Option ${optionIndex + 1}`}
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {/* True/False options */}
                            {question.type === 'true-false' && (
                              <div>
                                <label className="form-label text-sm">Correct Answer</label>
                                <div className="flex gap-4">
                                  <label className="flex items-center gap-2">
                                    <input
                                      type="radio"
                                      name={`correct-${question.id}`}
                                      checked={question.correctAnswer === 'true'}
                                      onChange={() => {
                                        const updatedQuestions = quizForm.questions.map(q => 
                                          q.id === question.id ? { ...q, correctAnswer: 'true' } : q
                                        )
                                        setQuizForm({ ...quizForm, questions: updatedQuestions })
                                      }}
                                      className="text-blue-600"
                                    />
                                    True
                                  </label>
                                  <label className="flex items-center gap-2">
                                    <input
                                      type="radio"
                                      name={`correct-${question.id}`}
                                      checked={question.correctAnswer === 'false'}
                                      onChange={() => {
                                        const updatedQuestions = quizForm.questions.map(q => 
                                          q.id === question.id ? { ...q, correctAnswer: 'false' } : q
                                        )
                                        setQuizForm({ ...quizForm, questions: updatedQuestions })
                                      }}
                                      className="text-blue-600"
                                    />
                                    False
                                  </label>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setShowQuizModal(false)}
                  className="btn-outline"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Quiz
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
