import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    const user = verifyToken(token)
    if (!user || user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all quizzes from courses assigned to this teacher
    const quizzes = await prisma.quiz.findMany({
      where: {
        section: {
          course: {
            teacherId: user.id
          }
        }
      },
      include: {
        section: {
          include: {
            course: {
              select: {
                id: true,
                title: true
              }
            }
          }
        },
        attempts: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        retakePermissions: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: [
        { section: { course: { title: 'asc' } } },
        { section: { order: 'asc' } },
        { createdAt: 'asc' }
      ]
    })

    // Process quiz data
    const quizScores = []
    
    for (const quiz of quizzes) {
      // Group attempts by user
      const userAttempts = new Map()
      
      for (const attempt of quiz.attempts) {
        const userId = attempt.userId
        if (!userAttempts.has(userId)) {
          userAttempts.set(userId, {
            user: attempt.user,
            attempts: [],
            retakePermission: quiz.retakePermissions.find(rp => rp.userId === userId) || null
          })
        }
        userAttempts.get(userId).attempts.push(attempt)
      }

      // Create entries for each user who attempted this quiz
      for (const [userId, userData] of userAttempts) {
        const attempts = userData.attempts
        const latestAttempt = attempts[0] // Most recent attempt
        const bestScore = Math.max(...attempts.map((a: { score: number }) => a.score))
        const retakePermission = userData.retakePermission

        quizScores.push({
          id: `${quiz.id}-${userId}`,
          courseId: quiz.section.course.id,
          courseTitle: quiz.section.course.title,
          sectionId: quiz.section.id,
          sectionTitle: quiz.section.title,
          quizId: quiz.id,
          quizTitle: quiz.title,
          passingScore: quiz.passingScore,
          maxRetakes: quiz.maxRetakes,
          user: userData.user,
          latestScore: latestAttempt.score,
          bestScore: bestScore,
          totalAttempts: attempts.length,
          isPassed: latestAttempt.score >= quiz.passingScore,
          latestAttemptDate: latestAttempt.createdAt,
          retakePermission: retakePermission ? {
            id: retakePermission.id,
            retakeCount: retakePermission.retakeCount,
            maxRetakes: retakePermission.maxRetakes,
            isActive: retakePermission.isActive,
            allowedBy: retakePermission.allowedBy,
            createdAt: retakePermission.createdAt
          } : null,
          canRetake: retakePermission ? 
            retakePermission.isActive && retakePermission.retakeCount < retakePermission.maxRetakes :
            false
        })
      }
    }

    return NextResponse.json({ quizScores })
  } catch (error) {
    console.error('Error fetching quiz scores:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    const user = verifyToken(token)
    if (!user || user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { action, userId, quizId, maxRetakes } = await request.json()

    if (action === 'grant_retake') {
      // Grant retake permission to a student
      const retakePermission = await prisma.quizRetakePermission.upsert({
        where: {
          userId_quizId: {
            userId,
            quizId
          }
        },
        update: {
          isActive: true,
          maxRetakes: maxRetakes || 3,
          allowedBy: user.id,
          retakeCount: 0
        },
        create: {
          userId,
          quizId,
          allowedBy: user.id,
          maxRetakes: maxRetakes || 3,
          isActive: true
        }
      })

      return NextResponse.json({ 
        success: true, 
        retakePermission,
        message: 'Retake permission granted successfully'
      })
    }

    if (action === 'revoke_retake') {
      // Revoke retake permission
      await prisma.quizRetakePermission.updateMany({
        where: {
          userId,
          quizId,
          allowedBy: user.id
        },
        data: {
          isActive: false
        }
      })

      return NextResponse.json({ 
        success: true,
        message: 'Retake permission revoked successfully'
      })
    }

    if (action === 'update_max_retakes') {
      // Update max retakes for a specific student
      await prisma.quizRetakePermission.updateMany({
        where: {
          userId,
          quizId,
          allowedBy: user.id
        },
        data: {
          maxRetakes: maxRetakes
        }
      })

      return NextResponse.json({ 
        success: true,
        message: 'Max retakes updated successfully'
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error managing retake permissions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
