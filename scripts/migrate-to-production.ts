import { PrismaClient } from '@prisma/client'
import fs from 'fs'

// Local database (SQLite)
const localPrisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./prisma/dev.db'
    }
  }
})

// Production database (PostgreSQL)
const productionPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

async function migrateData() {
  try {
    console.log('🚀 Starting data migration from local to production...')
    
    // Check if production database is empty
    const userCount = await productionPrisma.user.count()
    if (userCount > 0) {
      console.log('⚠️  Production database is not empty. Skipping migration.')
      return
    }

    // 1. Migrate Users
    console.log('📝 Migrating users...')
    const users = await localPrisma.user.findMany()
    for (const user of users) {
      await productionPrisma.user.create({
        data: {
          id: user.id,
          email: user.email,
          password: user.password,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          mustChangePassword: user.mustChangePassword,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      })
    }
    console.log(`✅ Migrated ${users.length} users`)

    // 2. Migrate Courses
    console.log('📚 Migrating courses...')
    const courses = await localPrisma.course.findMany()
    for (const course of courses) {
      await productionPrisma.course.create({
        data: {
          id: course.id,
          title: course.title,
          description: course.description,
          content: course.content,
          thumbnail: course.thumbnail,
          teacherId: course.teacherId,
          isPublished: course.isPublished,
          createdAt: course.createdAt,
          updatedAt: course.updatedAt
        }
      })
    }
    console.log(`✅ Migrated ${courses.length} courses`)

    // 3. Migrate Sections
    console.log('📖 Migrating sections...')
    const sections = await localPrisma.section.findMany()
    for (const section of sections) {
      await productionPrisma.section.create({
        data: {
          id: section.id,
          title: section.title,
          description: section.description,
          order: section.order,
          courseId: section.courseId,
          isLocked: section.isLocked,
          createdAt: section.createdAt,
          updatedAt: section.updatedAt
        }
      })
    }
    console.log(`✅ Migrated ${sections.length} sections`)

    // 4. Migrate Lessons
    console.log('📄 Migrating lessons...')
    const lessons = await localPrisma.lesson.findMany()
    for (const lesson of lessons) {
      await productionPrisma.lesson.create({
        data: {
          id: lesson.id,
          title: lesson.title,
          content: lesson.content,
          order: lesson.order,
          sectionId: lesson.sectionId,
          isLocked: lesson.isLocked,
          createdAt: lesson.createdAt,
          updatedAt: lesson.updatedAt
        }
      })
    }
    console.log(`✅ Migrated ${lessons.length} lessons`)

    // 5. Migrate SubLessons
    console.log('📝 Migrating sub-lessons...')
    const subLessons = await localPrisma.subLesson.findMany()
    for (const subLesson of subLessons) {
      await productionPrisma.subLesson.create({
        data: {
          id: subLesson.id,
          title: subLesson.title,
          content: subLesson.content,
          order: subLesson.order,
          lessonId: subLesson.lessonId,
          createdAt: subLesson.createdAt,
          updatedAt: subLesson.updatedAt
        }
      })
    }
    console.log(`✅ Migrated ${subLessons.length} sub-lessons`)

    // 6. Migrate Quizzes
    console.log('🧩 Migrating quizzes...')
    const quizzes = await localPrisma.quiz.findMany()
    for (const quiz of quizzes) {
      await productionPrisma.quiz.create({
        data: {
          id: quiz.id,
          title: quiz.title,
          description: quiz.description,
          questions: quiz.questions,
          settings: quiz.settings,
          timeLimit: quiz.timeLimit,
          passingScore: quiz.passingScore,
          sectionId: quiz.sectionId,
          isLocked: quiz.isLocked,
          createdAt: quiz.createdAt,
          updatedAt: quiz.updatedAt
        }
      })
    }
    console.log(`✅ Migrated ${quizzes.length} quizzes`)

    // 7. Migrate Enrollments
    console.log('👥 Migrating enrollments...')
    const enrollments = await localPrisma.enrollment.findMany()
    for (const enrollment of enrollments) {
      await productionPrisma.enrollment.create({
        data: {
          id: enrollment.id,
          userId: enrollment.userId,
          courseId: enrollment.courseId,
          enrolledAt: enrollment.enrolledAt,
          createdAt: enrollment.createdAt,
          updatedAt: enrollment.updatedAt
        }
      })
    }
    console.log(`✅ Migrated ${enrollments.length} enrollments`)

    // 8. Migrate Quiz Attempts
    console.log('📊 Migrating quiz attempts...')
    const quizAttempts = await localPrisma.quizAttempt.findMany()
    for (const attempt of quizAttempts) {
      await productionPrisma.quizAttempt.create({
        data: {
          id: attempt.id,
          userId: attempt.userId,
          quizId: attempt.quizId,
          answers: attempt.answers,
          score: attempt.score,
          isCompleted: attempt.isCompleted,
          startedAt: attempt.startedAt,
          completedAt: attempt.completedAt,
          createdAt: attempt.createdAt,
          updatedAt: attempt.updatedAt
        }
      })
    }
    console.log(`✅ Migrated ${quizAttempts.length} quiz attempts`)

    // 9. Migrate Quiz Retake Permissions
    console.log('🔄 Migrating quiz retake permissions...')
    const retakePermissions = await localPrisma.quizRetakePermission.findMany()
    for (const permission of retakePermissions) {
      await productionPrisma.quizRetakePermission.create({
        data: {
          id: permission.id,
          userId: permission.userId,
          quizId: permission.quizId,
          maxRetakes: permission.maxRetakes,
          currentRetakes: permission.currentRetakes,
          isRetake: permission.isRetake,
          grantedBy: permission.grantedBy,
          grantedAt: permission.grantedAt,
          createdAt: permission.createdAt,
          updatedAt: permission.updatedAt
        }
      })
    }
    console.log(`✅ Migrated ${retakePermissions.length} retake permissions`)

    console.log('🎉 Data migration completed successfully!')
    console.log('✅ Your production database now has all the data from your local database.')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
  } finally {
    await localPrisma.$disconnect()
    await productionPrisma.$disconnect()
  }
}

migrateData()
