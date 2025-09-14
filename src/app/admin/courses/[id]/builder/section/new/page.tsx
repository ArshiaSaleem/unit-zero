'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Course } from '@prisma/client'
import Link from 'next/link'
import RichTextEditor from '@/components/RichTextEditor'

type CourseWithContent = Course & {
  sections: any[]
}

export default function NewSectionPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { user, token, loading: authLoading } = useAuth()
  const router = useRouter()
  const [courseId, setCourseId] = useState<string>('')

  const [course, setCourse] = useState<CourseWithContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    order: 0
  })

  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params
      setCourseId(resolvedParams.id)
    }
    resolveParams()
  }, [params])

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'ADMIN')) {
      router.push('/login')
    }
    if (!authLoading && user && user.role === 'ADMIN' && token && courseId) {
      fetchCourse()
    }
  }, [authLoading, user, token, courseId, router])

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
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) {
      alert('Section title is required')
      return
    }

    setSaving(true)
    try {
      const response = await fetch(`/api/admin/courses/${courseId}/sections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create section')
      }

      // Navigate back to course builder
      router.push(`/admin/courses/${courseId}/builder`)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
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

  if (!course) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 text-gray-700">
        Course not found.
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
          <h1 className="text-3xl font-bold text-gray-900">Add New Section</h1>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Course: {course.title}</h2>
          <p className="text-gray-600">{course.description}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="sectionTitle" className="form-label">Section Title *</label>
                <input
                  type="text"
                  id="sectionTitle"
                  className="form-input"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter section title"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="sectionDescription" className="form-label">Description</label>
                <RichTextEditor
                  value={formData.description}
                  onChange={(description) => setFormData({ ...formData, description })}
                  placeholder="Enter section description..."
                  height="300px"
                />
              </div>
              
              <div>
                <label htmlFor="sectionOrder" className="form-label">Order</label>
                <input
                  type="number"
                  id="sectionOrder"
                  className="form-input"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                  min="0"
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
              {saving ? 'Creating...' : 'Create Section'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
