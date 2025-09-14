import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      message: 'Debug endpoint working',
      hasJwtSecret: !!process.env.JWT_SECRET,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      jwtSecretLength: process.env.JWT_SECRET?.length || 0,
      databaseUrlPrefix: process.env.DATABASE_URL?.substring(0, 20) || 'not set',
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Debug endpoint failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}
