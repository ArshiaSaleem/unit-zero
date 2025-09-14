import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function GET(
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
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        sections: {
          include: {
            lessons: {
              include: {
                subLessons: {
                  orderBy: { order: 'asc' }
                }
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

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    return NextResponse.json(course)
  } catch (error) {
    console.error('Error fetching course:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
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
    const { title, description, content, thumbnail, isPublished } = await request.json()

    // If publishing the course, also publish all sections, lessons, and quizzes
    if (isPublished) {
      // First update the course
      const course = await prisma.course.update({
        where: { id },
        data: {
          title,
          description,
          content,
          thumbnail,
          isPublished
        }
      })

      // Then publish all sections and their content
      await prisma.section.updateMany({
        where: { courseId: id },
        data: { isPublished: true }
      })

      // Get all sections for this course
      const sections = await prisma.section.findMany({
        where: { courseId: id },
        select: { id: true }
      })

      // Publish all lessons in all sections
      for (const section of sections) {
        await prisma.lesson.updateMany({
          where: { sectionId: section.id },
          data: { isPublished: true }
        })

        await prisma.quiz.updateMany({
          where: { sectionId: section.id },
          data: { isPublished: true }
        })
      }

      // Return the updated course with all relations
      const updatedCourse = await prisma.course.findUnique({
        where: { id },
        include: {
          sections: {
            include: {
              lessons: {
                include: {
                  subLessons: {
                    orderBy: { order: 'asc' }
                  }
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

      return NextResponse.json(updatedCourse)
    } else {
      // If unpublishing, just update the course
      const course = await prisma.course.update({
        where: { id },
        data: {
          title,
          description,
          content,
          thumbnail,
          isPublished
        },
        include: {
          sections: {
            include: {
              lessons: {
                include: {
                  subLessons: {
                    orderBy: { order: 'asc' }
                  }
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
    }
  } catch (error) {
    console.error('Error updating course:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
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
    await prisma.course.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Course deleted successfully' })
  } catch (error) {
    console.error('Error deleting course:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
