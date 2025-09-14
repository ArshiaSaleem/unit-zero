'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Course, Section, Lesson, Quiz, SubLesson } from '@prisma/client'
import Link from 'next/link'
import RichTextEditor from '@/components/RichTextEditor'

type CourseWithContent = Course & {
  sections: (Section & {
    lessons: (Lesson & { subLessons: SubLesson[] })[]
    quizzes: Quiz[]
  })[]
}

export default function SectionEditorPage({ 
  params 
}: { 
  params: Promise<{ id: string; sectionId: string }> 
}) {
  const { user, token, loading: authLoading } = useAuth()
  const router = useRouter()
  const [courseId, setCourseId] = useState<string>('')
  const [sectionId, setSectionId] = useState<string>('')

  const [course, setCourse] = useState<CourseWithContent | null>(null)
  const [section, setSection] = useState<Section | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')

  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params
      setCourseId(resolvedParams.id)
      setSectionId(resolvedParams.sectionId)
    }
    resolveParams()
  }, [params])

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'ADMIN')) {
      router.push('/login')
    }
    if (!authLoading && user && user.role === 'ADMIN' && token && courseId && sectionId) {
      fetchCourse()
    }
  }, [authLoading, user, token, courseId, sectionId, router])

  const fetchCourse = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/admin/courses/${courseId}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
      if (!response.ok) {
        throw new Error('Failed to fetch course')
      }
      const data = await response.json()
      setCourse(data)
      
      // Find the specific section
      const foundSection = data.sections.find((s: Section) => s.id === sectionId)
      if (foundSection) {
        setSection(foundSection)
        setEditTitle(foundSection.title)
        setEditDescription(foundSection.description || '')
      } else {
        setError('Section not found')
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSection = async () => {
    if (!editTitle.trim()) {
      alert('Section title cannot be empty.')
      return
    }
    
    try {
      const response = await fetch(`/api/admin/sections/${sectionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: editTitle,
          description: editDescription,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update section')
      }

      setIsEditing(false)
      fetchCourse() // Refresh course data
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  const handleDeleteSection = async () => {
    if (!confirm('Are you sure you want to delete this section? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/sections/${sectionId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete section')
      }

      // Navigate back to course builder
      router.push(`/admin/courses/${courseId}/builder`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="spinner"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 text-red-600">
        Error: {error}
      </div>
    )
  }

  if (!course || !section) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 text-gray-700">
        Section not found.
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <Link 
            href={`/admin/courses/${courseId}/builder`} 
            className="btn-ghost flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Course Builder
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Edit Section</h1>
          <div className="flex gap-2">
            <button
              onClick={handleDeleteSection}
              className="btn-secondary text-red-600 border-red-600 hover:bg-red-50"
            >
              Delete Section
            </button>
            {isEditing ? (
              <button
                onClick={handleSaveSection}
                className="btn-primary"
              >
                Save Changes
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="btn-primary"
              >
                Edit Section
              </button>
            )}
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Course: {course.title}</h2>
          <p className="text-gray-600">{course.description}</p>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label htmlFor="sectionTitle" className="form-label">Section Title</label>
                <input
                  type="text"
                  id="sectionTitle"
                  className="form-input"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="sectionDescription" className="form-label">Description</label>
                <RichTextEditor
                  value={editDescription}
                  onChange={setEditDescription}
                  placeholder="Enter section description..."
                  height="300px"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setIsEditing(false)
                    setEditTitle(section.title)
                    setEditDescription(section.description || '')
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveSection}
                  className="btn-primary"
                >
                  Save Changes
                </button>
              </div>
            </div>
          ) : (
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">{section.title}</h3>
              <p className="text-gray-600 mb-4">{section.description || 'No description provided.'}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="text-lg font-semibold text-gray-700 mb-2">Lessons ({(section as { lessons?: { id: string; title: string; content?: string }[] }).lessons?.length || 0})</h4>
        {(section as { lessons?: { id: string; title: string; content?: string }[] }).lessons?.length === 0 ? (
          <p className="text-sm text-gray-500">No lessons in this section.</p>
        ) : (
          <div className="space-y-2">
            {(section as { lessons?: { id: string; title: string; content?: string }[] }).lessons?.map((lesson: { id: string; title: string; content?: string }) => (
              <div key={lesson.id} className="bg-gray-50 border border-gray-100 rounded p-2">
                <h5 className="font-medium text-gray-800">{lesson.title}</h5>
                <p className="text-sm text-gray-600">{lesson.content || 'No content.'}</p>
              </div>
            ))}
          </div>
        )}
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-700 mb-2">Quizzes ({(section as { quizzes?: { id: string; title: string; description?: string; timeLimit: number; passingScore: number }[] }).quizzes?.length || 0})</h4>
                  {(section as { quizzes?: { id: string; title: string; description?: string; timeLimit: number; passingScore: number }[] }).quizzes?.length === 0 ? (
                    <p className="text-sm text-gray-500">No quizzes in this section.</p>
                  ) : (
                    <div className="space-y-2">
                      {(section as { quizzes?: { id: string; title: string; description?: string; timeLimit: number; passingScore: number }[] }).quizzes?.map((quiz: { id: string; title: string; description?: string; timeLimit: number; passingScore: number }) => (
                        <div key={quiz.id} className="bg-gray-50 border border-gray-100 rounded p-2">
                          <h5 className="font-medium text-gray-800">{quiz.title}</h5>
                          <p className="text-sm text-gray-600">
                            {quiz.description || 'No description.'} ({quiz.timeLimit}min, {quiz.passingScore}% pass)
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
