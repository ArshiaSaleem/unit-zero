import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { generateRandomizedQuiz, convertRandomizedToOriginal, mapStudentAnswers } from '@/lib/quizUtils'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = verifyToken(token)
    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id: quizId } = await params
    const { answers } = await request.json()

    if (!answers || !Array.isArray(answers)) {
      return NextResponse.json(
        { error: 'Answers are required' },
        { status: 400 }
      )
    }

    // Get quiz details
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        section: {
          include: {
            course: {
              include: {
                enrollments: {
                  where: {
                    userId: user.id
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!quiz) {
      return NextResponse.json(
        { error: 'Quiz not found' },
        { status: 404 }
      )
    }

    // Check if student is enrolled in the course
    if (quiz.section.course.enrollments.length === 0) {
      return NextResponse.json(
        { error: 'You are not enrolled in this course' },
        { status: 403 }
      )
    }

    // Check if student has already attempted this quiz
    const existingAttempts = await prisma.quizAttempt.findMany({
      where: {
        userId: user.id,
        quizId: quizId
      },
      orderBy: { createdAt: 'desc' }
    })

    // Check retake permissions
    const retakePermission = await prisma.quizRetakePermission.findUnique({
      where: {
        userId_quizId: {
          userId: user.id,
          quizId: quizId
        }
      }
    })

    // If student has attempted and no retake permission, deny
    if (existingAttempts.length > 0 && !retakePermission?.isActive) {
      return NextResponse.json(
        { error: 'You have already taken this quiz. Retake permission is required.' },
        { status: 403 }
      )
    }

    // If student has retake permission but exceeded max retakes (admin can grant unlimited retakes with maxRetakes = 999)
    if (retakePermission && retakePermission.maxRetakes < 999 && retakePermission.retakeCount >= retakePermission.maxRetakes) {
      return NextResponse.json(
        { error: 'You have exceeded the maximum number of retakes allowed.' },
        { status: 403 }
      )
    }

    // Parse quiz questions
    let allQuestions
    try {
      allQuestions = JSON.parse(quiz.questions)
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid quiz format' },
        { status: 400 }
      )
    }

    if (!Array.isArray(allQuestions)) {
      return NextResponse.json(
        { error: 'Invalid quiz questions format' },
        { status: 400 }
      )
    }

    // Generate the same randomized quiz that the student saw
    // This ensures we're scoring against the same questions the student answered
    const randomizedQuestions = generateRandomizedQuiz(allQuestions, 10)

    // Convert student answers from randomized format back to original format
    const originalAnswers = mapStudentAnswers(randomizedQuestions, answers)

    // Convert randomized questions back to original format for scoring
    const originalQuestions = convertRandomizedToOriginal(randomizedQuestions)

    // Calculate score using simple, direct comparison
    // Since we're not shuffling options anymore, we can directly compare answers
    let correctAnswers = 0
    const totalQuestions = randomizedQuestions.length

    console.log('=== QUIZ SCORING DEBUG ===')
    console.log('Total questions:', totalQuestions)
    console.log('Student answers:', JSON.stringify(answers, null, 2))
    console.log('Randomized questions:', JSON.stringify(randomizedQuestions.map(q => ({
      id: q.id,
      type: q.type,
      question: q.question.substring(0, 50) + '...',
      options: q.options,
      correctAnswer: q.correctAnswer
    })), null, 2))

    for (let i = 0; i < randomizedQuestions.length; i++) {
      const question = randomizedQuestions[i]
      const userAnswer = answers[i]

      if (!userAnswer) {
        console.log(`Question ${i + 1}: No answer provided`)
        continue
      }

      console.log(`\n--- Question ${i + 1} ---`)
      console.log('Question type:', question.type)
      console.log('User answer:', userAnswer.answer)
      console.log('Correct answer:', question.correctAnswer)
      console.log('Question options:', question.options)

      switch (question.type) {
        case 'multiple-choice':
          // For multiple choice, compare the selected option index with correct answer index
          if (question.options && userAnswer.answer) {
            const selectedIndex = parseInt(userAnswer.answer)
            const correctIndex = question.options.findIndex(option => option === question.correctAnswer)
            console.log('Selected index:', selectedIndex)
            console.log('Correct index:', correctIndex)
            console.log('Selected option:', question.options[selectedIndex])
            console.log('Correct option:', question.options[correctIndex])
            
            if (selectedIndex === correctIndex) {
              correctAnswers++
              console.log('✅ CORRECT')
            } else {
              console.log('❌ WRONG')
            }
          }
          break
        case 'true-false':
          if (userAnswer.answer === question.correctAnswer) {
            correctAnswers++
            console.log('✅ CORRECT')
          } else {
            console.log('❌ WRONG')
          }
          break
        case 'short-answer':
          if (userAnswer.answer && 
              question.correctAnswer && 
              userAnswer.answer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim()) {
            correctAnswers++
            console.log('✅ CORRECT')
          } else {
            console.log('❌ WRONG')
          }
          break
        case 'essay':
          // For essay questions, we'll give full points if answered
          if (userAnswer.answer && userAnswer.answer.trim().length > 0) {
            correctAnswers++
            console.log('✅ CORRECT (essay answered)')
          } else {
            console.log('❌ WRONG (essay not answered)')
          }
          break
      }
    }

    console.log(`\n=== FINAL SCORE ===`)
    console.log('Correct answers:', correctAnswers)
    console.log('Total questions:', totalQuestions)
    console.log('Score percentage:', Math.round((correctAnswers / totalQuestions) * 100))
    console.log('========================')

    const score = Math.round((correctAnswers / totalQuestions) * 100)
    const passed = score >= quiz.passingScore

    // Determine if this is a retake
    const isRetake = existingAttempts.length > 0

    // Save quiz attempt with original answers for record keeping
    const attempt = await prisma.quizAttempt.create({
      data: {
        userId: user.id,
        quizId: quizId,
        answers: JSON.stringify(originalAnswers),
        score: score,
        completed: true,
        isRetake: isRetake
      }
    })

    // If this is a retake, update the retake count
    if (isRetake && retakePermission) {
      await prisma.quizRetakePermission.update({
        where: {
          userId_quizId: {
            userId: user.id,
            quizId: quizId
          }
        },
        data: {
          retakeCount: retakePermission.retakeCount + 1
        }
      })
    }

    return NextResponse.json({
      message: 'Quiz submitted successfully',
      attempt: {
        id: attempt.id,
        score: score,
        passed: passed,
        correctAnswers: correctAnswers,
        totalQuestions: totalQuestions,
        passingScore: quiz.passingScore
      }
    })
  } catch (error) {
    console.error('Error submitting quiz attempt:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

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
    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id: quizId } = await params

    // Get quiz details
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        section: {
          include: {
            course: {
              include: {
                enrollments: {
                  where: {
                    userId: user.id
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!quiz) {
      return NextResponse.json(
        { error: 'Quiz not found' },
        { status: 404 }
      )
    }

    // Check if student is enrolled in the course
    if (quiz.section.course.enrollments.length === 0) {
      return NextResponse.json(
        { error: 'You are not enrolled in this course' },
        { status: 403 }
      )
    }

    // Get student's attempts for this quiz
    const attempts = await prisma.quizAttempt.findMany({
      where: {
        userId: user.id,
        quizId: quizId
      },
      orderBy: { createdAt: 'desc' }
    })

    // Check retake permissions
    const retakePermission = await prisma.quizRetakePermission.findUnique({
      where: {
        userId_quizId: {
          userId: user.id,
          quizId: quizId
        }
      }
    })

    // Check if student can retake (admin can grant unlimited retakes with maxRetakes = 999)
    const canRetake = retakePermission?.isActive && 
      (!retakePermission || retakePermission.maxRetakes >= 999 || retakePermission.retakeCount < retakePermission.maxRetakes)

    // If student has attempted and no retake permission, return results only
    if (attempts.length > 0 && !canRetake) {
      return NextResponse.json({
        quiz: {
          id: quiz.id,
          title: quiz.title,
          description: quiz.description,
          timeLimit: quiz.timeLimit,
          passingScore: quiz.passingScore
        },
        attempts: attempts,
        courseId: quiz.section.course.id,
        alreadyAttempted: true,
        canRetake: false,
        message: 'You have already taken this quiz. Retake permission is required.'
      })
    }

    // Parse quiz questions for display
    let allQuestions
    try {
      allQuestions = JSON.parse(quiz.questions)
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid quiz format' },
        { status: 400 }
      )
    }

    // Generate randomized quiz (10 questions from available questions)
    const randomizedQuestions = generateRandomizedQuiz(allQuestions, 10)

    return NextResponse.json({
      quiz: {
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        questions: randomizedQuestions,
        timeLimit: quiz.timeLimit,
        passingScore: quiz.passingScore
      },
      attempts: attempts,
      courseId: quiz.section.course.id,
      alreadyAttempted: attempts.length > 0,
      canRetake: canRetake,
      retakePermission: retakePermission ? {
        retakeCount: retakePermission.retakeCount,
        maxRetakes: retakePermission.maxRetakes,
        isActive: retakePermission.isActive
      } : null
    })
  } catch (error) {
    console.error('Error fetching quiz for student:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
