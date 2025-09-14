import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = verifyToken(token)
    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Fetch published courses with enrollment status
    const courses = await prisma.course.findMany({
      where: {
        isPublished: true
      },
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
          where: {
            isPublished: true
          },
          include: {
            lessons: {
              where: {
                isPublished: true
              },
              orderBy: { order: 'asc' }
            },
            quizzes: {
              where: {
                isPublished: true
              },
              orderBy: { createdAt: 'asc' }
            }
          },
          orderBy: { order: 'asc' }
        },
        enrollments: {
          where: {
            userId: user.id
          }
        },
        _count: {
          select: {
            enrollments: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Add enrollment status to each course
    const coursesWithEnrollment = courses.map(course => ({
      ...course,
      isEnrolled: course.enrollments.length > 0,
      enrollment: course.enrollments[0] || null
    }))

    return NextResponse.json(coursesWithEnrollment)
  } catch (error) {
    console.error('Error fetching courses for student:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
