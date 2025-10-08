import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export async function GET(request: NextRequest) {
  const results: any = {
    timestamp: new Date().toISOString(),
    attempts: [],
    final_result: null
  }

  // Try multiple connection strategies
  const strategies = [
    {
      name: 'Direct connection',
      url: process.env.DATABASE_URL
    },
    {
      name: 'Connection with timeout',
      url: process.env.DATABASE_URL + '?connect_timeout=10&pool_timeout=20'
    },
    {
      name: 'Connection with pooling',
      url: process.env.DATABASE_URL + '?pgbouncer=true&connection_limit=1'
    }
  ]

  for (const strategy of strategies) {
    const attempt = {
      strategy: strategy.name,
      start_time: Date.now(),
      status: 'attempting',
      error: null,
      duration_ms: 0
    }

    try {
      const prisma = new PrismaClient({
        datasources: {
          db: {
            url: strategy.url
          }
        },
        log: ['error']
      })

      // Try a simple query with retry logic
      let success = false
      for (let i = 0; i < 3; i++) {
        try {
          await prisma.$executeRaw`SELECT 1 as test`
          success = true
          break
        } catch (err: any) {
          if (i < 2) {
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, 1000))
          }
          throw err
        }
      }

      if (success) {
        attempt.status = 'SUCCESS'
        results.final_result = {
          working_strategy: strategy.name,
          working_url: (strategy.url || '').substring(0, 50) + '...'
        }
      }

      await prisma.$disconnect()

    } catch (error: any) {
      attempt.status = 'FAILED'
      attempt.error = error.message
    }

    attempt.duration_ms = Date.now() - attempt.start_time
    results.attempts.push(attempt)

    // If we found a working strategy, break
    if (attempt.status === 'SUCCESS') {
      break
    }
  }

  results.overall_status = results.final_result ? 'FOUND_WORKING_CONNECTION' : 'ALL_CONNECTIONS_FAILED'

  return NextResponse.json(results, { status: 200 })
}
