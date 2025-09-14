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

    // Find the student's enrollment
    const enrollment = await prisma.courseEnrollment.findFirst({
      where: {
        userId: user.id
      },
      include: {
        course: {
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
                isPublished: true,
                isLocked: false
              },
              include: {
                lessons: {
                  where: {
                    isPublished: true,
                    isLocked: false
                  },
                  orderBy: { order: 'asc' }
                },
                quizzes: {
                  where: {
                    isPublished: true,
                    isLocked: false
                  },
                  include: {
                    attempts: {
                      where: {
                        userId: user.id
                      },
                      orderBy: { createdAt: 'desc' }
                    }
                  },
                  orderBy: { createdAt: 'asc' }
                }
              },
              orderBy: { order: 'asc' }
            }
          }
        }
      }
    })

    if (!enrollment) {
      return NextResponse.json(
        { error: 'No course enrolled' },
        { status: 404 }
      )
    }

    return NextResponse.json(enrollment.course)
  } catch (error) {
    console.error('Error fetching student course:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
