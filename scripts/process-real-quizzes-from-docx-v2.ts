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
function parseQuizQuestions(html: string): QuizQuestion[] {
  const questions: QuizQuestion[] = []
  
  // Split by week patterns first
  const weekPattern = /Week\s+(\d+)/gi
  const weekMatches = [...html.matchAll(weekPattern)]
  
  if (weekMatches.length === 0) {
    console.log('No week patterns found')
    return []
  }
  
  // Process each week
  for (let i = 0; i < weekMatches.length; i++) {
    const weekMatch = weekMatches[i]
    const weekNumber = parseInt(weekMatch[1])
    
    // Extract content for this week
    const startIndex = weekMatch.index!
    const endIndex = i < weekMatches.length - 1 ? weekMatches[i + 1].index! : html.length
    const weekContent = html.substring(startIndex, endIndex)
    
    console.log(`Processing Week ${weekNumber}...`)
    
    // Find all ordered lists in this week's content
    const olMatches = [...weekContent.matchAll(/<ol>(.*?)<\/ol>/gs)]
    
    for (const olMatch of olMatches) {
      const olContent = olMatch[1]
      
      // Find all list items that contain questions
      const liMatches = [...olContent.matchAll(/<li>(.*?)<\/li>/gs)]
      
      for (const liMatch of liMatches) {
        const liContent = liMatch[1]
        
        // Check if this list item contains a question (not just options)
        if (liContent.includes('<ol>')) {
          // This is a question with nested options
          const questionText = liContent.split('<ol>')[0].replace(/<[^>]*>/g, '').trim()
          
          if (questionText && questionText.length > 10) {
            // Extract options from the nested ol
            const nestedOlMatch = liContent.match(/<ol>(.*?)<\/ol>/s)
            if (nestedOlMatch) {
              const nestedOlContent = nestedOlMatch[1]
              const optionMatches = [...nestedOlContent.matchAll(/<li>(.*?)<\/li>/gs)]
              
              const options: string[] = []
              let correctAnswer = 0
              
              for (let j = 0; j < optionMatches.length; j++) {
                const optionText = optionMatches[j][1].replace(/<[^>]*>/g, '').trim()
                if (optionText) {
                  options.push(optionText)
                  
                  // Check if this option has a checkmark (✅)
                  if (optionText.includes('✅')) {
                    correctAnswer = j
                    // Remove the checkmark from the option text
                    options[j] = optionText.replace('✅', '').trim()
                  }
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
        }
      }
    }
  }
  
  return questions
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
    
    // Save HTML for debugging
    fs.writeFileSync('debug-quiz-html-v2.html', html)
    console.log('💾 Saved HTML to debug-quiz-html-v2.html for inspection')
    
    // Parse all questions from the HTML
    const allQuestions = parseQuizQuestions(html)
    console.log(`✅ Found ${allQuestions.length} total questions`)
    
    // Group questions by week
    const weekQuizzes: WeekQuiz[] = []
    
    // Split by week patterns
    const weekPattern = /Week\s+(\d+)/gi
    const weekMatches = [...html.matchAll(weekPattern)]
    
    for (let i = 0; i < weekMatches.length; i++) {
      const weekMatch = weekMatches[i]
      const weekNumber = parseInt(weekMatch[1])
      
      // Extract content for this week
      const startIndex = weekMatch.index!
      const endIndex = i < weekMatches.length - 1 ? weekMatches[i + 1].index! : html.length
      const weekContent = html.substring(startIndex, endIndex)
      
      // Parse questions for this week
      const weekQuestions = parseQuizQuestions(weekContent)
      
      if (weekQuestions.length > 0) {
        weekQuizzes.push({ week: weekNumber, questions: weekQuestions })
        console.log(`✅ Week ${weekNumber}: Found ${weekQuestions.length} questions`)
      }
    }
    
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
