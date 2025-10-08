import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  const results: any = {
    timestamp: new Date().toISOString(),
    tests: [],
    errors: []
  }

  try {
    // Test 1: Check DATABASE_URL
    results.tests.push({
      name: 'DATABASE_URL check',
      status: process.env.DATABASE_URL ? 'SET' : 'MISSING',
      url_preview: process.env.DATABASE_URL ? 
        (process.env.DATABASE_URL.substring(0, 30) + '...') : 
        'NOT SET'
    })

    // Test 2: Simple DB query
    try {
      const dbStart = Date.now()
      await prisma.$executeRaw`SELECT 1`
      results.tests.push({
        name: 'Simple SELECT query',
        status: 'SUCCESS',
        duration_ms: Date.now() - dbStart
      })
    } catch (err: any) {
      results.errors.push({
        test: 'Simple SELECT query',
        error: err.message,
        code: err.code
      })
    }

    // Test 3: Count users
    try {
      const countStart = Date.now()
      const userCount = await prisma.user.count()
      results.tests.push({
        name: 'Count users',
        status: 'SUCCESS',
        count: userCount,
        duration_ms: Date.now() - countStart
      })
    } catch (err: any) {
      results.errors.push({
        test: 'Count users',
        error: err.message,
        code: err.code
      })
    }

    // Test 4: Find admin user
    try {
      const findStart = Date.now()
      const admin = await prisma.user.findFirst({
        where: { role: 'ADMIN' }
      })
      results.tests.push({
        name: 'Find admin user',
        status: admin ? 'SUCCESS' : 'NO_ADMIN_FOUND',
        email: admin?.email || null,
        has_password: admin?.password ? true : false,
        password_is_hash: admin?.password?.startsWith('$2') || false,
        duration_ms: Date.now() - findStart
      })

      // Test 5: Test admin login credentials if found
      if (admin) {
        try {
          const testPassword = 'admin123'
          const passwordStart = Date.now()
          
          let passwordMatch = false
          if (admin.password.startsWith('$2')) {
            // Bcrypt hash
            passwordMatch = await bcrypt.compare(testPassword, admin.password)
          } else {
            // Plain text
            passwordMatch = testPassword === admin.password
          }

          results.tests.push({
            name: 'Test admin password (admin123)',
            status: passwordMatch ? 'PASSWORD_MATCHES' : 'PASSWORD_MISMATCH',
            password_type: admin.password.startsWith('$2') ? 'bcrypt_hash' : 'plain_text',
            duration_ms: Date.now() - passwordStart
          })
        } catch (err: any) {
          results.errors.push({
            test: 'Test admin password',
            error: err.message
          })
        }
      }
    } catch (err: any) {
      results.errors.push({
        test: 'Find admin user',
        error: err.message,
        code: err.code
      })
    }

    // Test 6: List all users (just emails and roles)
    try {
      const allUsers = await prisma.user.findMany({
        select: {
          email: true,
          role: true,
          isActive: true,
          password: true
        },
        take: 10
      })
      results.tests.push({
        name: 'List first 10 users',
        status: 'SUCCESS',
        users: allUsers.map(u => ({
          email: u.email,
          role: u.role,
          isActive: u.isActive,
          password_type: u.password?.startsWith('$2') ? 'bcrypt' : 'plain'
        }))
      })
    } catch (err: any) {
      results.errors.push({
        test: 'List users',
        error: err.message,
        code: err.code
      })
    }

    results.total_duration_ms = Date.now() - startTime
    results.overall_status = results.errors.length === 0 ? 'ALL_TESTS_PASSED' : 'SOME_TESTS_FAILED'

    return NextResponse.json(results, { status: 200 })

  } catch (error: any) {
    return NextResponse.json({
      error: 'Debug endpoint failed',
      message: error.message,
      stack: error.stack,
      duration_ms: Date.now() - startTime
    }, { status: 500 })
  }
}

