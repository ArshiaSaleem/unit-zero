import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testConnection() {
  try {
    console.log('🔍 Testing Prisma connection...')
    
    // Test basic connection
    await prisma.$connect()
    console.log('✅ Prisma connected successfully')
    
    // Test QuizAttempt model
    console.log('🔍 Testing QuizAttempt model...')
    const attempts = await prisma.quizAttempt.findMany({
      take: 1,
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
    })
    console.log('✅ QuizAttempt with user relation works:', attempts.length, 'attempts found')
    
    // Test Quiz model with attempts
    console.log('🔍 Testing Quiz model with attempts...')
    const quizzes = await prisma.quiz.findMany({
      take: 1,
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
          }
        }
      }
    })
    console.log('✅ Quiz with attempts and user relations works:', quizzes.length, 'quizzes found')
    
  } catch (error) {
    console.error('❌ Prisma connection test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()
