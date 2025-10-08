import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const dbUrl = process.env.DATABASE_URL
  
  if (!dbUrl) {
    return NextResponse.json({
      success: false,
      error: 'DATABASE_URL not set',
      environment: {
        DATABASE_URL: false,
        JWT_SECRET: !!process.env.JWT_SECRET,
        NODE_ENV: process.env.NODE_ENV
      }
    })
  }
  
  // Don't expose the full URL for security, just show connection type
  const urlInfo = {
    isSet: true,
    length: dbUrl.length,
    isPooled: dbUrl.includes('pooler') || dbUrl.includes('pooled'),
    isDirect: dbUrl.includes('direct'),
    hasSSL: dbUrl.includes('sslmode'),
    hostType: dbUrl.includes('aws') ? 'AWS' : dbUrl.includes('vercel') ? 'Vercel' : 'Other'
  }
  
  return NextResponse.json({
    success: true,
    databaseUrl: urlInfo,
    environment: {
      DATABASE_URL: true,
      JWT_SECRET: !!process.env.JWT_SECRET,
      NODE_ENV: process.env.NODE_ENV
    }
  })
}
