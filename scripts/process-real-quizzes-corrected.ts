import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'
import * as mammoth from 'mammoth'

const prisma = new PrismaClient()

interface QuizQuestion {
  question: string
  options: string[]
  correctAnswer: number
}

interface WeekQuiz {
  week: number
  questions: QuizQuestion[]
}

// Function to parse quiz questions from HTML content
function parseQuizQuestions(html: string): WeekQuiz[] {
  const weekQuizzes: WeekQuiz[] = []
  
  // Split by week patterns
  const weekPattern = /Week\s+(\d+)/gi
  const weekMatches = [...html.matchAll(weekPattern)]
  
  console.log(`Found ${weekMatches.length} week patterns`)
  
  for (let i = 0; i < weekMatches.length; i++) {
    const weekMatch = weekMatches[i]
    const weekNumber = parseInt(weekMatch[1])
    
    // Skip duplicate weeks (there are 3 "Week 10" entries)
    if (weekNumber > 10) continue
    
    // Extract content for this week
    const startIndex = weekMatch.index!
    const endIndex = i < weekMatches.length - 1 ? weekMatches[i + 1].index! : html.length
    const weekContent = html.substring(startIndex, endIndex)
    
    console.log(`Processing Week ${weekNumber}...`)
    
    const questions: QuizQuestion[] = []
    
    // Find all ordered lists in this week's content
    const olMatches = [...weekContent.matchAll(/<ol>(.*?)<\/ol>/gs)]
    
    // Process pairs of ordered lists (question + options)
    for (let j = 0; j < olMatches.length; j += 2) {
      if (j + 1 >= olMatches.length) break
      
      const questionOl = olMatches[j][1]
      const optionsOl = olMatches[j + 1][1]
      
      // Extract question from first ol
      const questionLiMatches = [...questionOl.matchAll(/<li>(.*?)<\/li>/gs)]
      if (questionLiMatches.length === 0) continue
      
      const questionText = questionLiMatches[0][1].replace(/<[^>]*>/g, '').trim()
      
      if (questionText && questionText.length > 10) {
        // Extract options from second ol
        const optionLiMatches = [...optionsOl.matchAll(/<li>(.*?)<\/li>/gs)]
        
        const options: string[] = []
        let correctAnswer = 0
        
        for (let k = 0; k < optionLiMatches.length; k++) {
          let optionText = optionLiMatches[k][1].replace(/<[^>]*>/g, '').trim()
          
          // Check if this option has a checkmark (✅)
          if (optionText.includes('✅')) {
            correctAnswer = k
            // Remove the checkmark from the option text
            optionText = optionText.replace('✅', '').trim()
          }
          
          if (optionText) {
            options.push(optionText)
          }
        }
        
        if (options.length >= 2) {
          questions.push({
            question: questionText,
            options: options,
            correctAnswer: correctAnswer
          })
          console.log(`  Found question: ${questionText.substring(0, 50)}... (${options.length} options, correct: ${correctAnswer})`)
        }
      }
    }
    
    if (questions.length > 0) {
      weekQuizzes.push({ week: weekNumber, questions })
      console.log(`✅ Week ${weekNumber}: Found ${questions.length} questions`)
    }
  }
  
  return weekQuizzes
}

// Function to read DOCX content and extract quiz questions
async function processQuizDocx(filePath: string): Promise<WeekQuiz[]> {
  console.log('📖 Processing QUIZes.docx file...')
  
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`❌ File not found: ${filePath}`)
      return []
    }
    
    const result = await mammoth.convertToHtml({ path: filePath })
    const html = result.value
    const messages = result.messages
    
    console.log(`✅ DOCX converted to HTML (${html.length} characters)`)
    if (messages.length > 0) {
      console.log('📝 Conversion messages:', messages)
    }
    
    // Parse all questions from the HTML
    const weekQuizzes = parseQuizQuestions(html)
    
    console.log(`✅ Processed ${weekQuizzes.length} weeks of quiz content`)
    return weekQuizzes
    
  } catch (error) {
    console.error('❌ Error processing quiz DOCX:', error)
    return []
  }
}

// Function to update all quizzes with real content
async function updateAllQuizzes() {
  try {
    console.log('🔄 Updating all Unit Zero quizzes with real content from QUIZes.docx...')
    
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
      console.log('❌ Unit Zero course not found. Please create it first.')
      return
    }
    
    console.log(`✅ Found course: ${course.title} with ${course.sections.length} sections`)
    
    // Process quiz content from DOCX
    const weekQuizzes = await processQuizDocx('course-content/QUIZes.docx')
    
    if (weekQuizzes.length === 0) {
      console.log('❌ No quiz content found in DOCX file')
      return
    }
    
    // Update each week's quiz
    for (let week = 1; week <= 10; week++) {
      const section = course.sections.find(s => s.order === week)
      if (!section) continue
      
      const quiz = section.quizzes[0]
      if (!quiz) continue
      
      const weekQuiz = weekQuizzes.find(wq => wq.week === week)
      if (!weekQuiz) {
        console.log(`⚠️ No quiz content found for Week ${week}`)
        continue
      }
      
      console.log(`📝 Updating Week ${week} quiz with ${weekQuiz.questions.length} questions...`)
      
      // Update quiz with real content
      await prisma.quiz.update({
        where: { id: quiz.id },
        data: {
          title: `Quiz ${week.toString().padStart(2, '0')}`,
          description: `Week ${week} quiz with ${weekQuiz.questions.length} questions from QUIZes.docx`,
          questions: JSON.stringify(weekQuiz.questions),
          passingScore: 70, // 70% passing score
          timeLimit: 10, // 10 minutes time limit
          maxRetakes: 3,
          isPublished: true,
          isLocked: false
        }
      })
      
      console.log(`  ✅ Updated Quiz ${week.toString().padStart(2, '0')} with ${weekQuiz.questions.length} questions`)
    }
    
    console.log('🎉 All quizzes updated successfully!')
    console.log(`📊 Quiz Summary:`)
    console.log(`  - ${weekQuizzes.length} weeks of quizzes processed`)
    console.log(`  - Real questions from QUIZes.docx`)
    console.log(`  - 10 minutes time limit per quiz`)
    console.log(`  - 70% passing score required`)
    console.log(`  - 3 retake attempts allowed`)
    
  } catch (error) {
    console.error('❌ Error updating quizzes:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
updateAllQuizzes()
