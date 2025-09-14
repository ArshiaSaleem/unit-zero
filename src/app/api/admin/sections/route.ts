import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

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

    const { title, description, courseId, isPublished = false } = await request.json()

    if (!title || !courseId) {
      return NextResponse.json(
        { error: 'Title and courseId are required' },
        { status: 400 }
      )
    }

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    })

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    // Get the next order number
    const lastSection = await prisma.section.findFirst({
      where: { courseId },
      orderBy: { order: 'desc' }
    })

    const order = lastSection ? lastSection.order + 1 : 0

    const section = await prisma.section.create({
      data: {
        title,
        description,
        courseId,
        order,
        isPublished
      },
      include: {
        course: {
          select: {
            id: true,
            title: true
          }
        },
        lessons: {
          orderBy: { order: 'asc' }
        },
        quizzes: {
          orderBy: { createdAt: 'asc' }
        }
      }
    })

    return NextResponse.json(section)
  } catch (error) {
    console.error('Error creating section:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

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

    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')

    const sections = await prisma.section.findMany({
      where: courseId ? { courseId } : {},
      include: {
        course: {
          select: {
            id: true,
            title: true
          }
        },
        lessons: {
          orderBy: { order: 'asc' }
        },
        quizzes: {
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { order: 'asc' }
    })

    return NextResponse.json(sections)
  } catch (error) {
    console.error('Error fetching sections:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
