import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    const user = verifyToken(token)
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all courses with their quiz scores
    const courses = await prisma.course.findMany({
      include: {
        sections: {
          include: {
            quizzes: {
              include: {
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
              }
            }
          }
        },
        enrollments: {
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
      orderBy: { title: 'asc' }
    })

    // Process the data to create quiz scores
    const quizScores = []
    
    for (const course of courses) {
      for (const section of course.sections) {
        for (const quiz of section.quizzes) {
          // Get all students enrolled in this course
          const enrolledStudents = course.enrollments.map(enrollment => enrollment.user)
          
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

          // Create entries for each enrolled student
          for (const student of enrolledStudents) {
            const userData = userAttempts.get(student.id)
            const attempts = userData?.attempts || []
            const latestAttempt = attempts[0] // Most recent attempt
            const bestScore = attempts.length > 0 ? Math.max(...attempts.map(a => a.score)) : 0
            const retakePermission = userData?.retakePermission || null

            quizScores.push({
              id: `${quiz.id}-${student.id}`,
              courseId: course.id,
              courseTitle: course.title,
              sectionId: section.id,
              sectionTitle: section.title,
              quizId: quiz.id,
              quizTitle: quiz.title,
              passingScore: quiz.passingScore,
              maxRetakes: quiz.maxRetakes,
              user: student,
              latestScore: latestAttempt?.score || 0,
              bestScore: bestScore,
              totalAttempts: attempts.length,
              isPassed: latestAttempt ? latestAttempt.score >= quiz.passingScore : false,
              latestAttemptDate: latestAttempt?.createdAt || null,
              hasAttempted: attempts.length > 0,
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
      }
    }

    return NextResponse.json({ quizScores })
  } catch (error) {
    console.error('Error fetching admin quiz scores:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

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

    const { action, userId, quizId, maxRetakes } = await request.json()

    if (action === 'grant_retake') {
      // Grant retake permission
      const retakePermission = await prisma.quizRetakePermission.upsert({
        where: {
          userId_quizId: {
            userId: userId,
            quizId: quizId
          }
        },
        update: {
          isActive: true,
          maxRetakes: maxRetakes || 3,
          retakeCount: 0
        },
        create: {
          userId: userId,
          quizId: quizId,
          allowedBy: user.id,
          maxRetakes: maxRetakes || 3,
          isActive: true
        }
      })

      return NextResponse.json({ success: true, retakePermission })
    } else if (action === 'revoke_retake') {
      // Revoke retake permission
      await prisma.quizRetakePermission.updateMany({
        where: {
          userId: userId,
          quizId: quizId
        },
        data: {
          isActive: false
        }
      })

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error managing retake permissions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
