import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    const user = verifyToken(token)
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId, quizId, action } = await request.json()

    if (!userId || !quizId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (action === 'grant') {
      // Verify that the user and quiz exist
      const [targetUser, targetQuiz] = await Promise.all([
        prisma.user.findUnique({ where: { id: userId } }),
        prisma.quiz.findUnique({ where: { id: quizId } })
      ])

      if (!targetUser) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      if (!targetQuiz) {
        return NextResponse.json({ error: 'Quiz not found' }, { status: 404 })
      }

      // Grant or update retake permission (admin can override any limits)
      const retakePermission = await prisma.quizRetakePermission.upsert({
        where: {
          userId_quizId: {
            userId,
            quizId
          }
        },
        update: {
          isActive: true,
          retakeCount: 0, // Reset retake count when admin grants permission
          maxRetakes: 999, // Admin can allow unlimited retakes
          allowedBy: user.id,
          updatedAt: new Date()
        },
        create: {
          userId,
          quizId,
          isActive: true,
          retakeCount: 0,
          maxRetakes: 999, // Admin can allow unlimited retakes
          allowedBy: user.id
        }
      })

      return NextResponse.json({ 
        success: true, 
        message: 'Retake permission granted by admin',
        retakePermission 
      })
    } else if (action === 'revoke') {
      // Revoke retake permission
      await prisma.quizRetakePermission.updateMany({
        where: {
          userId,
          quizId
        },
        data: {
          isActive: false,
          updatedAt: new Date()
        }
      })

      return NextResponse.json({ 
        success: true, 
        message: 'Retake permission revoked by admin' 
      })
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('Error managing retake permission:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
