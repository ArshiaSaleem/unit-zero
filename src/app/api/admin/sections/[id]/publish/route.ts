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

    const section = await prisma.section.update({
      where: { id },
      data: { isPublished },
      include: {
        course: true,
        lessons: true,
        quizzes: true
      }
    })

    return NextResponse.json({
      message: `Section ${isPublished ? 'published' : 'unpublished'} successfully`,
      section
    })
  } catch (error) {
    console.error('Error updating section publish status:', error)
    return NextResponse.json(
      { error: 'Failed to update section publish status' },
      { status: 500 }
    )
  }
}
