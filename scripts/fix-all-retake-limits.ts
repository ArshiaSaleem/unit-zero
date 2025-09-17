import { prisma } from '../src/lib/prisma'

async function fixAllRetakeLimits() {
  console.log('🔧 Fixing ALL retake limits to 1...')

  // Update ALL QuizRetakePermission records to maxRetakes = 1
  const updatedPermissions = await prisma.quizRetakePermission.updateMany({
    data: {
      maxRetakes: 1
    }
  })
  console.log(`✅ Updated ${updatedPermissions.count} retake permissions to maxRetakes = 1`)

  // Update ALL Quiz records to maxRetakes = 1
  const updatedQuizzes = await prisma.quiz.updateMany({
    data: {
      maxRetakes: 1
    }
  })
  console.log(`✅ Updated ${updatedQuizzes.count} quizzes to maxRetakes = 1`)

  // Verify current state
  const currentPermissions = await prisma.quizRetakePermission.findMany({
    select: {
      userId: true,
      quizId: true,
      retakeCount: true,
      maxRetakes: true,
      isActive: true,
      quiz: { select: { title: true } },
      user: { select: { email: true } }
    },
    take: 10 // Show a sample
  })

  console.log('\n📊 Current retake permissions:')
  currentPermissions.forEach(p => {
    console.log(`- User ${p.user.email}... Quiz ${p.quiz.title}... Max: ${p.maxRetakes}, Used: ${p.retakeCount}, Active: ${p.isActive}`)
  })

  console.log('\n🎉 ALL retake limits fixed to 1!')
}

fixAllRetakeLimits()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
