'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { BookOpen, Calendar, Award, LogOut, Play, CheckCircle, Clock, User, Star } from 'lucide-react'

interface Course {
  id: string
  title: string
  description: string
  thumbnail: string
  teacher: {
    id: string
    firstName: string
    lastName: string
    email: string
  } | null
  sections: Array<{
    id: string
    title: string
    lessons: Array<{
      id: string
      title: string
    }>
    quizzes: Array<{
      id: string
      title: string
    }>
  }>
  isEnrolled: boolean
  enrollment: any
  _count: {
    enrollments: number
  }
}

export default function StudentDashboard() {
  const { user, logout, token } = useAuth()
  const router = useRouter()
  const [enrolledCourse, setEnrolledCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)

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
    
    fetchEnrolledCourse()
  }, [user, router, token])

  const fetchEnrolledCourse = async () => {
    try {
      const response = await fetch('/api/student/course', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setEnrolledCourse(data)
      } else if (response.status === 404) {
        // No course enrolled
        setEnrolledCourse(null)
      } else {
        console.error('Failed to fetch enrolled course')
      }
    } catch (error) {
      console.error('Error fetching enrolled course:', error)
    } finally {
      setLoading(false)
    }
  }

  const viewCourse = (courseId: string) => {
    router.push(`/student/course/${courseId}`)
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-gradient-to-br from-[#792024] to-[#9a2d32] rounded-xl flex items-center justify-center">
                <span className="text-xl font-bold text-white">S</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold gradient-text">Student Dashboard</h1>
                <p className="text-gray-600 font-medium">Welcome back, {user.firstName || user.email}</p>
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
      <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="stat-card">
            <div className="flex items-center">
              <div className="stat-icon stat-icon-primary">
                <BookOpen className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <div className="stat-value">{enrolledCourse ? 1 : 0}</div>
                <div className="stat-label">Enrolled Course</div>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center">
              <div className="stat-icon stat-icon-secondary">
                <Calendar className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <div className="stat-value">{enrolledCourse ? 10 : 0}</div>
                <div className="stat-label">Course Sections</div>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center">
              <div className="stat-icon bg-gradient-to-br from-[#103352] to-[#1e4a6b] text-white">
                <Award className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <div className="stat-value">{enrolledCourse ? 'Active' : 'No Course'}</div>
                <div className="stat-label">Status</div>
              </div>
            </div>
          </div>
        </div>

        {/* Current Enrollment */}
        {enrolledCourse ? (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
              Your Course
            </h2>
            <div className="card hover:shadow-lg transition-shadow duration-200">
              <div className="flex flex-col md:flex-row gap-6">
                {enrolledCourse.thumbnail && (
                  <div className="md:w-48 h-32 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                    <img 
                      src={enrolledCourse.thumbnail} 
                      alt={enrolledCourse.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{enrolledCourse.title}</h3>
                      <p className="text-gray-600 mb-3">{enrolledCourse.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          <span>Instructor: {enrolledCourse.teacher ? `${enrolledCourse.teacher.firstName} ${enrolledCourse.teacher.lastName}` : 'Not assigned'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4" />
                          <span>10 sections</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => viewCourse(enrolledCourse.id)}
                      className="btn-primary flex items-center gap-2"
                    >
                      <Play className="h-4 w-4" />
                      Continue Learning
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="card text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Course Enrolled</h3>
            <p className="text-gray-600 mb-4">You haven't been enrolled in any course yet.</p>
            <p className="text-sm text-gray-500">Please contact your administrator to get enrolled in a course.</p>
          </div>
        )}
      </main>
    </div>
  )
}
