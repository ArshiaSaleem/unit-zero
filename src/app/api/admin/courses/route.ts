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
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

          const courses = await prisma.course.findMany({
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
            },
            orderBy: { createdAt: 'desc' }
          })

    return NextResponse.json(courses)
  } catch (error) {
    console.error('Error fetching courses:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

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

    const { title, description, content, thumbnail, teacherId } = await request.json()

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

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

    const course = await prisma.course.create({
      data: {
        title,
        description,
        content,
        thumbnail,
        teacherId: teacherId || null
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
    console.error('Error creating course:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = verifyToken(token)
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { courseId, isPublished } = await request.json()

    if (!courseId || typeof isPublished !== 'boolean') {
      return NextResponse.json(
        { error: 'Course ID and isPublished status are required' },
        { status: 400 }
      )
    }

    // If publishing the course, also publish all sections, lessons, and quizzes
    if (isPublished) {
      // First update the course
      await prisma.course.update({
        where: { id: courseId },
        data: { isPublished }
      })

      // Then publish all sections and their content
      await prisma.section.updateMany({
        where: { courseId },
        data: { isPublished: true }
      })

      // Get all sections for this course
      const sections = await prisma.section.findMany({
        where: { courseId },
        select: { id: true }
      })

      // Publish all lessons and quizzes in all sections
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
    } else {
      // If unpublishing, just update the course
      await prisma.course.update({
        where: { id: courseId },
        data: { isPublished }
      })
    }

    // Return the updated course with all relations
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
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
    console.error('Error updating course:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = verifyToken(token)
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { courseId } = await request.json()

    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      )
    }

    // Get the original course with all its content
    const originalCourse = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
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
        }
      }
    })

    if (!originalCourse) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    // Create the duplicated course
    const duplicatedCourse = await prisma.course.create({
      data: {
        title: `${originalCourse.title} (Copy)`,
        description: originalCourse.description,
        content: originalCourse.content,
        thumbnail: originalCourse.thumbnail,
        isPublished: false, // Always create as draft
        sections: {
          create: originalCourse.sections.map(section => ({
            title: section.title,
            description: section.description,
            order: section.order,
            isPublished: false, // Always create as draft
            lessons: {
              create: section.lessons.map(lesson => ({
                title: lesson.title,
                content: lesson.content,
                order: lesson.order,
                isPublished: false, // Always create as draft
                subLessons: {
                  create: lesson.subLessons.map(subLesson => ({
                    title: subLesson.title,
                    content: subLesson.content,
                    order: subLesson.order,
                    isPublished: false // Always create as draft
                  }))
                }
              }))
            },
            quizzes: {
              create: section.quizzes.map(quiz => ({
                title: quiz.title,
                description: quiz.description,
                questions: quiz.questions,
                settings: quiz.settings,
                timeLimit: quiz.timeLimit,
                passingScore: quiz.passingScore,
                isPublished: false // Always create as draft
              }))
            }
          }))
        }
      },
      include: {
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

    return NextResponse.json(duplicatedCourse)
  } catch (error) {
    console.error('Error duplicating course:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
