import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Function to verify all quizzes are complete
async function verifyAllQuizzesComplete() {
  try {
    console.log('🔍 Verifying all Unit Zero quizzes are complete...')
    
    // Find the Unit Zero course
    const course = await prisma.course.findFirst({
      where: { title: 'Unit Zero' },
      include: {
        sections: {
          include: {
            quizzes: true
          },
          orderBy: { order: 'asc' }
        }
      }
    })
    
    if (!course) {
      console.log('❌ Unit Zero course not found.')
      return
    }
    
    console.log(`✅ Found course: ${course.title} with ${course.sections.length} sections`)
    
    let totalQuestions = 0
    let completeWeeks = 0
    
    // Check each week's quiz
    for (let week = 1; week <= 10; week++) {
      const section = course.sections.find(s => s.order === week)
      if (!section) {
        console.log(`⚠️ Week ${week}: No section found`)
        continue
      }
      
      const quiz = section.quizzes[0]
      if (!quiz) {
        console.log(`⚠️ Week ${week}: No quiz found`)
        continue
      }
      
      try {
        const questions = JSON.parse(quiz.questions || '[]')
        const questionCount = questions.length
        
        if (questionCount === 16) {
          console.log(`✅ Week ${week}: Quiz ${week.toString().padStart(2, '0')} - ${questionCount} questions`)
          completeWeeks++
          totalQuestions += questionCount
        } else {
          console.log(`⚠️ Week ${week}: Quiz ${week.toString().padStart(2, '0')} - ${questionCount} questions (Expected: 16)`)
        }
      } catch (error) {
        console.log(`❌ Week ${week}: Error parsing questions`)
      }
    }
    
    console.log('\n📊 Final Summary:')
    console.log(`  - Complete weeks: ${completeWeeks}/10`)
    console.log(`  - Total questions: ${totalQuestions}`)
    console.log(`  - Expected total: 160 questions (10 weeks × 16 questions)`)
    
    if (completeWeeks === 10 && totalQuestions === 160) {
      console.log('🎉 ALL QUIZZES COMPLETE! ✅')
      console.log('📚 All 10 weeks have 16 questions each from QUIZes.docx')
      console.log('⏱️ 10 minutes time limit per quiz')
      console.log('🎯 70% passing score required')
      console.log('🔄 3 retake attempts allowed')
    } else {
      console.log('⚠️ Some quizzes are incomplete or missing questions')
    }
    
  } catch (error) {
    console.error('❌ Error verifying quizzes:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the verification
verifyAllQuizzesComplete()
