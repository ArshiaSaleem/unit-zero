import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    console.log('🔍 Simple DB test starting...')
    
    // Test 1: Basic connection
    console.log('Testing basic connection...')
    const result = await prisma.$queryRaw`SELECT 1 as test`
    console.log('✅ Basic query successful:', result)
    
    // Test 2: Simple user count
    console.log('Testing user count...')
    const userCount = await prisma.user.count()
    console.log('✅ User count successful:', userCount)
    
    // Test 3: Find admin user
    console.log('Testing admin user lookup...')
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@unitzero.com' },
      select: { id: true, email: true, role: true, isActive: true }
    })
    console.log('✅ Admin lookup successful:', admin)
    
    const totalTime = Date.now() - startTime
    
    return NextResponse.json({
      success: true,
      timing: { total: totalTime },
      results: {
        basicQuery: result,
        userCount,
        adminUser: admin
      },
      message: 'All database operations successful!'
    })
    
  } catch (error: any) {
    const totalTime = Date.now() - startTime
    
    console.error('❌ Simple DB test failed:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message,
      timing: { total: totalTime },
      errorType: error.constructor.name,
      errorCode: error.code
    }, { status: 500 })
  }
}
