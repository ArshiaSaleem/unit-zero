'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Users, UserPlus, Upload, Settings, LogOut, BookOpen, BarChart3, Search, ChevronLeft, ChevronRight } from 'lucide-react'

interface User {
  id: string
  email: string
  role: 'ADMIN' | 'TEACHER' | 'STUDENT'
  firstName?: string
  lastName?: string
  isActive: boolean
  mustChangePassword: boolean
  createdAt: string
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddUser, setShowAddUser] = useState(false)
  const [showBulkUpload, setShowBulkUpload] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [usersPerPage] = useState(20)
  const { user, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      router.push('/login')
      return
    }
    fetchUsers()
  }, [user, router])

  // Filter users based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users)
    } else {
      const filtered = users.filter(user => {
        const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase()
        const email = user.email.toLowerCase()
        const search = searchTerm.toLowerCase()
        return fullName.includes(search) || email.includes(search)
      })
      setFilteredUsers(filtered)
    }
    setCurrentPage(1) // Reset to first page when searching
  }, [searchTerm, users])

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      setUsers(data)
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        setUsers(users.filter(u => u.id !== userId))
      } else {
        alert('Failed to delete user')
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Failed to delete user')
    }
  }

  const handleResetPassword = async (userId: string) => {
    if (!confirm('Are you sure you want to reset this user\'s password?')) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action: 'resetPassword' })
      })

      if (response.ok) {
        alert('Password reset successfully')
        fetchUsers()
      } else {
        alert('Failed to reset password')
      }
    } catch (error) {
      console.error('Error resetting password:', error)
      alert('Failed to reset password')
    }
  }

  const handleToggleActive = async (userId: string, isActive: boolean) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action: 'toggleActive', isActive })
      })

      if (response.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, isActive } : u))
      } else {
        alert('Failed to update user status')
      }
    } catch (error) {
      console.error('Error updating user:', error)
      alert('Failed to update user status')
    }
  }

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage)
  const startIndex = (currentPage - 1) * usersPerPage
  const endIndex = startIndex + usersPerPage
  const currentUsers = filteredUsers.slice(startIndex, endIndex)

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="loading-spinner mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
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
              <div className="h-12 w-12 bg-gradient-to-br from-[#792024] to-[#103352] rounded-xl flex items-center justify-center">
                <span className="text-xl font-bold text-white">A</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold gradient-text">Admin Dashboard</h1>
                <p className="text-gray-600 font-medium">Welcome back, {user?.email}</p>
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
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Action Buttons */}
        <div className="mb-8 flex flex-wrap gap-4">
          <button
            onClick={() => setShowAddUser(true)}
            className="btn-primary flex items-center gap-2"
          >
            <UserPlus className="h-5 w-5" />
            Add User
          </button>
          <button
            onClick={() => setShowBulkUpload(true)}
            className="btn-secondary flex items-center gap-2"
          >
            <Upload className="h-5 w-5" />
            Bulk Upload
          </button>
          <button
            onClick={() => router.push('/admin/courses')}
            className="btn-outline flex items-center gap-2"
          >
            <BookOpen className="h-5 w-5" />
            Manage Courses
          </button>
          <button
            onClick={() => router.push('/admin/quiz-scores')}
            className="btn-outline flex items-center gap-2"
          >
            <BarChart3 className="h-5 w-5" />
            Quiz Scores
          </button>
        </div>

        {/* Users Table */}
        <div className="card">
          <div className="card-header">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="card-title">User Management</h3>
                <p className="card-subtitle">
                  Manage all users in the system
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#792024] focus:border-transparent w-64"
                  />
                </div>
                <div className="text-sm text-gray-600">
                  {filteredUsers.length} of {users.length} users
                </div>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="w-16">#</th>
                  <th>User</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {currentUsers.map((user, index) => (
                  <tr key={user.id} className="table-row">
                    <td className="table-cell text-gray-500 text-sm">
                      {startIndex + index + 1}
                    </td>
                    <td className="table-cell">
                      <div>
                        <div className="font-semibold text-gray-900">
                          {user.firstName && user.lastName 
                            ? `${user.firstName} ${user.lastName}`
                            : user.email
                          }
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className={`badge ${
                        user.role === 'ADMIN' ? 'badge-admin' :
                        user.role === 'TEACHER' ? 'badge-teacher' :
                        'badge-student'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <span className={`badge ${
                          user.isActive ? 'badge-active' : 'badge-inactive'
                        }`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                        {user.mustChangePassword && (
                          <span className="badge badge-warning">
                            Must Change Password
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="table-cell text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleResetPassword(user.id)}
                          className="btn-ghost text-sm"
                        >
                          Reset Password
                        </button>
                        <button
                          onClick={() => handleToggleActive(user.id, !user.isActive)}
                          className={`btn-ghost text-sm ${
                            user.isActive ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'
                          }`}
                        >
                          {user.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="btn-ghost text-sm text-red-600 hover:text-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredUsers.length)} of {filteredUsers.length} results
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => goToPage(pageNum)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium ${
                            currentPage === pageNum
                              ? 'bg-[#792024] text-white'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Add User Modal */}
      {showAddUser && (
        <AddUserModal
          onClose={() => setShowAddUser(false)}
          onUserAdded={() => {
            setShowAddUser(false)
            fetchUsers()
          }}
        />
      )}

      {/* Bulk Upload Modal */}
      {showBulkUpload && (
        <BulkUploadModal
          onClose={() => setShowBulkUpload(false)}
          onUploadComplete={() => {
            setShowBulkUpload(false)
            fetchUsers()
          }}
        />
      )}
    </div>
  )
}

// Add User Modal Component
function AddUserModal({ onClose, onUserAdded }: { onClose: () => void, onUserAdded: () => void }) {
  const [formData, setFormData] = useState({
    email: '',
    role: 'STUDENT',
    firstName: '',
    lastName: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        onUserAdded()
      } else {
        setError(data.error)
      }
    } catch (error) {
      setError('Failed to create user')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3 className="modal-title">Add New User</h3>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                required
                className="input-field"
                placeholder="Enter email address"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Role</label>
              <select
                className="input-field"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="STUDENT">Student</option>
                <option value="TEACHER">Teacher</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">First Name (Optional)</label>
              <input
                type="text"
                className="input-field"
                placeholder="Enter first name"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name (Optional)</label>
              <input
                type="text"
                className="input-field"
                placeholder="Enter last name"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            </div>
            {error && <div className="form-error">{error}</div>}
          </form>
        </div>
        <div className="modal-footer">
          <button type="submit" disabled={loading} className="btn-primary flex-1" onClick={handleSubmit}>
            {loading ? 'Creating...' : 'Create User'}
          </button>
          <button type="button" onClick={onClose} className="btn-outline flex-1">
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

// Bulk Upload Modal Component
function BulkUploadModal({ onClose, onUploadComplete }: { onClose: () => void, onUploadComplete: () => void }) {
  const [emails, setEmails] = useState('')
  const [role, setRole] = useState('STUDENT')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ message: string; results: { successful: Array<{ row: number; data: unknown }>; failed: Array<{ row: number; error: string }> } } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const emailList = emails.split('\n').map(email => email.trim()).filter(email => email)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/bulk-upload', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ emails: emailList, role })
      })

      const data = await response.json()
      setResult(data)
      
      if (response.ok) {
        setTimeout(() => {
          onUploadComplete()
        }, 2000)
      }
    } catch (error) {
      console.error('Bulk upload error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-2xl">
        <div className="modal-header">
          <h3 className="modal-title">Bulk Upload Users</h3>
        </div>
        <div className="modal-body">
          {!result ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="form-group">
                <label className="form-label">Role</label>
                <select
                  className="input-field"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="STUDENT">Student</option>
                  <option value="TEACHER">Teacher</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Email Addresses (one per line)</label>
                <textarea
                  rows={8}
                  className="input-field resize-none"
                  placeholder="student1@example.com&#10;student2@example.com&#10;student3@example.com"
                  value={emails}
                  onChange={(e) => setEmails(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter one email address per line. Users will receive default passwords.
                </p>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                <p className="font-semibold text-green-900">{result.message}</p>
              </div>
              
              {result.results.successful.length > 0 && (
                <div>
                  <p className="text-green-700 font-semibold mb-2">
                    ✅ Successful ({result.results.successful.length}):
                  </p>
                  <div className="bg-green-50 rounded-lg p-3 max-h-32 overflow-y-auto">
                    <ul className="text-green-800 text-sm space-y-1">
                      {result.results.successful.map((item: { row: number; data: unknown }, index: number) => (
                        <li key={index} className="flex items-center gap-2">
                          <span className="w-1 h-1 bg-green-600 rounded-full"></span>
                          {item.data as string}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
              
              {result.results.failed.length > 0 && (
                <div>
                  <p className="text-red-700 font-semibold mb-2">
                    ❌ Failed ({result.results.failed.length}):
                  </p>
                  <div className="bg-red-50 rounded-lg p-3 max-h-32 overflow-y-auto">
                    <ul className="text-red-800 text-sm space-y-1">
                      {result.results.failed.map((item: { row: number; error: string }, index: number) => (
                        <li key={index} className="flex items-center gap-2">
                          <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                          Row {item.row}: <span className="text-red-600">({item.error})</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="modal-footer">
          {!result ? (
            <>
              <button type="submit" disabled={loading} className="btn-primary flex-1" onClick={handleSubmit}>
                {loading ? 'Uploading...' : 'Upload Users'}
              </button>
              <button type="button" onClick={onClose} className="btn-outline flex-1">
                Cancel
              </button>
            </>
          ) : (
            <button onClick={onClose} className="btn-primary w-full">
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
