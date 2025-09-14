import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    const user = verifyToken(token)
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { isPublished } = await request.json()

    // First check if lesson exists
    const existingLesson = await prisma.lesson.findUnique({
      where: { id }
    })

    if (!existingLesson) {
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 }
      )
    }

    const lesson = await prisma.lesson.update({
      where: { id },
      data: { isPublished },
      include: {
        section: {
          include: {
            course: true
          }
        }
      }
    })

    return NextResponse.json({
      message: `Lesson ${isPublished ? 'published' : 'unpublished'} successfully`,
      lesson
    })
  } catch (error) {
    console.error('Error updating lesson publish status:', error)
    return NextResponse.json(
      { 
        error: 'Failed to update lesson publish status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
