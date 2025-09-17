import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixRetakeLimits() {
  try {
    console.log('🔧 Fixing retake limits...')
    
    // Update all existing retake permissions to have maxRetakes = 1
    const result = await prisma.quizRetakePermission.updateMany({
      where: {
        maxRetakes: {
          gt: 1
        }
      },
      data: {
        maxRetakes: 1
      }
    })
    
    console.log(`✅ Updated ${result.count} retake permissions to maxRetakes = 1`)
    
    // Also update all quizzes to have maxRetakes = 1
    const quizResult = await prisma.quiz.updateMany({
      where: {
        maxRetakes: {
          gt: 1
        }
      },
      data: {
        maxRetakes: 1
      }
    })
    
    console.log(`✅ Updated ${quizResult.count} quizzes to maxRetakes = 1`)
    
    // Show current retake permissions
    const retakePermissions = await prisma.quizRetakePermission.findMany({
      select: {
        id: true,
        userId: true,
        quizId: true,
        maxRetakes: true,
        retakeCount: true,
        isActive: true
      }
    })
    
    console.log('\n📊 Current retake permissions:')
    retakePermissions.forEach(perm => {
      console.log(`- User ${perm.userId.slice(0, 8)}... Quiz ${perm.quizId.slice(0, 8)}... Max: ${perm.maxRetakes}, Used: ${perm.retakeCount}, Active: ${perm.isActive}`)
    })
    
    console.log('\n🎉 All retake limits fixed!')
    
  } catch (error) {
    console.error('❌ Error fixing retake limits:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixRetakeLimits()
