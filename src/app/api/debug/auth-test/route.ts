import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    console.log('🔍 Production auth debug test starting...')
    
    // Test 1: Environment variables
    const envCheck = {
      DATABASE_URL: !!process.env.DATABASE_URL,
      JWT_SECRET: !!process.env.JWT_SECRET,
      NODE_ENV: process.env.NODE_ENV
    }
    
    // Test 2: Database connection
    const dbStart = Date.now()
    const userCount = await prisma.user.count()
    const dbTime = Date.now() - dbStart
    
    // Test 3: User lookup
    const lookupStart = Date.now()
    const admin = await prisma.user.findFirst({
      where: { email: { equals: 'admin@unitzero.com', mode: 'insensitive' } }
    })
    const lookupTime = Date.now() - lookupStart
    
    // Test 4: Authentication
    let authResult = null
    let authTime = 0
    if (admin) {
      const authStart = Date.now()
      authResult = await authenticateUser('admin@unitzero.com', 'admin123')
      authTime = Date.now() - authStart
    }
    
    const totalTime = Date.now() - startTime
    
    const result = {
      success: true,
      timing: {
        total: totalTime,
        database: dbTime,
        lookup: lookupTime,
        authentication: authTime
      },
      environment: envCheck,
      database: {
        connected: true,
        userCount,
        adminExists: !!admin,
        adminEmail: admin?.email,
        adminActive: admin?.isActive
      },
      authentication: {
        success: !!authResult,
        userRole: authResult?.role
      }
    }
    
    console.log('🔍 Production debug result:', result)
    
    return NextResponse.json(result)
    
  } catch (error: unknown) {
    const totalTime = Date.now() - startTime
    
    const message = error instanceof Error ? error.message : String(error)
    console.error('❌ Production auth debug failed:', message)
    
    return NextResponse.json({
      success: false,
      error: message,
      timing: { total: totalTime },
      environment: {
        DATABASE_URL: !!process.env.DATABASE_URL,
        JWT_SECRET: !!process.env.JWT_SECRET,
        NODE_ENV: process.env.NODE_ENV
      }
    }, { status: 500 })
  }
}
