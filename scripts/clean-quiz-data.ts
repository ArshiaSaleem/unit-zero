import { prisma } from '../src/lib/prisma'

async function cleanQuizData() {
  console.log('🧹 Cleaning up bad quiz data...')

  // Get all quizzes
  const quizzes = await prisma.quiz.findMany({
    select: {
      id: true,
      title: true,
      questions: true
    }
  })

  console.log(`Found ${quizzes.length} quizzes to check`)

  for (const quiz of quizzes) {
    try {
      const questions = JSON.parse(quiz.questions)
      
      if (!Array.isArray(questions)) {
        console.log(`❌ ${quiz.title}: Invalid questions format`)
        continue
      }

      // Check for duplicates
      const questionTexts = questions.map(q => q.question)
      const uniqueQuestions = [...new Set(questionTexts)]
      
      if (questions.length !== uniqueQuestions.length) {
        console.log(`\n🔍 ${quiz.title}: Found ${questions.length} questions, ${uniqueQuestions.length} unique`)
        
        // Remove duplicates by keeping only the first occurrence
        const cleanedQuestions = questions.filter((question, index, self) => 
          index === self.findIndex(q => q.question === question.question)
        )
        
        console.log(`  - Removed ${questions.length - cleanedQuestions.length} duplicate questions`)
        
        // Update the quiz in database
        await prisma.quiz.update({
          where: { id: quiz.id },
          data: {
            questions: JSON.stringify(cleanedQuestions)
          }
        })
        
        console.log(`  ✅ Cleaned ${quiz.title}`)
      } else {
        console.log(`✅ ${quiz.title}: No duplicates found`)
      }
      
    } catch (error) {
      console.log(`❌ ${quiz.title}: Error processing - ${error}`)
    }
  }

  console.log('\n🎉 Quiz data cleanup completed!')
}

cleanQuizData()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
