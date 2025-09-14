'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Course, Section, Quiz } from '@prisma/client'
import Link from 'next/link'

type CourseWithContent = Course & {
  sections: (Section & {
    quizzes: Quiz[]
  })[]
}

interface QuizQuestion {
  id: string
  type: 'multiple-choice' | 'true-false' | 'short-answer' | 'essay'
  question: string
  options?: string[]
  correctAnswer?: string
  points: number
}

export default function QuizEditorPage({ 
  params 
}: { 
  params: Promise<{ id: string; quizId: string }> 
}) {
  const { user, token, loading: authLoading } = useAuth()
  const router = useRouter()
  const [courseId, setCourseId] = useState<string>('')
  const [quizId, setQuizId] = useState<string>('')

  const [course, setCourse] = useState<CourseWithContent | null>(null)
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    timeLimit: 30,
    passingScore: 70,
    questions: [] as QuizQuestion[]
  })

  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params
      setCourseId(resolvedParams.id)
      setQuizId(resolvedParams.quizId)
    }
    resolveParams()
  }, [params])

  useEffect(() => {
    if (authLoading || !courseId || !quizId) return
    if (!user || user.role !== 'ADMIN') {
      router.push('/login')
      return
    }
    fetchCourse()
  }, [user, authLoading, router, courseId, quizId])

  const fetchCourse = async () => {
    try {
      const response = await fetch(`/api/admin/courses/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const courseData = await response.json()
        setCourse(courseData)
        
        // Find the quiz
        const foundQuiz = courseData.sections
          ?.flatMap(section => section.quizzes || [])
          .find(q => q.id === quizId)
        
        if (foundQuiz) {
          setQuiz(foundQuiz)
          let parsedQuestions: QuizQuestion[] = []
          try {
            const rawQuestions = foundQuiz.questions ? JSON.parse(foundQuiz.questions) : []
            // Ensure questions have proper structure with id, options, and points
            parsedQuestions = rawQuestions.map((q: any, index: number) => ({
              id: q.id || `question-${index}`,
              type: q.type || 'multiple-choice',
              question: q.question || '',
              options: q.options || ['', '', '', ''],
              correctAnswer: q.answer || q.correctAnswer || '',
              points: q.points || 1
            }))
          } catch (error) {
            console.error('Error parsing quiz questions:', error)
            parsedQuestions = []
          }
          
          setFormData({
            title: foundQuiz.title,
            description: foundQuiz.description || '',
            timeLimit: foundQuiz.timeLimit || 30,
            passingScore: foundQuiz.passingScore || 70,
            questions: parsedQuestions
          })
        } else {
          setError('Quiz not found')
        }
      } else {
        setError('Failed to fetch course data')
      }
    } catch (error) {
      console.error('Error fetching course:', error)
      setError('Network error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!quiz) return

    setSaving(true)
    try {
      const response = await fetch(`/api/admin/quizzes/${quizId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          questions: JSON.stringify(formData.questions || [])
        })
      })

      if (response.ok) {
        await fetchCourse()
        alert('Quiz updated successfully!')
      } else {
        const errorData = await response.json()
        alert(`Error: ${errorData.error || 'Failed to update quiz'}`)
      }
    } catch (error) {
      console.error('Error updating quiz:', error)
      alert('Network error occurred while updating quiz')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!quiz) return

    setSaving(true)
    try {
      const response = await fetch(`/api/admin/quizzes/${quizId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        alert('Quiz deleted successfully!')
        router.push(`/admin/courses/${courseId}/builder`)
      } else {
        const errorData = await response.json()
        alert(`Error: ${errorData.error || 'Failed to delete quiz'}`)
      }
    } catch (error) {
      console.error('Error deleting quiz:', error)
      alert('Network error occurred while deleting quiz')
    } finally {
      setSaving(false)
      setShowDeleteModal(false)
    }
  }

  const addQuestion = () => {
    const newQuestion: QuizQuestion = {
      id: Date.now().toString(),
      type: 'multiple-choice',
      question: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      points: 1
    }
    setFormData({
      ...formData,
      questions: [...(formData.questions || []), newQuestion]
    })
  }

  const updateQuestion = (index: number, field: keyof QuizQuestion, value: any) => {
    if (!formData.questions || !Array.isArray(formData.questions)) {
      return
    }
    const updatedQuestions = [...formData.questions]
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value }
    setFormData({ ...formData, questions: updatedQuestions })
  }

  const removeQuestion = (index: number) => {
    if (!formData.questions || !Array.isArray(formData.questions)) {
      return
    }
    const updatedQuestions = formData.questions.filter((_, i) => i !== index)
    setFormData({ ...formData, questions: updatedQuestions })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#792024] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading quiz...</p>
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

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">Quiz Not Found</div>
          <p className="text-gray-600 mb-4">The requested quiz could not be found.</p>
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
                <h1 className="text-xl font-semibold text-gray-900">Edit Quiz</h1>
                <p className="text-sm text-gray-500">{course?.title}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowDeleteModal(true)}
                className="btn-danger text-sm py-2 px-4"
                disabled={saving}
              >
                Delete Quiz
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSave} className="space-y-6">
          {/* Quiz Details */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Quiz Details</h2>
            
            <div className="grid grid-cols-1 gap-6">
              <div className="form-group">
                <label className="form-label">Quiz Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input-field"
                  placeholder="Enter quiz title"
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
                  placeholder="Enter quiz description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Time Limit (minutes)</label>
                  <input
                    type="number"
                    value={formData.timeLimit}
                    onChange={(e) => setFormData({ ...formData, timeLimit: parseInt(e.target.value) || 30 })}
                    className="input-field"
                    placeholder="30"
                    min="1"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Passing Score (%)</label>
                  <input
                    type="number"
                    value={formData.passingScore}
                    onChange={(e) => setFormData({ ...formData, passingScore: parseInt(e.target.value) || 70 })}
                    className="input-field"
                    placeholder="70"
                    min="1"
                    max="100"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Questions */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">Questions</h2>
              <button
                type="button"
                onClick={addQuestion}
                className="btn-primary-outline text-sm py-2 px-4"
              >
                Add Question
              </button>
            </div>

            {loading ? (
              <div className="text-center py-8 text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#792024] mx-auto"></div>
                <p className="mt-2">Loading questions...</p>
              </div>
            ) : (!formData.questions || !Array.isArray(formData.questions) || formData.questions.length === 0) ? (
              <div className="text-center py-8 text-gray-500">
                <p>No questions added yet. Click "Add Question" to get started.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {(formData.questions || []).map((question, index) => (
                  <div key={question.id || `question-${index}`} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium text-gray-900">Question {index + 1}</h3>
                      <button
                        type="button"
                        onClick={() => removeQuestion(index)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div className="form-group">
                        <label className="form-label">Question Type</label>
                        <select
                          value={question.type}
                          onChange={(e) => updateQuestion(index, 'type', e.target.value)}
                          className="input-field"
                        >
                          <option value="multiple-choice">Multiple Choice</option>
                          <option value="true-false">True/False</option>
                          <option value="short-answer">Short Answer</option>
                          <option value="essay">Essay</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Question Text</label>
                        <textarea
                          value={question.question}
                          onChange={(e) => updateQuestion(index, 'question', e.target.value)}
                          className="input-field"
                          rows={3}
                          placeholder="Enter your question"
                        />
                      </div>

                      {question.type === 'multiple-choice' && (
                        <div className="space-y-2">
                          <label className="form-label">Answer Options</label>
                          {question.options?.map((option, optionIndex) => (
                            <div key={optionIndex} className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name={`correct-${index}`}
                                checked={question.correctAnswer === option}
                                onChange={() => updateQuestion(index, 'correctAnswer', option)}
                                className="text-[#792024]"
                              />
                              <input
                                type="text"
                                value={option}
                                onChange={(e) => {
                                  const newOptions = [...(question.options || [])]
                                  newOptions[optionIndex] = e.target.value
                                  updateQuestion(index, 'options', newOptions)
                                }}
                                className="input-field flex-1"
                                placeholder={`Option ${optionIndex + 1}`}
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      {question.type === 'true-false' && (
                        <div className="space-y-2">
                          <label className="form-label">Correct Answer</label>
                          <div className="flex space-x-4">
                            <label className="flex items-center">
                              <input
                                type="radio"
                                name={`correct-${index}`}
                                checked={question.correctAnswer === 'true'}
                                onChange={() => updateQuestion(index, 'correctAnswer', 'true')}
                                className="text-[#792024] mr-2"
                              />
                              True
                            </label>
                            <label className="flex items-center">
                              <input
                                type="radio"
                                name={`correct-${index}`}
                                checked={question.correctAnswer === 'false'}
                                onChange={() => updateQuestion(index, 'correctAnswer', 'false')}
                                className="text-[#792024] mr-2"
                              />
                              False
                            </label>
                          </div>
                        </div>
                      )}

                      <div className="form-group">
                        <label className="form-label">Points</label>
                        <input
                          type="number"
                          value={question.points}
                          onChange={(e) => updateQuestion(index, 'points', parseInt(e.target.value) || 1)}
                          className="input-field w-20"
                          min="1"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
            <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Quiz</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this quiz? This action cannot be undone.
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
                {saving ? 'Deleting...' : 'Delete Quiz'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
