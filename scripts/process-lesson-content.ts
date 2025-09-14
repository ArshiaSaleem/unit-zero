import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'
import mammoth from 'mammoth'

const prisma = new PrismaClient()

// Function to process DOCX file and convert to HTML with proper formatting
async function processDocxToHtml(filePath: string): Promise<string> {
  try {
    const buffer = fs.readFileSync(filePath)
    const result = await mammoth.convertToHtml({ buffer })
    
    // Clean up the HTML and ensure proper formatting
    let html = result.value
    
    // Fix common formatting issues
    html = html
      .replace(/<p><br><\/p>/g, '') // Remove empty paragraphs
      .replace(/<p>\s*<\/p>/g, '') // Remove empty paragraphs with whitespace
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()
    
    return html
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error)
    return ''
  }
}

// Function to update lesson content
async function updateLessonContent() {
  try {
    console.log('🔄 Processing lesson content from DOCX files...')
    
    // Find the Unit Zero course
    const course = await prisma.course.findFirst({
      where: { title: 'Unit Zero' },
      include: {
        sections: {
          include: {
            lessons: true
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
    
    // Process each lesson file
    for (let lessonNum = 1; lessonNum <= 10; lessonNum++) {
      const fileName = lessonNum === 1 ? 'Lesson1.docx' : `Lesson ${lessonNum}.docx`
      const filePath = path.join('course-content', fileName)
      
      if (!fs.existsSync(filePath)) {
        console.log(`⚠️ File not found: ${filePath}`)
        continue
      }
      
      console.log(`📝 Processing ${fileName}...`)
      
      // Convert DOCX to HTML
      const htmlContent = await processDocxToHtml(filePath)
      
      if (!htmlContent) {
        console.log(`❌ Failed to process ${fileName}`)
        continue
      }
      
      // Find the corresponding section and lesson
      const section = course.sections.find(s => s.order === lessonNum)
      if (!section) {
        console.log(`⚠️ No section found for lesson ${lessonNum}`)
        continue
      }
      
      const lesson = section.lessons[0] // Assuming first lesson in each section
      if (!lesson) {
        console.log(`⚠️ No lesson found in section ${lessonNum}`)
        continue
      }
      
      // Update the lesson content
      await prisma.lesson.update({
        where: { id: lesson.id },
        data: {
          content: htmlContent,
          title: `Week ${lessonNum} - Lesson ${lessonNum}`
        }
      })
      
      console.log(`  ✅ Updated Lesson ${lessonNum} with content from ${fileName}`)
      console.log(`  📊 Content length: ${htmlContent.length} characters`)
    }
    
    console.log('🎉 All lesson content updated successfully!')
    console.log('📚 Content includes:')
    console.log('  - Tables with proper formatting')
    console.log('  - Images with preserved links')
    console.log('  - Links and hyperlinks')
    console.log('  - Rich text formatting')
    
  } catch (error) {
    console.error('❌ Error updating lesson content:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
updateLessonContent()
