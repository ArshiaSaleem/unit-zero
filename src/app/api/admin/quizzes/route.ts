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

    const { 
      title, 
      description, 
      questions, 
      settings, 
      timeLimit, 
      passingScore = 70, 
      sectionId, 
      isPublished = false 
    } = await request.json()

    if (!title || !sectionId) {
      return NextResponse.json(
        { error: 'Title and sectionId are required' },
        { status: 400 }
      )
    }

    // Check if section exists
    const section = await prisma.section.findUnique({
      where: { id: sectionId }
    })

    if (!section) {
      return NextResponse.json(
        { error: 'Section not found' },
        { status: 404 }
      )
    }

    const quiz = await prisma.quiz.create({
      data: {
        title,
        description,
        questions: JSON.stringify(questions || []),
        settings: settings ? JSON.stringify(settings) : null,
        timeLimit,
        passingScore,
        sectionId,
        isPublished
      },
      include: {
        section: {
          select: {
            id: true,
            title: true,
            course: {
              select: {
                id: true,
                title: true
              }
            }
          }
        },
        attempts: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    return NextResponse.json(quiz)
  } catch (error) {
    console.error('Error creating quiz:', error)
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
    const sectionId = searchParams.get('sectionId')

    const quizzes = await prisma.quiz.findMany({
      where: sectionId ? { sectionId } : {},
      include: {
        section: {
          select: {
            id: true,
            title: true,
            course: {
              select: {
                id: true,
                title: true
              }
            }
          }
        },
        attempts: {
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { createdAt: 'asc' }
    })

    return NextResponse.json(quizzes)
  } catch (error) {
    console.error('Error fetching quizzes:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
