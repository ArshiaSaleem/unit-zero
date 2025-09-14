import { PrismaClient } from '@prisma/client'

// Production database (PostgreSQL from Vercel)
const productionPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.PRODUCTION_DATABASE_URL || 'postgres://c2012740f591e59ba3fcee86319ef1dc7c74e4f71411b52a90c2fe9e04fc7faa:sk_Yg9DcqhWhsTT-NeDw0V2z@db.prisma.io:5432/postgres?sslmode=require'
    }
  }
})

async function checkProductionData() {
  try {
    console.log('🔍 Checking production database data...')
    
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
        select: { id: true, email: true, role: true, firstName: true, lastName: true },
        take: 10
      })
      users.forEach(user => {
        console.log(`   - ${user.email} (${user.role}) - ${user.firstName} ${user.lastName}`)
      })
      if (userCount > 10) {
        console.log(`   ... and ${userCount - 10} more users`)
      }
    }
    
    if (courseCount > 0) {
      console.log('\n📚 Courses in production:')
      const courses = await productionPrisma.course.findMany({
        select: { id: true, title: true, isPublished: true }
      })
      courses.forEach(course => {
        console.log(`   - ${course.title} (Published: ${course.isPublished})`)
      })
    }
    
  } catch (error) {
    console.error('❌ Error checking production database:', error)
  } finally {
    await productionPrisma.$disconnect()
  }
}

checkProductionData()
