'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Course, Section, Lesson, SubLesson } from '@prisma/client'
import Link from 'next/link'
import RichTextEditor from '@/components/RichTextEditor'

type CourseWithContent = Course & {
  sections: (Section & {
    lessons: (Lesson & { subLessons: SubLesson[] })[]
  })[]
}

export default function LessonEditorPage({ 
  params 
}: { 
  params: Promise<{ id: string; lessonId: string }> 
}) {
  const { user, token, loading: authLoading } = useAuth()
  const router = useRouter()
  const [courseId, setCourseId] = useState<string>('')
  const [lessonId, setLessonId] = useState<string>('')

  const [course, setCourse] = useState<CourseWithContent | null>(null)
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    order: 0
  })

  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params
      setCourseId(resolvedParams.id)
      setLessonId(resolvedParams.lessonId)
    }
    resolveParams()
  }, [params])

  useEffect(() => {
    if (authLoading || !courseId || !lessonId || !token) return
    if (!user || user.role !== 'ADMIN') {
      router.push('/login')
      return
    }
    fetchCourse()
  }, [user, authLoading, router, courseId, lessonId, token])

  const fetchCourse = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('Fetching course with ID:', courseId)
      console.log('Looking for lesson ID:', lessonId)
      
      const response = await fetch(`/api/admin/courses/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      console.log('Response status:', response.status)

      if (response.ok) {
        const courseData = await response.json()
        console.log('Course data received:', courseData)
        setCourse(courseData)
        
        // Find the lesson
        const foundLesson = courseData.sections
          ?.flatMap(section => section.lessons || [])
          .find(l => l.id === lessonId)
        
        console.log('Found lesson:', foundLesson)
        
        if (foundLesson) {
          setLesson(foundLesson)
          setFormData({
            title: foundLesson.title,
            content: foundLesson.content || '',
            order: foundLesson.order
          })
        } else {
          setError('Lesson not found')
        }
      } else {
        const errorData = await response.json()
        console.error('API Error:', errorData)
        setError(`Failed to fetch course data: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error fetching course:', error)
      setError(`Network error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!lesson) return

    setSaving(true)
    try {
      const response = await fetch(`/api/admin/lessons/${lessonId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        await fetchCourse()
        alert('Lesson updated successfully!')
      } else {
        const errorData = await response.json()
        alert(`Error: ${errorData.error || 'Failed to update lesson'}`)
      }
    } catch (error) {
      console.error('Error updating lesson:', error)
      alert('Network error occurred while updating lesson')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!lesson) return

    setSaving(true)
    try {
      const response = await fetch(`/api/admin/lessons/${lessonId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        alert('Lesson deleted successfully!')
        router.push(`/admin/courses/${courseId}/builder`)
      } else {
        const errorData = await response.json()
        alert(`Error: ${errorData.error || 'Failed to delete lesson'}`)
      }
    } catch (error) {
      console.error('Error deleting lesson:', error)
      alert('Network error occurred while deleting lesson')
    } finally {
      setSaving(false)
      setShowDeleteModal(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#792024] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading lesson...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">Error</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link 
            href={`/admin/courses/${courseId}/builder`}
            className="btn-primary"
          >
            Back to Course Builder
          </Link>
        </div>
      </div>
    )
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">Lesson Not Found</div>
          <p className="text-gray-600 mb-4">The requested lesson could not be found.</p>
          <Link 
            href={`/admin/courses/${courseId}/builder`}
            className="btn-primary"
          >
            Back to Course Builder
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link 
                href={`/admin/courses/${courseId}/builder`}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Edit Lesson</h1>
                <p className="text-sm text-gray-500">{course?.title}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowDeleteModal(true)}
                className="btn-danger text-sm py-2 px-4"
                disabled={saving}
              >
                Delete Lesson
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Lesson Details</h2>
            
            <div className="grid grid-cols-1 gap-6">
              <div className="form-group">
                <label className="form-label">Lesson Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input-field"
                  placeholder="Enter lesson title"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Order</label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  className="input-field"
                  placeholder="0"
                  min="0"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Content</label>
                <RichTextEditor
                  value={formData.content}
                  onChange={(content) => setFormData({ ...formData, content })}
                  placeholder="Enter lesson content..."
                  height="600px"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Link
              href={`/admin/courses/${courseId}/builder`}
              className="btn-secondary"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="btn-primary"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Lesson</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this lesson? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="btn-secondary"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="btn-danger"
                disabled={saving}
              >
                {saving ? 'Deleting...' : 'Delete Lesson'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
