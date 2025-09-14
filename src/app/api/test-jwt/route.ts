import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const jwtSecret = process.env.JWT_SECRET
    const databaseUrl = process.env.DATABASE_URL
    
    if (!jwtSecret) {
      return NextResponse.json({
        error: 'JWT_SECRET is not set',
        hasJwtSecret: false,
        hasDatabaseUrl: !!databaseUrl,
      }, { status: 500 })
    }

    if (!databaseUrl) {
      return NextResponse.json({
        error: 'DATABASE_URL is not set',
        hasJwtSecret: true,
        hasDatabaseUrl: false,
      }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Environment variables are set correctly',
      hasJwtSecret: true,
      hasDatabaseUrl: true,
      jwtSecretLength: jwtSecret.length,
      databaseUrlPrefix: databaseUrl.substring(0, 20),
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Test failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}
