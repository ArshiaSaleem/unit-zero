import { PrismaClient } from '@prisma/client'

// Production database (PostgreSQL)
const productionPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

async function checkProductionDB() {
  try {
    console.log('🔍 Checking production database...')
    
    const userCount = await productionPrisma.user.count()
    const courseCount = await productionPrisma.course.count()
    const sectionCount = await productionPrisma.section.count()
    const lessonCount = await productionPrisma.lesson.count()
    const quizCount = await productionPrisma.quiz.count()
    const enrollmentCount = await productionPrisma.enrollment.count()
    
    console.log(`📊 Production Database Status:`)
    console.log(`   Users: ${userCount}`)
    console.log(`   Courses: ${courseCount}`)
    console.log(`   Sections: ${sectionCount}`)
    console.log(`   Lessons: ${lessonCount}`)
    console.log(`   Quizzes: ${quizCount}`)
    console.log(`   Enrollments: ${enrollmentCount}`)
    
    if (userCount > 0) {
      console.log('\n👥 Users in production:')
      const users = await productionPrisma.user.findMany({
        select: { id: true, email: true, role: true, firstName: true, lastName: true }
      })
      users.forEach(user => {
        console.log(`   - ${user.email} (${user.role}) - ${user.firstName} ${user.lastName}`)
      })
    }
    
  } catch (error) {
    console.error('❌ Error checking production database:', error)
  } finally {
    await productionPrisma.$disconnect()
  }
}

checkProductionDB()
