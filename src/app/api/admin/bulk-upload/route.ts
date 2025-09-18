import { NextRequest, NextResponse } from 'next/server'
import { hashPassword, verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = verifyToken(token)
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { emails, role } = await request.json()

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json(
        { error: 'Emails array is required' },
        { status: 400 }
      )
    }

    if (!role || !['TEACHER', 'STUDENT'].includes(role)) {
      return NextResponse.json(
        { error: 'Valid role is required' },
        { status: 400 }
      )
    }

    const defaultPassword = role === 'STUDENT' 
      ? process.env.DEFAULT_STUDENT_PASSWORD || 'student123'
      : process.env.DEFAULT_TEACHER_PASSWORD || 'teacher123'

    const hashedPassword = await hashPassword(defaultPassword)

    const results = {
      successful: [] as string[],
      failed: [] as { email: string; reason: string }[]
    }

    for (const email of emails) {
      try {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
          where: { email: email.trim() }
        })

        if (existingUser) {
          results.failed.push({
            email: email.trim(),
            reason: 'User already exists'
          })
          continue
        }

        // Create new user
        await prisma.user.create({
          data: {
            email: email.trim(),
            password: hashedPassword,
            role,
            mustChangePassword: true
          }
        })

        results.successful.push(email.trim())
      } catch (error) {
        results.failed.push({
          email: email.trim(),
          reason: 'Database error'
        })
      }
    }

    return NextResponse.json({
      message: `Bulk upload completed. ${results.successful.length} successful, ${results.failed.length} failed.`,
      results
    })
  } catch (error) {
    console.error('Bulk upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
