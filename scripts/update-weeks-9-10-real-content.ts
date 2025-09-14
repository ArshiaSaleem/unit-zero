import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface QuizQuestion {
  question: string
  options: string[]
  correctAnswer: number
}

// Week 9 - Assessment Preparation and Paragraph Writing
const week9Questions: QuizQuestion[] = [
  {
    question: "What is the first step in preparing for a BTEC assessment?",
    options: [
      "Start writing immediately",
      "Read the assignment brief carefully",
      "Ask your friend for help",
      "Submit last year's work"
    ],
    correctAnswer: 1
  },
  {
    question: "Why is planning important before starting an assignment?",
    options: [
      "It makes your work shorter",
      "It helps avoid last-minute stress and improves quality",
      "It replaces the need for research",
      "It allows you to skip feedback"
    ],
    correctAnswer: 1
  },
  {
    question: "What does a SMART goal help you do?",
    options: [
      "Memorize facts",
      "Write longer essays",
      "Set clear and achievable targets",
      "Avoid deadlines"
    ],
    correctAnswer: 2
  },
  {
    question: "What is the purpose of drafting your assignment?",
    options: [
      "To submit it early",
      "To get feedback and improve your work",
      "To copy from a source",
      "To avoid referencing"
    ],
    correctAnswer: 1
  },
  {
    question: "How should you respond to teacher feedback?",
    options: [
      "Ignore it",
      "Get defensive",
      "Apply suggestions and ask questions",
      "Delete the message"
    ],
    correctAnswer: 2
  },
  {
    question: "What is a good strategy for preparing a presentation?",
    options: [
      "Read from your slides",
      "Use cue cards and practice aloud",
      "Avoid eye contact",
      "Speak as fast as possible"
    ],
    correctAnswer: 1
  },
  {
    question: "What does the assessment criteria in BTEC tell you?",
    options: [
      "How many words to write",
      "What you need to do to achieve Pass, Merit, or Distinction",
      "Which font to use",
      "What grade you will get"
    ],
    correctAnswer: 1
  },
  {
    question: "What is a common mistake when preparing for assessments?",
    options: [
      "Using a checklist",
      "Starting too late",
      "Asking for feedback",
      "Practicing your presentation"
    ],
    correctAnswer: 1
  },
  {
    question: "Why is it helpful to take a break before revising your draft?",
    options: [
      "To forget what you wrote",
      "To avoid finishing",
      "To review your work with fresh eyes",
      "To skip editing"
    ],
    correctAnswer: 2
  },
  {
    question: "What should you include in a final reflection?",
    options: [
      "A list of your grades",
      "A summary of your favorite snacks",
      "What you learned and how you improved",
      "A copy of your assignment brief"
    ],
    correctAnswer: 2
  },
  {
    question: "What is a key feature of a Distinction-level paragraph in BTEC?",
    options: [
      "It includes personal opinions without evidence",
      "It uses emojis and informal language",
      "It presents a clear argument supported by evidence and analysis",
      "It repeats the question without adding detail"
    ],
    correctAnswer: 2
  },
  {
    question: "Which of the following best improves the quality of a paragraph?",
    options: [
      "Using short, vague sentences",
      "Including a topic sentence, evidence, and explanation",
      "Writing in bullet points",
      "Avoiding transitions between ideas"
    ],
    correctAnswer: 1
  },
  {
    question: "What does it mean to \"link back to the brief\" in your writing?",
    options: [
      "Mention the teacher's name",
      "Refer to the scenario and task to stay focused",
      "Copy the brief word-for-word",
      "Ignore the brief and write freely"
    ],
    correctAnswer: 1
  },
  {
    question: "Which sentence shows strong analysis in a paragraph?",
    options: [
      "\"The company sells chocolate.\"",
      "\"Tony's Chocolonely is popular.\"",
      "\"Tony's Chocolonely uses ethical branding, which appeals to socially conscious consumers and strengthens its market position.\"",
      "\"I like Tony's Chocolonely.\""
    ],
    correctAnswer: 2
  },
  {
    question: "Why is it important to use evidence in your paragraph?",
    options: [
      "To make the paragraph longer",
      "To support your claims and show research",
      "To avoid writing your own ideas",
      "To impress your classmates"
    ],
    correctAnswer: 1
  },
  {
    question: "What is the role of a concluding sentence in a paragraph?",
    options: [
      "To introduce a new topic",
      "To summarize the main point and reinforce your argument",
      "To list all your sources",
      "To repeat the topic sentence"
    ],
    correctAnswer: 1
  }
]

// Week 10 - Mini Project and Final Assessment
const week10Questions: QuizQuestion[] = [
  {
    question: "What is the main purpose of the Mini Project in Week 10?",
    options: [
      "To test your memory",
      "To apply all the skills learned during the course",
      "To complete a group quiz",
      "To write a fictional story"
    ],
    correctAnswer: 1
  },
  {
    question: "Which of the following should be included in your Mini Project?",
    options: [
      "A list of your favorite snacks",
      "A breakdown of unrelated facts",
      "Analysis, evaluation, and justification",
      "Only personal opinions"
    ],
    correctAnswer: 2
  },
  {
    question: "What does a strong justification require?",
    options: [
      "A guess based on feelings",
      "A recommendation supported by evidence",
      "A summary of the brief",
      "A list of random ideas"
    ],
    correctAnswer: 1
  },
  {
    question: "Why is reflection important in BTEC?",
    options: [
      "It helps you memorize facts",
      "It allows you to copy from past work",
      "It helps you understand your growth and set goals",
      "It replaces the need for feedback"
    ],
    correctAnswer: 2
  },
  {
    question: "What should your reference list include?",
    options: [
      "Only websites you visited",
      "All sources used in your assignment",
      "Your personal opinions",
      "Your classmates' answers"
    ],
    correctAnswer: 1
  },
  {
    question: "Which of the following is a good way to start your Mini Project?",
    options: [
      "\"I don't know what to write.\"",
      "\"This company is okay.\"",
      "\"This report will analyse the branding strategy of Tony's Chocolonely.\"",
      "\"Let's talk about chocolate.\""
    ],
    correctAnswer: 2
  },
  {
    question: "What is a common mistake in final submissions?",
    options: [
      "Using Harvard referencing",
      "Ignoring the command verbs in the brief",
      "Including analysis and evaluation",
      "Writing a conclusion"
    ],
    correctAnswer: 1
  },
  {
    question: "What does a strong evaluation include?",
    options: [
      "Only strengths",
      "Only weaknesses",
      "A balanced view with evidence",
      "A list of features"
    ],
    correctAnswer: 2
  },
  {
    question: "What is the benefit of writing a letter to your future self?",
    options: [
      "It helps you remember your grades",
      "It helps you reflect and set future goals",
      "It replaces the Mini Project",
      "It's required for every assignment"
    ],
    correctAnswer: 1
  },
  {
    question: "What is the final goal of the BTEC Prep course?",
    options: [
      "To memorize definitions",
      "To complete weekly quizzes",
      "To build skills for vocational success",
      "To avoid group work"
    ],
    correctAnswer: 2
  },
  {
    question: "What is the main purpose of the Mini Project in Week 10?",
    options: [
      "To test your memory",
      "To apply all the skills learned during the course",
      "To complete a group quiz",
      "To write a fictional story"
    ],
    correctAnswer: 1
  },
  {
    question: "Which of the following should be included in your Mini Project?",
    options: [
      "A list of your favorite snacks",
      "A breakdown of unrelated facts",
      "Analysis, evaluation, and justification",
      "Only personal opinions"
    ],
    correctAnswer: 2
  },
  {
    question: "What does a strong justification require?",
    options: [
      "A guess based on feelings",
      "A recommendation supported by evidence",
      "A summary of the brief",
      "A list of random ideas"
    ],
    correctAnswer: 1
  },
  {
    question: "Why is reflection important in BTEC?",
    options: [
      "It helps you memorize facts",
      "It allows you to copy from past work",
      "It helps you understand your growth and set goals",
      "It replaces the need for feedback"
    ],
    correctAnswer: 2
  },
  {
    question: "What should your reference list include?",
    options: [
      "Only websites you visited",
      "All sources used in your assignment",
      "Your personal opinions",
      "Your classmates' answers"
    ],
    correctAnswer: 1
  },
  {
    question: "What is the final goal of the BTEC Prep course?",
    options: [
      "To memorize definitions",
      "To complete weekly quizzes",
      "To build skills for vocational success",
      "To avoid group work"
    ],
    correctAnswer: 2
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
    
    // Update Week 9
    const week9Section = course.sections.find(s => s.order === 9)
    if (week9Section && week9Section.quizzes[0]) {
      console.log(`📝 Updating Week 9 quiz with ${week9Questions.length} questions...`)
      await prisma.quiz.update({
        where: { id: week9Section.quizzes[0].id },
        data: {
          title: `Quiz 09`,
          description: `Week 9 quiz with ${week9Questions.length} questions from QUIZes.docx`,
          questions: JSON.stringify(week9Questions),
          passingScore: 70,
          timeLimit: 10,
          maxRetakes: 3,
          isPublished: true,
          isLocked: false
        }
      })
      console.log(`  ✅ Updated Quiz 09 with ${week9Questions.length} questions`)
    }
    
    // Update Week 10
    const week10Section = course.sections.find(s => s.order === 10)
    if (week10Section && week10Section.quizzes[0]) {
      console.log(`📝 Updating Week 10 quiz with ${week10Questions.length} questions...`)
      await prisma.quiz.update({
        where: { id: week10Section.quizzes[0].id },
        data: {
          title: `Quiz 10`,
          description: `Week 10 quiz with ${week10Questions.length} questions from QUIZes.docx`,
          questions: JSON.stringify(week10Questions),
          passingScore: 70,
          timeLimit: 10,
          maxRetakes: 3,
          isPublished: true,
          isLocked: false
        }
      })
      console.log(`  ✅ Updated Quiz 10 with ${week10Questions.length} questions`)
    }
    
    console.log('🎉 Weeks 9-10 quizzes updated successfully!')
    console.log(`📊 Quiz Summary:`)
    console.log(`  - Week 9: Assessment Preparation and Paragraph Writing (${week9Questions.length} questions)`)
    console.log(`  - Week 10: Mini Project and Final Assessment (${week10Questions.length} questions)`)
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
