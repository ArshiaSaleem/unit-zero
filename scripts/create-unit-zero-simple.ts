import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

// Function to create the Unit Zero course with placeholder content
async function createUnitZeroCourse() {
  try {
    console.log('🚀 Creating Unit Zero course...')
    
    // Check if course already exists
    const existingCourse = await prisma.course.findFirst({
      where: { title: 'Unit Zero' }
    })
    
    if (existingCourse) {
      console.log('⚠️ Unit Zero course already exists. Deleting...')
      await prisma.course.delete({
        where: { id: existingCourse.id }
      })
    }
    
    // Create the course
    const course = await prisma.course.create({
      data: {
        title: 'Unit Zero',
        description: 'A comprehensive 10-week course covering essential topics with lessons, home assignments, and quizzes.',
        teacherId: 'cmfiv8swd00037maix6f8c9qm', // Zeeshan Safdar
        isPublished: true
      }
    })
    
    console.log(`✅ Created course: ${course.title} (ID: ${course.id})`)
    
    // Create sections for each week
    for (let week = 1; week <= 10; week++) {
      console.log(`📅 Creating Week ${week} section...`)
      
      const section = await prisma.section.create({
        data: {
          title: `Week ${week}`,
          description: `Week ${week} content including lesson, home assignment, and quiz`,
          order: week,
          courseId: course.id,
          isPublished: true,
          isLocked: false
        }
      })
      
      // Add lesson for this week
      const lesson = await prisma.lesson.create({
        data: {
          title: `Week ${week} - Lesson`,
          content: `<h2>Week ${week} Lesson Content</h2>
<p>This is the main lesson content for Week ${week}. The actual content from the DOCX file will be processed and added here.</p>
<p>Key topics covered this week:</p>
<ul>
  <li>Topic 1</li>
  <li>Topic 2</li>
  <li>Topic 3</li>
</ul>
<p>For more detailed information, please refer to the course materials.</p>`,
          order: 1,
          sectionId: section.id,
          isPublished: true,
          isLocked: false
        }
      })
      console.log(`  ✅ Added lesson: Week ${week} - Lesson`)
      
      // Add home assignment for this week
      const homework = await prisma.lesson.create({
        data: {
          title: `Week ${week} - Home Assignment`,
          content: `<h2>Week ${week} Home Assignment</h2>
<p>This is the home assignment for Week ${week}. Students should complete the following tasks:</p>
<ol>
  <li>Reading Task: Complete the assigned readings</li>
  <li>Practice Exercise: Work through the practice problems</li>
  <li>Reflection: Write a brief reflection on the week's topics</li>
</ol>
<p><strong>Due Date:</strong> End of Week ${week}</p>
<p><strong>Submission:</strong> Submit your work through the course platform</p>`,
          order: 2,
          sectionId: section.id,
          isPublished: true,
          isLocked: false
        }
      })
      console.log(`  ✅ Added home assignment: Week ${week} - Home Assignment`)
      
      // Add quiz for this week
      const questions = [
        {
          question: `What is the main topic covered in Week ${week}?`,
          options: [
            'A. Topic A',
            'B. Topic B', 
            'C. Topic C',
            'D. Topic D'
          ],
          correctAnswer: 0
        },
        {
          question: `Which of the following is NOT part of Week ${week} content?`,
          options: [
            'A. Reading materials',
            'B. Practice exercises',
            'C. Final exam',
            'D. Discussion questions'
          ],
          correctAnswer: 2
        },
        {
          question: `How many hours should you spend on Week ${week} assignments?`,
          options: [
            'A. 1-2 hours',
            'B. 3-4 hours',
            'C. 5-6 hours',
            'D. 7+ hours'
          ],
          correctAnswer: 1
        }
      ]
      
      const quiz = await prisma.quiz.create({
        data: {
          title: `Week ${week} - Quiz`,
          description: `Week ${week} quiz with ${questions.length} questions covering the week's topics`,
          questions: JSON.stringify(questions),
          passingScore: 60,
          maxRetakes: 3,
          sectionId: section.id,
          isPublished: true,
          isLocked: false
        }
      })
      
      console.log(`  ✅ Added quiz: Week ${week} - Quiz with ${questions.length} questions`)
    }
    
    console.log('🎉 Unit Zero course created successfully!')
    console.log(`📊 Course includes:`)
    console.log(`  - 10 weeks of content`)
    console.log(`  - 20 lessons (10 lessons + 10 home assignments)`)
    console.log(`  - 10 quizzes with sample questions`)
    console.log(`  - Ready for content import from DOCX files`)
    
  } catch (error) {
    console.error('❌ Error creating Unit Zero course:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
createUnitZeroCourse()
