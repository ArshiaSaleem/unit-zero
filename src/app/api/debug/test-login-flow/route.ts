import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const results: any = {
    timestamp: new Date().toISOString(),
    tests: [],
    errors: []
  }

  try {
    // Test 1: Admin login
    try {
      const startTime = Date.now()
      const admin = await authenticateUser('admin@example.com', 'admin123')
      results.tests.push({
        name: 'Admin login test',
        status: admin ? 'SUCCESS' : 'FAILED',
        user_found: !!admin,
        email: admin?.email || null,
        role: admin?.role || null,
        duration_ms: Date.now() - startTime
      })
    } catch (err: any) {
      results.errors.push({
        test: 'Admin login',
        error: err.message
      })
    }

    // Test 2: Try a few other common credentials
    const testCredentials = [
      { email: 'admin@example.com', password: 'admin123', name: 'Admin with admin123' },
      { email: 'admin@example.com', password: 'password', name: 'Admin with password' },
      { email: 'admin@example.com', password: 'admin', name: 'Admin with admin' }
    ]

    for (const cred of testCredentials) {
      try {
        const startTime = Date.now()
        const user = await authenticateUser(cred.email, cred.password)
        results.tests.push({
          name: cred.name,
          status: user ? 'SUCCESS' : 'FAILED',
          duration_ms: Date.now() - startTime
        })
      } catch (err: any) {
        results.errors.push({
          test: cred.name,
          error: err.message
        })
      }
    }

    results.overall_status = results.errors.length === 0 ? 'ALL_LOGIN_TESTS_PASSED' : 'SOME_LOGIN_TESTS_FAILED'

    return NextResponse.json(results, { status: 200 })

  } catch (error: any) {
    return NextResponse.json({
      error: 'Login flow test failed',
      message: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}
