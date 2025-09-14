import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface QuizQuestion {
  question: string
  options: string[]
  correctAnswer: number
}

// Week 3 - Research and Sources
const week3Questions: QuizQuestion[] = [
  {
    question: "Why is it important to use multiple sources when researching?",
    options: [
      "To make your assignment longer",
      "To ensure accuracy and avoid bias",
      "To confuse the reader",
      "To avoid referencing"
    ],
    correctAnswer: 1
  },
  {
    question: "What makes a source academically reliable?",
    options: [
      "It's easy to read",
      "It's written by a verified expert",
      "It has lots of likes",
      "It's shared on social media"
    ],
    correctAnswer: 1
  },
  {
    question: "Why are English-language sources useful in BTEC assignments?",
    options: [
      "They are easier to copy",
      "They offer broader, international perspectives",
      "They are more colorful",
      "They are shorter"
    ],
    correctAnswer: 1
  },
  {
    question: "What is paraphrasing?",
    options: [
      "Copying a sentence word-for-word",
      "Rewriting a source in your own words",
      "Translating into Dutch",
      "Highlighting key phrases"
    ],
    correctAnswer: 1
  },
  {
    question: "What's the risk of using only one source?",
    options: [
      "Your assignment will be too long",
      "You may miss important perspectives",
      "You'll get a Distinction",
      "You'll avoid plagiarism"
    ],
    correctAnswer: 1
  },
  {
    question: "What's the best way to check if a source is trustworthy?",
    options: [
      "See how many emojis it has",
      "Check the author and publication date",
      "Ask your friend",
      "Look for bold fonts"
    ],
    correctAnswer: 1
  },
  {
    question: "What's a research question?",
    options: [
      "A question you ask your teacher",
      "A topic you want to explore",
      "A quiz question",
      "A question from the assignment brief"
    ],
    correctAnswer: 1
  },
  {
    question: "What's the purpose of summarizing a source?",
    options: [
      "To copy less",
      "To shorten your assignment",
      "To capture key ideas in fewer words",
      "To avoid referencing"
    ],
    correctAnswer: 2
  },
  {
    question: "What is a citation?",
    options: [
      "A reference to a source",
      "A type of conclusion",
      "A list of websites",
      "A personal opinion"
    ],
    correctAnswer: 0
  },
  {
    question: "Why is referencing important in research?",
    options: [
      "It makes your work longer",
      "It shows you've copied correctly",
      "It gives credit and avoids plagiarism",
      "It replaces analysis"
    ],
    correctAnswer: 2
  },
  {
    question: "What is the most reliable type of source for a BTEC assignment?",
    options: [
      "A random blog post",
      "A peer-reviewed article or official company report",
      "A friend's opinion",
      "A social media comment"
    ],
    correctAnswer: 1
  },
  {
    question: "Why is paraphrasing important when using English-language sources?",
    options: [
      "It allows you to copy without being caught",
      "It helps you avoid using references",
      "It shows understanding and avoids plagiarism",
      "It makes your writing longer"
    ],
    correctAnswer: 2
  },
  {
    question: "Which of the following best demonstrates effective use of a source?",
    options: [
      "Copying a paragraph word-for-word",
      "Quoting without explanation",
      "Paraphrasing and linking it to your argument",
      "Listing the source at the end without using it"
    ],
    correctAnswer: 2
  },
  {
    question: "What is a key benefit of using English-language sources in BTEC assignments?",
    options: [
      "They are easier to copy",
      "They provide global perspectives and professional vocabulary",
      "They are shorter than Dutch sources",
      "They don't require referencing"
    ],
    correctAnswer: 1
  },
  {
    question: "What should you check when evaluating a source's reliability?",
    options: [
      "The number of emojis used",
      "The author's credentials and publication date",
      "Whether your friend agrees with it",
      "If it's written in casual language"
    ],
    correctAnswer: 1
  },
  {
    question: "Which of the following is a poor research practice?",
    options: [
      "Using multiple sources to support your point",
      "Citing your sources in Harvard format",
      "Relying only on Wikipedia without checking other sources",
      "Paraphrasing and linking to the brief"
    ],
    correctAnswer: 2
  }
]

// Week 4 - Plagiarism and Referencing
const week4Questions: QuizQuestion[] = [
  {
    question: "What is plagiarism?",
    options: [
      "Writing in your own words",
      "Using someone else's work without credit",
      "Quoting a source with citation",
      "Summarizing a source correctly"
    ],
    correctAnswer: 1
  },
  {
    question: "Why is referencing important in BTEC assignments?",
    options: [
      "It makes your work longer",
      "It shows you've copied correctly",
      "It gives credit and avoids plagiarism",
      "It replaces the need for analysis"
    ],
    correctAnswer: 2
  },
  {
    question: "What is Harvard referencing?",
    options: [
      "A way to write conclusions",
      "A style of citation used in academic writing",
      "A method for organizing group work",
      "A type of exam format"
    ],
    correctAnswer: 1
  },
  {
    question: "Which of the following is a correct in-text citation in Harvard style?",
    options: [
      "(www.website.com)",
      "(Author, Year)",
      "(Title, Page)",
      "(Date, Source)"
    ],
    correctAnswer: 1
  },
  {
    question: "What is paraphrasing?",
    options: [
      "Copying a sentence word-for-word",
      "Rewriting someone's idea in your own words",
      "Translating into Dutch",
      "Highlighting key phrases"
    ],
    correctAnswer: 1
  },
  {
    question: "What should a reference list include?",
    options: [
      "Only websites you visited",
      "All sources used in your assignment",
      "Your personal notes",
      "Your classmates' opinions"
    ],
    correctAnswer: 1
  },
  {
    question: "What is the difference between quoting and paraphrasing?",
    options: [
      "Quoting uses exact words; paraphrasing rewrites ideas",
      "Paraphrasing is copying",
      "Quoting is used in conclusions",
      "They mean the same thing"
    ],
    correctAnswer: 0
  },
  {
    question: "What happens if you don't reference your sources?",
    options: [
      "You get extra feedback",
      "Your work may be flagged for plagiarism",
      "You receive bonus marks",
      "You skip the next assignment"
    ],
    correctAnswer: 1
  },
  {
    question: "Which of the following is considered plagiarism?",
    options: [
      "Quoting a source with citation",
      "Paraphrasing with a reference",
      "Copying a paragraph without credit",
      "Summarizing in your own words"
    ],
    correctAnswer: 2
  },
  {
    question: "Why is paraphrasing better than quoting large blocks of text?",
    options: [
      "It avoids using sources",
      "It shows understanding and originality",
      "It makes your work shorter",
      "It hides plagiarism"
    ],
    correctAnswer: 1
  },
  {
    question: "What is the main purpose of Harvard referencing in BTEC assignments?",
    options: [
      "To make your work look longer",
      "To avoid plagiarism and give credit to sources",
      "To impress the teacher",
      "To list random websites"
    ],
    correctAnswer: 1
  },
  {
    question: "Which of the following is a correct in-text citation using Harvard style?",
    options: [
      "(Tony's Chocolonely, 2023)",
      "[Tony's Chocolonely: 2023]",
      "<Tony's Chocolonely, 2023>",
      "{Tony's Chocolonely, 2023}"
    ],
    correctAnswer: 0
  },
  {
    question: "What should a full reference entry include in Harvard format?",
    options: [
      "Only the website name",
      "Author, year, title, and source",
      "Just the title and date",
      "A screenshot of the source"
    ],
    correctAnswer: 1
  },
  {
    question: "Why is it important to include a reference list at the end of your assignment?",
    options: [
      "To show how many websites you visited",
      "To prove you used Google",
      "To allow others to find your sources and verify your research",
      "To make your assignment longer"
    ],
    correctAnswer: 2
  },
  {
    question: "What is a common mistake when using Harvard referencing?",
    options: [
      "Including the author and year",
      "Forgetting to match in-text citations with the reference list",
      "Using academic sources",
      "Writing the title in italics"
    ],
    correctAnswer: 1
  },
  {
    question: "Which of the following sources is most appropriate for a Harvard-style reference in a BTEC assignment?",
    options: [
      "A meme from Instagram",
      "A peer-reviewed journal article",
      "A WhatsApp message",
      "A random YouTube comment"
    ],
    correctAnswer: 1
  }
]

// Function to update quizzes with real content
async function updateQuizzesWithRealContent() {
  try {
    console.log('🔄 Updating Unit Zero quizzes with real content from QUIZes.docx...')
    
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
    
    // Update Week 3
    const week3Section = course.sections.find(s => s.order === 3)
    if (week3Section && week3Section.quizzes[0]) {
      console.log(`📝 Updating Week 3 quiz with ${week3Questions.length} questions...`)
      await prisma.quiz.update({
        where: { id: week3Section.quizzes[0].id },
        data: {
          title: `Quiz 03`,
          description: `Week 3 quiz with ${week3Questions.length} questions from QUIZes.docx`,
          questions: JSON.stringify(week3Questions),
          passingScore: 70,
          timeLimit: 10,
          maxRetakes: 3,
          isPublished: true,
          isLocked: false
        }
      })
      console.log(`  ✅ Updated Quiz 03 with ${week3Questions.length} questions`)
    }
    
    // Update Week 4
    const week4Section = course.sections.find(s => s.order === 4)
    if (week4Section && week4Section.quizzes[0]) {
      console.log(`📝 Updating Week 4 quiz with ${week4Questions.length} questions...`)
      await prisma.quiz.update({
        where: { id: week4Section.quizzes[0].id },
        data: {
          title: `Quiz 04`,
          description: `Week 4 quiz with ${week4Questions.length} questions from QUIZes.docx`,
          questions: JSON.stringify(week4Questions),
          passingScore: 70,
          timeLimit: 10,
          maxRetakes: 3,
          isPublished: true,
          isLocked: false
        }
      })
      console.log(`  ✅ Updated Quiz 04 with ${week4Questions.length} questions`)
    }
    
    console.log('🎉 Weeks 3-4 quizzes updated successfully!')
    console.log(`📊 Quiz Summary:`)
    console.log(`  - Week 3: Research and Sources (${week3Questions.length} questions)`)
    console.log(`  - Week 4: Plagiarism and Referencing (${week4Questions.length} questions)`)
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
updateQuizzesWithRealContent()
