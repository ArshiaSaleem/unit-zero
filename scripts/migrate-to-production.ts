import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

// This script migrates all data from local SQLite to production database
async function migrateToProduction() {
  console.log('🚀 Starting data migration to production...');

  // Check if production DATABASE_URL is set
  if (!process.env.DATABASE_URL || !process.env.DATABASE_URL.includes('postgres')) {
    console.error('❌ Production DATABASE_URL not set or not a PostgreSQL database');
    console.log('Please set DATABASE_URL to your production database connection string');
    process.exit(1);
  }

  const productionPrisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  });

  const localPrisma = new PrismaClient({
    datasources: {
      db: {
        url: 'file:./dev.db'
      }
    }
  });

  try {
    console.log('📊 Fetching data from local database...');

    // Fetch all data from local database
    const [
      users,
      courses,
      sections,
      lessons,
      quizzes,
      quizQuestions,
      quizAttempts,
      enrollments,
      retakePermissions
    ] = await Promise.all([
      localPrisma.user.findMany(),
      localPrisma.course.findMany(),
      localPrisma.section.findMany(),
      localPrisma.lesson.findMany(),
      localPrisma.quiz.findMany(),
      localPrisma.quizQuestion.findMany(),
      localPrisma.quizAttempt.findMany(),
      localPrisma.enrollment.findMany(),
      localPrisma.quizRetakePermission.findMany()
    ]);

    console.log(`📦 Found data:`);
    console.log(`  - Users: ${users.length}`);
    console.log(`  - Courses: ${courses.length}`);
    console.log(`  - Sections: ${sections.length}`);
    console.log(`  - Lessons: ${lessons.length}`);
    console.log(`  - Quizzes: ${quizzes.length}`);
    console.log(`  - Quiz Questions: ${quizQuestions.length}`);
    console.log(`  - Quiz Attempts: ${quizAttempts.length}`);
    console.log(`  - Enrollments: ${enrollments.length}`);
    console.log(`  - Retake Permissions: ${retakePermissions.length}`);

    console.log('🗑️ Clearing production database...');
    
    // Clear production database in correct order (respecting foreign keys)
    await productionPrisma.quizRetakePermission.deleteMany();
    await productionPrisma.quizAttempt.deleteMany();
    await productionPrisma.quizQuestion.deleteMany();
    await productionPrisma.quiz.deleteMany();
    await productionPrisma.lesson.deleteMany();
    await productionPrisma.section.deleteMany();
    await productionPrisma.enrollment.deleteMany();
    await productionPrisma.course.deleteMany();
    await productionPrisma.user.deleteMany();

    console.log('📤 Migrating data to production database...');

    // Migrate users first
    console.log('👥 Migrating users...');
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
      });
    }

    // Migrate courses
    console.log('📚 Migrating courses...');
    for (const course of courses) {
      await productionPrisma.course.create({
        data: {
          id: course.id,
          title: course.title,
          description: course.description,
          teacherId: course.teacherId,
          isLocked: course.isLocked,
          createdAt: course.createdAt,
          updatedAt: course.updatedAt
        }
      });
    }

    // Migrate sections
    console.log('📖 Migrating sections...');
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
      });
    }

    // Migrate lessons
    console.log('📝 Migrating lessons...');
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
      });
    }

    // Migrate quizzes
    console.log('❓ Migrating quizzes...');
    for (const quiz of quizzes) {
      await productionPrisma.quiz.create({
        data: {
          id: quiz.id,
          title: quiz.title,
          description: quiz.description,
          timeLimit: quiz.timeLimit,
          passingScore: quiz.passingScore,
          maxRetakes: quiz.maxRetakes,
          order: quiz.order,
          sectionId: quiz.sectionId,
          isLocked: quiz.isLocked,
          createdAt: quiz.createdAt,
          updatedAt: quiz.updatedAt
        }
      });
    }

    // Migrate quiz questions
    console.log('❓ Migrating quiz questions...');
    for (const question of quizQuestions) {
      await productionPrisma.quizQuestion.create({
        data: {
          id: question.id,
          question: question.question,
          options: question.options,
          correctAnswer: question.correctAnswer,
          order: question.order,
          quizId: question.quizId,
          createdAt: question.createdAt,
          updatedAt: question.updatedAt
        }
      });
    }

    // Migrate enrollments
    console.log('🎓 Migrating enrollments...');
    for (const enrollment of enrollments) {
      await productionPrisma.enrollment.create({
        data: {
          id: enrollment.id,
          userId: enrollment.userId,
          courseId: enrollment.courseId,
          enrolledAt: enrollment.enrolledAt
        }
      });
    }

    // Migrate quiz attempts
    console.log('📊 Migrating quiz attempts...');
    for (const attempt of quizAttempts) {
      await productionPrisma.quizAttempt.create({
        data: {
          id: attempt.id,
          userId: attempt.userId,
          quizId: attempt.quizId,
          score: attempt.score,
          totalQuestions: attempt.totalQuestions,
          correctAnswers: attempt.correctAnswers,
          answers: attempt.answers,
          isRetake: attempt.isRetake,
          completedAt: attempt.completedAt,
          createdAt: attempt.createdAt,
          updatedAt: attempt.updatedAt
        }
      });
    }

    // Migrate retake permissions
    console.log('🔄 Migrating retake permissions...');
    for (const permission of retakePermissions) {
      await productionPrisma.quizRetakePermission.create({
        data: {
          id: permission.id,
          userId: permission.userId,
          quizId: permission.quizId,
          canRetake: permission.canRetake,
          retakeCount: permission.retakeCount,
          createdAt: permission.createdAt,
          updatedAt: permission.updatedAt
        }
      });
    }

    console.log('✅ Data migration completed successfully!');
    
    // Verify migration
    const productionCounts = {
      users: await productionPrisma.user.count(),
      courses: await productionPrisma.course.count(),
      sections: await productionPrisma.section.count(),
      lessons: await productionPrisma.lesson.count(),
      quizzes: await productionPrisma.quiz.count(),
      quizQuestions: await productionPrisma.quizQuestion.count(),
      quizAttempts: await productionPrisma.quizAttempt.count(),
      enrollments: await productionPrisma.enrollment.count(),
      retakePermissions: await productionPrisma.quizRetakePermission.count()
    };

    console.log('📊 Production database counts:');
    Object.entries(productionCounts).forEach(([key, count]) => {
      console.log(`  - ${key}: ${count}`);
    });

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await productionPrisma.$disconnect();
    await localPrisma.$disconnect();
  }
}

migrateToProduction();
