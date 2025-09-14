import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = verifyToken(token)
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const { teacherId } = await request.json()

    // Validate teacher if provided
    if (teacherId) {
      const teacher = await prisma.user.findUnique({
        where: { id: teacherId, role: 'TEACHER' }
      })
      
      if (!teacher) {
        return NextResponse.json(
          { error: 'Invalid teacher ID' },
          { status: 400 }
        )
      }
    }

    // Update the course with the assigned teacher
    const course = await prisma.course.update({
      where: { id },
      data: { teacherId: teacherId || null },
      include: {
        teacher: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        },
        sections: {
          include: {
            lessons: {
              include: {
                subLessons: true
              },
              orderBy: { order: 'asc' }
            },
            quizzes: {
              orderBy: { createdAt: 'asc' }
            }
          },
          orderBy: { order: 'asc' }
        },
        _count: {
          select: {
            enrollments: true
          }
        }
      }
    })

    return NextResponse.json(course)
  } catch (error) {
    console.error('Error assigning teacher to course:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
