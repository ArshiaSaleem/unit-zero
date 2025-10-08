import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export async function GET(request: NextRequest) {
  const results: any = {
    timestamp: new Date().toISOString(),
    tests: [],
    errors: []
  }

  try {
    // Test 1: Check environment
    results.tests.push({
      name: 'Environment check',
      DATABASE_URL_set: !!process.env.DATABASE_URL,
      NODE_ENV: process.env.NODE_ENV,
      url_preview: process.env.DATABASE_URL?.substring(0, 30) + '...'
    })

    // Test 2: Create fresh Prisma client
    let prisma: PrismaClient
    try {
      prisma = new PrismaClient({
        datasources: {
          db: {
            url: process.env.DATABASE_URL
          }
        },
        log: ['error'],
        errorFormat: 'minimal'
      })
      results.tests.push({
        name: 'Prisma client creation',
        status: 'SUCCESS'
      })
    } catch (err: any) {
      results.errors.push({
        test: 'Prisma client creation',
        error: err.message
      })
      return NextResponse.json(results, { status: 200 })
    }

    // Test 3: Test connection with timeout
    try {
      const startTime = Date.now()
      
      // Use Promise.race to add timeout
      const queryPromise = prisma.$executeRaw`SELECT 1 as test`
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Query timeout after 5 seconds')), 5000)
      )
      
      await Promise.race([queryPromise, timeoutPromise])
      
      results.tests.push({
        name: 'Connection test with timeout',
        status: 'SUCCESS',
        duration_ms: Date.now() - startTime
      })
    } catch (err: any) {
      results.errors.push({
        test: 'Connection test with timeout',
        error: err.message,
        type: err.constructor.name
      })
    }

    // Test 4: Test with connection pooling parameters
    try {
      const startTime = Date.now()
      
      // Try with explicit connection parameters
      const prismaWithPool = new PrismaClient({
        datasources: {
          db: {
            url: process.env.DATABASE_URL + '?connection_limit=1&pool_timeout=20&connect_timeout=10'
          }
        },
        log: ['error']
      })
      
      await prismaWithPool.$executeRaw`SELECT 1 as test`
      await prismaWithPool.$disconnect()
      
      results.tests.push({
        name: 'Connection with pooling params',
        status: 'SUCCESS',
        duration_ms: Date.now() - startTime
      })
    } catch (err: any) {
      results.errors.push({
        test: 'Connection with pooling params',
        error: err.message,
        type: err.constructor.name
      })
    }

    // Test 5: Test database server status
    try {
      const startTime = Date.now()
      const serverInfo = await prisma.$executeRaw`SELECT version() as version, now() as current_time`
      results.tests.push({
        name: 'Database server info',
        status: 'SUCCESS',
        duration_ms: Date.now() - startTime,
        server_response: serverInfo
      })
    } catch (err: any) {
      results.errors.push({
        test: 'Database server info',
        error: err.message,
        type: err.constructor.name
      })
    }

    // Cleanup
    try {
      await prisma.$disconnect()
    } catch (err) {
      // Ignore disconnect errors
    }

    results.overall_status = results.errors.length === 0 ? 'ALL_TESTS_PASSED' : 'SOME_TESTS_FAILED'

    return NextResponse.json(results, { status: 200 })

  } catch (error: any) {
    return NextResponse.json({
      error: 'Debug endpoint failed',
      message: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}
