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

    // First check if quiz exists
    const existingQuiz = await prisma.quiz.findUnique({
      where: { id }
    })

    if (!existingQuiz) {
      return NextResponse.json(
        { error: 'Quiz not found' },
        { status: 404 }
      )
    }

    const quiz = await prisma.quiz.update({
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
      message: `Quiz ${isPublished ? 'published' : 'unpublished'} successfully`,
      quiz
    })
  } catch (error) {
    console.error('Error updating quiz publish status:', error)
    return NextResponse.json(
      { 
        error: 'Failed to update quiz publish status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
