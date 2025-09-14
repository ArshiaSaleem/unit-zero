import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { convert } from 'mammoth';

const prisma = new PrismaClient();

async function updateLesson8Content() {
  try {
    console.log('🔄 Processing Lesson 8 content...');

    // Find the Unit Zero course
    const course = await prisma.course.findFirst({
      where: { title: 'Unit Zero' },
      include: {
        sections: {
          include: {
            lessons: true
          }
        }
      }
    });

    if (!course) {
      console.error('❌ Unit Zero course not found');
      return;
    }

    console.log(`✅ Found course: ${course.title} with ${course.sections.length} sections`);

    // Find Lesson 8 (Week 8)
    const week8Section = course.sections.find(section => section.title.includes('Week 8'));
    if (!week8Section) {
      console.error('❌ Week 8 section not found');
      return;
    }

    const lesson8 = week8Section.lessons.find(lesson => lesson.title.includes('Lesson 8'));
    if (!lesson8) {
      console.error('❌ Lesson 8 not found');
      return;
    }

    console.log(`✅ Found Lesson 8: ${lesson8.title}`);

    // Process the DOCX file
    const docxPath = path.join(process.cwd(), 'course-content', 'Lesson 8.docx');
    
    if (!fs.existsSync(docxPath)) {
      console.error('❌ Lesson 8.docx file not found');
      return;
    }

    console.log('📄 Converting DOCX to HTML...');
    const result = await convert({ path: docxPath });
    const htmlContent = result.value;

    if (!htmlContent || htmlContent.trim().length < 100) {
      console.error('❌ No meaningful content extracted from DOCX file');
      return;
    }

    console.log(`📝 Extracted content: ${htmlContent.length} characters`);

    // Update the lesson content
    const updatedLesson = await prisma.lesson.update({
      where: { id: lesson8.id },
      data: {
        content: htmlContent,
        title: `Week 8 - Lesson 8`
      }
    });

    console.log(`✅ Successfully updated Lesson 8 content`);
    console.log(`📊 Content length: ${updatedLesson.content.length} characters`);

  } catch (error) {
    console.error('❌ Error processing Lesson 8:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateLesson8Content();
