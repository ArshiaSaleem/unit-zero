'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  BookOpen, 
  Users, 
  Settings, 
  LogOut, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  UserPlus,
  X
} from 'lucide-react'

interface Course {
  id: string
  title: string
  description: string | null
  content: string | null
  thumbnail: string | null
  isPublished: boolean
  createdAt: string
  updatedAt: string
  teacherId: string | null
  teacher: {
    id: string
    email: string
    firstName: string | null
    lastName: string | null
  } | null
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
}

interface Teacher {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  isActive: boolean
  createdAt: string
  _count: {
    assignedCourses: number
  }
}

export default function AdminCoursesPage() {
  const { user, token } = useAuth()
  const router = useRouter()

  const [courses, setCourses] = useState<Course[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showCourseModal, setShowCourseModal] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [showEnrollModal, setShowEnrollModal] = useState(false)
  const [enrollEmail, setEnrollEmail] = useState('')
  const [enrolling, setEnrolling] = useState(false)
  const [enrolledStudents, setEnrolledStudents] = useState<any[]>([])
  const [showStudents, setShowStudents] = useState(false)
  const [unenrolling, setUnenrolling] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    thumbnail: '',
    teacherId: ''
  })

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      router.push('/login')
      return
    }
    fetchCourses()
    fetchTeachers()
  }, [user, router])

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/admin/courses', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setCourses(data)
      }
    } catch (error) {
      console.error('Error fetching courses:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTeachers = async () => {
    try {
      const response = await fetch('/api/admin/teachers', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setTeachers(data)
      }
    } catch (error) {
      console.error('Error fetching teachers:', error)
    }
  }

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        await fetchCourses()
        setShowCreateModal(false)
        setFormData({ title: '', description: '', content: '', thumbnail: '' })
      } else {
        const errorData = await response.json()
        alert(`Error: ${errorData.error || 'Failed to create course'}`)
      }
    } catch (error) {
      console.error('Error creating course:', error)
      alert('Network error occurred while creating course')
    }
  }

  const handleUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCourse) return

    try {
      const response = await fetch(`/api/admin/courses/${editingCourse.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        await fetchCourses()
        setShowCreateModal(false)
        setEditingCourse(null)
        setFormData({ title: '', description: '', content: '', thumbnail: '' })
      } else {
        const errorData = await response.json()
        alert(`Error: ${errorData.error || 'Failed to update course'}`)
      }
    } catch (error) {
      console.error('Error updating course:', error)
      alert('Network error occurred while updating course')
    }
  }

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/courses/${courseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        await fetchCourses()
      } else {
        const errorData = await response.json()
        alert(`Error: ${errorData.error || 'Failed to delete course'}`)
      }
    } catch (error) {
      console.error('Error deleting course:', error)
      alert('Network error occurred while deleting course')
    }
  }

  const handleTogglePublish = async (courseId: string, currentStatus: boolean) => {
    try {
      const response = await fetch('/api/admin/courses', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          courseId,
          isPublished: !currentStatus
        })
      })

      if (response.ok) {
        await fetchCourses()
      } else {
        const errorData = await response.json()
        alert(`Error: ${errorData.error || 'Failed to update course status'}`)
      }
    } catch (error) {
      console.error('Error updating course status:', error)
      alert('Network error occurred while updating course status')
    }
  }

  const handleEnrollStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCourse || !enrollEmail.trim()) return

    setEnrolling(true)
    try {
      const response = await fetch(`/api/admin/courses/${selectedCourse.id}/enroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ studentEmail: enrollEmail.trim() })
      })

      if (response.ok) {
        alert('Student enrolled successfully!')
        setEnrollEmail('')
        setShowEnrollModal(false)
        setSelectedCourse(null)
        await fetchCourses() // Refresh course data to update enrollment counts
        await fetchEnrolledStudents(selectedCourse.id)
      } else {
        const errorData = await response.json()
        alert(`Error: ${errorData.error || 'Failed to enroll student'}`)
      }
    } catch (error) {
      console.error('Error enrolling student:', error)
      alert('Network error occurred while enrolling student')
    } finally {
      setEnrolling(false)
    }
  }

  const fetchEnrolledStudents = async (courseId: string) => {
    try {
      const response = await fetch(`/api/admin/courses/${courseId}/students`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setEnrolledStudents(data)
      } else {
        console.error('Failed to fetch enrolled students')
      }
    } catch (error) {
      console.error('Error fetching enrolled students:', error)
    }
  }

  const openEnrollModal = (course: Course) => {
    setSelectedCourse(course)
    setShowEnrollModal(true)
    setEnrollEmail('')
    fetchEnrolledStudents(course.id)
  }

  const openStudentsModal = (course: Course) => {
    setSelectedCourse(course)
    setShowStudents(true)
    fetchEnrolledStudents(course.id)
  }

  const handleUnenrollStudent = async (studentId: string, studentEmail: string) => {
    if (!selectedCourse) return

    if (!confirm(`Are you sure you want to unenroll ${studentEmail} from this course?`)) {
      return
    }

    setUnenrolling(studentId)
    try {
      const response = await fetch(`/api/admin/courses/${selectedCourse.id}/unenroll?studentId=${studentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        alert('Student unenrolled successfully!')
        await fetchCourses() // Refresh course data to update enrollment counts
        await fetchEnrolledStudents(selectedCourse.id) // Refresh enrolled students list
      } else {
        const errorData = await response.json()
        alert(`Error: ${errorData.error || 'Failed to unenroll student'}`)
      }
    } catch (error) {
      console.error('Error unenrolling student:', error)
      alert('Network error occurred while unenrolling student')
    } finally {
      setUnenrolling(null)
    }
  }

  const handleDuplicateCourse = async (courseId: string) => {
    if (!confirm('Are you sure you want to duplicate this course? This will create a complete copy with all sections, lessons, and quizzes.')) {
      return
    }

    try {
      const response = await fetch('/api/admin/courses', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ courseId })
      })

      if (response.ok) {
        await fetchCourses()
        alert('Course duplicated successfully! The copy has been created as a draft.')
      } else {
        const errorData = await response.json()
        alert(`Error: ${errorData.error || 'Failed to duplicate course'}`)
      }
    } catch (error) {
      console.error('Error duplicating course:', error)
      alert('Network error occurred while duplicating course')
    }
  }

  const handleAssignTeacher = async (courseId: string, teacherId: string | null) => {
    try {
      const response = await fetch(`/api/admin/courses/${courseId}/assign-teacher`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ teacherId })
      })

      if (response.ok) {
        await fetchCourses()
        const teacher = teachers.find(t => t.id === teacherId)
        const message = teacherId 
          ? `Course assigned to ${teacher?.firstName} ${teacher?.lastName}` 
          : 'Teacher assignment removed'
        alert(message)
      } else {
        const errorData = await response.json()
        alert(`Error: ${errorData.error || 'Failed to assign teacher'}`)
      }
    } catch (error) {
      console.error('Error assigning teacher:', error)
      alert('Network error occurred while assigning teacher')
    }
  }

  const openCreateModal = () => {
    setEditingCourse(null)
    setFormData({ title: '', description: '', content: '', thumbnail: '', teacherId: '' })
    setShowCreateModal(true)
  }

  const openEditModal = (course: Course) => {
    setEditingCourse(course)
    setFormData({
      title: course.title,
      description: course.description || '',
      content: course.content || '',
      thumbnail: course.thumbnail || '',
      teacherId: course.teacherId || ''
    })
    setShowCreateModal(true)
  }

  const openCourseModal = (course: Course) => {
    setSelectedCourse(course)
    setShowCourseModal(true)
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
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-4">
              <Link
                href="/admin"
                className="btn-ghost flex items-center gap-2 text-gray-600 hover:text-[#792024]"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Admin Dashboard
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Course Management</h1>
                <p className="mt-2 text-gray-600">Create and manage your courses</p>
              </div>
            </div>
            <button
              onClick={openCreateModal}
              className="btn-primary"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Course
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-[#792024] bg-opacity-10 rounded-lg">
                <svg className="w-6 h-6 text-[#792024]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Courses</p>
                <p className="text-2xl font-semibold text-gray-900">{courses.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-[#103352] bg-opacity-10 rounded-lg">
                <svg className="w-6 h-6 text-[#103352]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Published</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {courses.filter(c => c.isPublished).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Draft</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {courses.filter(c => !c.isPublished).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-6.627-5.373-12-12-12s-12 5.373-12 12v2h24z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Enrollments</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {courses.reduce((sum, c) => sum + c._count.enrollments, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        {courses.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No courses yet</h3>
            <p className="text-gray-500 mb-6">Get started by creating your first course</p>
            <button
              onClick={openCreateModal}
              className="btn-primary"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Course
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div key={course.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{course.title}</h3>
                      <span className={`badge ${course.isPublished ? 'badge-active' : 'badge-inactive'}`}>
                        {course.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </div>
                  </div>
                  
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {course.description || 'No description provided'}
              </p>
              
              {course.teacher && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-blue-900">
                        Assigned Teacher
                      </p>
                      <p className="text-xs text-blue-700">
                        {course.teacher.firstName} {course.teacher.lastName} ({course.teacher.email})
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span>{course.sections.length} sections</span>
                <span>{course._count.enrollments} enrollments</span>
              </div>
              
              {/* Main Build Course Button */}
              <div className="mb-3">
                <button
                  onClick={() => router.push(`/admin/courses/${course.id}/builder`)}
                  className="btn-primary w-full text-sm py-2.5"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Build Course
                </button>
              </div>
              
              {/* Action Buttons Row */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleTogglePublish(course.id, course.isPublished)}
                  className={`text-xs py-2 px-2 ${
                    course.isPublished 
                      ? 'btn-outline text-orange-600 hover:text-orange-700 hover:bg-orange-50' 
                      : 'btn-outline text-green-600 hover:text-green-700 hover:bg-green-50'
                  }`}
                  title={course.isPublished ? 'Unpublish Course' : 'Publish Course'}
                >
                  <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {course.isPublished ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    )}
                  </svg>
                </button>
                <button
                  onClick={() => handleDuplicateCourse(course.id)}
                  className="btn-outline text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-xs py-2 px-2"
                  title="Duplicate Course"
                >
                  <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
                <button
                  onClick={() => openEnrollModal(course)}
                  className="btn-outline text-green-600 hover:text-green-700 hover:bg-green-50 text-xs py-2 px-2"
                  title="Enroll Student"
                >
                  <UserPlus className="w-4 h-4 mx-auto" />
                </button>
                <button
                  onClick={() => openStudentsModal(course)}
                  className="btn-outline text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 text-xs py-2 px-2"
                  title="View Enrolled Students"
                >
                  <Users className="w-4 h-4 mx-auto" />
                </button>
                <div className="relative">
                  <select
                    value={course.teacherId || ''}
                    onChange={(e) => handleAssignTeacher(course.id, e.target.value || null)}
                    className="btn-outline text-purple-600 hover:text-purple-700 hover:bg-purple-50 text-xs py-2 px-2 pr-6 appearance-none cursor-pointer w-full"
                    title="Assign Teacher"
                  >
                    <option value="">👤</option>
                    {teachers.filter(teacher => teacher.isActive).map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.firstName} {teacher.lastName}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-1 pointer-events-none">
                    <svg className="w-3 h-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                <button
                  onClick={() => openCourseModal(course)}
                  className="btn-outline text-xs py-2 px-2"
                  title="View Details"
                >
                  <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </button>
                <button
                  onClick={() => openEditModal(course)}
                  className="btn-ghost text-sm py-2 px-3"
                  title="Edit Course"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDeleteCourse(course.id)}
                  className="btn-ghost text-red-600 hover:text-red-700 text-sm py-2 px-3"
                  title="Delete Course"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Course Creation/Edit Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content max-w-2xl">
            <div className="modal-header">
              <h3 className="modal-title">
                {editingCourse ? 'Edit Course' : 'Create New Course'}
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={editingCourse ? handleUpdateCourse : handleCreateCourse}>
              <div className="modal-body space-y-4">
                <div className="form-group">
                  <label className="form-label">Course Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="input-field"
                    placeholder="Enter course title"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input-field"
                    rows={3}
                    placeholder="Enter course description"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Content</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="input-field"
                    rows={6}
                    placeholder="Enter course content (supports markdown)"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Thumbnail URL</label>
                  <input
                    type="url"
                    value={formData.thumbnail}
                    onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                    className="input-field"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Assign Teacher</label>
                  <select
                    value={formData.teacherId}
                    onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                    className="input-field"
                  >
                    <option value="">No teacher assigned</option>
                    {teachers.filter(teacher => teacher.isActive).map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.firstName} {teacher.lastName} ({teacher.email})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-outline"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingCourse ? 'Update Course' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Course Details Modal */}
      {showCourseModal && selectedCourse && (
        <div className="modal-overlay">
          <div className="modal-content max-w-4xl">
            <div className="modal-header">
              <h3 className="modal-title">{selectedCourse.title}</h3>
              <button
                onClick={() => setShowCourseModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <p className="text-gray-600 mb-6">{selectedCourse.description}</p>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold text-gray-900">Sections ({selectedCourse.sections.length})</h4>
                </div>
                
                {selectedCourse.sections.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No sections yet. Use the course builder to add content.</p>
                    <button
                      onClick={() => {
                        setShowCourseModal(false)
                        router.push(`/admin/courses/${selectedCourse.id}/builder`)
                      }}
                      className="btn-primary mt-4"
                    >
                      Open Course Builder
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedCourse.sections.map((section) => (
                      <div key={section.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h5 className="font-medium text-gray-900">{section.title}</h5>
                            <p className="text-sm text-gray-500">
                              {section.lessons.length} lessons • {section.quizzes.length} quizzes
                            </p>
                          </div>
                          <span className={`badge ${section.isPublished ? 'badge-active' : 'badge-inactive'}`}>
                            {section.isPublished ? 'Published' : 'Draft'}
                          </span>
                        </div>
                        
                        {section.description && (
                          <p className="text-sm text-gray-600 mb-3">{section.description}</p>
                        )}
                        
                        {/* Lessons */}
                        {section.lessons.length > 0 && (
                          <div className="mt-3">
                            <h6 className="text-sm font-medium text-gray-700 mb-2">Lessons:</h6>
                            <div className="space-y-2">
                              {section.lessons.map((lesson) => (
                                <div key={lesson.id} className="text-sm text-gray-600 bg-gray-50 rounded p-2">
                                  {lesson.title}
                                  {lesson.subLessons.length > 0 && (
                                    <span className="ml-2 text-xs text-gray-500">
                                      ({lesson.subLessons.length} sub-lessons)
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Quizzes */}
                        {section.quizzes.length > 0 && (
                          <div className="mt-3">
                            <h6 className="text-sm font-medium text-gray-700 mb-2">Quizzes:</h6>
                            <div className="space-y-2">
                              {section.quizzes.map((quiz) => (
                                <div key={quiz.id} className="text-sm text-gray-600 bg-blue-50 rounded p-2">
                                  {quiz.title}
                                  <span className="ml-2 text-xs text-gray-500">
                                    ({quiz.timeLimit}min, {quiz.passingScore}% pass)
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button
                onClick={() => setShowCourseModal(false)}
                className="btn-outline"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowCourseModal(false)
                  router.push(`/admin/courses/${selectedCourse.id}/builder`)
                }}
                className="btn-primary"
              >
                Open Course Builder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enroll Student Modal */}
      {showEnrollModal && selectedCourse && (
        <div className="modal-overlay">
          <div className="modal-content max-w-md">
            <div className="modal-header">
              <h3 className="modal-title">Enroll Student</h3>
              <button
                onClick={() => setShowEnrollModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Enroll a student in: <strong>{selectedCourse.title}</strong>
                </p>
                <form onSubmit={handleEnrollStudent}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Student Email
                    </label>
                    <input
                      type="email"
                      value={enrollEmail}
                      onChange={(e) => setEnrollEmail(e.target.value)}
                      className="input-field"
                      placeholder="student@example.com"
                      required
                    />
                  </div>
                  
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowEnrollModal(false)}
                      className="btn-outline"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={enrolling}
                      className="btn-primary"
                    >
                      {enrolling ? 'Enrolling...' : 'Enroll Student'}
                    </button>
                  </div>
                </form>
              </div>
              
              {enrolledStudents.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Currently Enrolled Students</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {enrolledStudents.map((student) => (
                      <div key={student.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {student.firstName} {student.lastName}
                          </p>
                          <p className="text-xs text-gray-500">{student.email}</p>
                        </div>
                        <span className="text-xs text-green-600 font-medium">Enrolled</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* View Students Modal */}
      {showStudents && selectedCourse && (
        <div className="modal-overlay">
          <div className="modal-content max-w-2xl">
            <div className="modal-header">
              <h3 className="modal-title">Enrolled Students</h3>
              <button
                onClick={() => setShowStudents(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-4">
                  Students enrolled in: <strong>{selectedCourse.title}</strong>
                </p>
                
                {enrolledStudents.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No students enrolled yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {enrolledStudents.map((enrollment) => (
                      <div key={enrollment.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-[#792024] to-[#9a2d32] rounded-full flex items-center justify-center">
                            <span className="text-white font-medium text-sm">
                              {enrollment.user.firstName?.[0] || enrollment.user.email?.[0]?.toUpperCase() || 'U'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {enrollment.user.firstName} {enrollment.user.lastName}
                            </p>
                            <p className="text-sm text-gray-500">{enrollment.user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="text-right">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Enrolled
                            </span>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(enrollment.enrolledAt).toLocaleDateString()}
                            </p>
                          </div>
                          <button
                            onClick={() => handleUnenrollStudent(enrollment.user.id, enrollment.user.email)}
                            disabled={unenrolling === enrollment.user.id}
                            className="btn-outline text-red-600 hover:text-red-700 hover:bg-red-50 text-sm py-2 px-3 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Unenroll Student"
                          >
                            {unenrolling === enrollment.user.id ? (
                              <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <X className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}