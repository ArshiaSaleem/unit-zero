import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface QuizQuestion {
  question: string
  options: string[]
  correctAnswer: number
}

// Week 7 - Assignment Briefs
const week7Questions: QuizQuestion[] = [
  {
    question: "What is the purpose of an assignment brief in BTEC?",
    options: [
      "To test your memory",
      "To provide a fictional story",
      "To guide your task and show assessment criteria",
      "To list your grades"
    ],
    correctAnswer: 2
  },
  {
    question: "What does the scenario in a brief describe?",
    options: [
      "The deadline for submission",
      "The role or context you are working in",
      "The marking scheme",
      "The number of pages required"
    ],
    correctAnswer: 1
  },
  {
    question: "Why is it important to identify the command verb in a brief?",
    options: [
      "To choose your font size",
      "To know how to structure your answer",
      "To copy the example",
      "To skip the task"
    ],
    correctAnswer: 1
  },
  {
    question: "Which of the following is a command verb?",
    options: [
      "Chocolate",
      "Deadline",
      "Describe",
      "Tuesday"
    ],
    correctAnswer: 2
  },
  {
    question: "What should you do first when reading a brief?",
    options: [
      "Start writing immediately",
      "Skip to the last page",
      "Break down the scenario, task, and criteria",
      "Ask your friend for help"
    ],
    correctAnswer: 2
  },
  {
    question: "What does the assessment criteria in a brief tell you?",
    options: [
      "What grade you will get",
      "What you need to do to achieve Pass, Merit, or Distinction",
      "How many words to write",
      "Which font to use"
    ],
    correctAnswer: 1
  },
  {
    question: "What is a common mistake when responding to a brief?",
    options: [
      "Using examples",
      "Ignoring the command verb",
      "Writing in paragraphs",
      "Including a reference list"
    ],
    correctAnswer: 1
  },
  {
    question: "How can you make sure your work matches the brief?",
    options: [
      "Use emojis",
      "Write as much as possible",
      "Check each part of your response against the task and criteria",
      "Copy from a website"
    ],
    correctAnswer: 2
  },
  {
    question: "What does \"breaking down a brief\" mean?",
    options: [
      "Ignoring the instructions",
      "Reading only the title",
      "Identifying scenario, task, verbs, and criteria",
      "Writing a summary"
    ],
    correctAnswer: 2
  },
  {
    question: "Why is it important to understand the scenario in a brief?",
    options: [
      "It helps you choose your favorite company",
      "It gives context for your response",
      "It tells you how many marks you'll get",
      "It replaces the need for research"
    ],
    correctAnswer: 1
  },
  {
    question: "What is the main purpose of an assignment brief in BTEC?",
    options: [
      "To entertain the student",
      "To provide a fictional scenario",
      "To guide the task and show assessment criteria",
      "To list your grades"
    ],
    correctAnswer: 2
  },
  {
    question: "What does the scenario section of a brief help you understand?",
    options: [
      "The deadline for submission",
      "The role or context you are working in",
      "The number of words required",
      "The marking scheme"
    ],
    correctAnswer: 1
  },
  {
    question: "Why is it important to identify command verbs in a brief?",
    options: [
      "To choose your font size",
      "To know how to structure your answer",
      "To copy the example",
      "To skip the task"
    ],
    correctAnswer: 1
  },
  {
    question: "Which of the following is a command verb commonly used in BTEC briefs?",
    options: [
      "Chocolate",
      "Deadline",
      "Describe",
      "Tuesday"
    ],
    correctAnswer: 2
  },
  {
    question: "What does the assessment criteria in a brief tell you?",
    options: [
      "What grade you will get",
      "What you need to do to achieve Pass, Merit, or Distinction",
      "How many words to write",
      "Which font to use"
    ],
    correctAnswer: 1
  },
  {
    question: "What is a good strategy when reading a new assignment brief?",
    options: [
      "Skip to the last page",
      "Start writing immediately",
      "Break down the scenario, task, and criteria",
      "Ask your friend for help"
    ],
    correctAnswer: 2
  }
]

// Week 8 - Professionalism
const week8Questions: QuizQuestion[] = [
  {
    question: "What does professionalism mean in a classroom setting?",
    options: [
      "Wearing formal clothes",
      "Acting with respect and responsibility",
      "Speaking only when asked",
      "Avoiding group work"
    ],
    correctAnswer: 1
  },
  {
    question: "Which of the following is a sign of professional behavior?",
    options: [
      "Arriving late to class",
      "Ignoring feedback",
      "Participating actively in group tasks",
      "Using slang in emails"
    ],
    correctAnswer: 2
  },
  {
    question: "What is the purpose of email etiquette in BTEC?",
    options: [
      "To make emails longer",
      "To impress your classmates",
      "To communicate clearly and respectfully",
      "To avoid writing assignments"
    ],
    correctAnswer: 2
  },
  {
    question: "Which of the following is a professional way to start an email?",
    options: [
      "\"Yo, what's up?\"",
      "\"Hey, I need help.\"",
      "\"Dear Ms. Jansen,\"",
      "\"Guess what?\""
    ],
    correctAnswer: 2
  },
  {
    question: "What is a key trait of a professional student?",
    options: [
      "Avoids deadlines",
      "Takes responsibility for their actions",
      "Waits for others to lead",
      "Ignores group messages"
    ],
    correctAnswer: 1
  },
  {
    question: "Why is professionalism important in group work?",
    options: [
      "It helps you avoid tasks",
      "It builds trust and teamwork",
      "It allows you to work alone",
      "It replaces the need for communication"
    ],
    correctAnswer: 1
  },
  {
    question: "Which of the following is considered unprofessional online behavior?",
    options: [
      "Using polite language",
      "Responding promptly",
      "Using emojis and slang in formal emails",
      "Asking clear questions"
    ],
    correctAnswer: 2
  },
  {
    question: "What does it mean to take initiative in a group project?",
    options: [
      "Wait for instructions",
      "Let others do the work",
      "Offer ideas and help organize tasks",
      "Avoid communication"
    ],
    correctAnswer: 2
  },
  {
    question: "How can professionalism affect your future opportunities?",
    options: [
      "It makes assignments easier",
      "It improves your reputation and builds trust",
      "It replaces the need for grades",
      "It guarantees a job"
    ],
    correctAnswer: 1
  },
  {
    question: "What is a professional way to respond to feedback?",
    options: [
      "Ignore it",
      "Get defensive",
      "Apply suggestions and ask questions",
      "Delete the message"
    ],
    correctAnswer: 2
  },
  {
    question: "What does professionalism in a BTEC classroom mainly involve?",
    options: [
      "Wearing formal clothes every day",
      "Arriving late but participating actively",
      "Showing respect, punctuality, and responsibility",
      "Avoiding group work"
    ],
    correctAnswer: 2
  },
  {
    question: "Which of the following is an example of professional online behavior?",
    options: [
      "Using emojis in formal emails",
      "Responding to messages with slang",
      "Communicating clearly and respectfully",
      "Ignoring deadlines in virtual tasks"
    ],
    correctAnswer: 2
  },
  {
    question: "Why is it important to maintain professionalism during group work?",
    options: [
      "To avoid doing your part",
      "To ensure fair contribution and mutual respect",
      "To impress the teacher",
      "To finish faster"
    ],
    correctAnswer: 1
  },
  {
    question: "What is a key sign of unprofessional behavior in class?",
    options: [
      "Asking questions during a lesson",
      "Submitting work on time",
      "Interrupting others and ignoring instructions",
      "Taking notes during group discussions"
    ],
    correctAnswer: 2
  },
  {
    question: "How can students show professionalism when receiving feedback?",
    options: [
      "By arguing with the teacher",
      "By ignoring the comments",
      "By reflecting and making improvements",
      "By deleting the assignment"
    ],
    correctAnswer: 2
  },
  {
    question: "What is one benefit of being professional in both class and online settings?",
    options: [
      "You get fewer assignments",
      "You avoid working with others",
      "You build a positive reputation and improve employability",
      "You can skip deadlines"
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
    
    // Update Week 7
    const week7Section = course.sections.find(s => s.order === 7)
    if (week7Section && week7Section.quizzes[0]) {
      console.log(`📝 Updating Week 7 quiz with ${week7Questions.length} questions...`)
      await prisma.quiz.update({
        where: { id: week7Section.quizzes[0].id },
        data: {
          title: `Quiz 07`,
          description: `Week 7 quiz with ${week7Questions.length} questions from QUIZes.docx`,
          questions: JSON.stringify(week7Questions),
          passingScore: 70,
          timeLimit: 10,
          maxRetakes: 3,
          isPublished: true,
          isLocked: false
        }
      })
      console.log(`  ✅ Updated Quiz 07 with ${week7Questions.length} questions`)
    }
    
    // Update Week 8
    const week8Section = course.sections.find(s => s.order === 8)
    if (week8Section && week8Section.quizzes[0]) {
      console.log(`📝 Updating Week 8 quiz with ${week8Questions.length} questions...`)
      await prisma.quiz.update({
        where: { id: week8Section.quizzes[0].id },
        data: {
          title: `Quiz 08`,
          description: `Week 8 quiz with ${week8Questions.length} questions from QUIZes.docx`,
          questions: JSON.stringify(week8Questions),
          passingScore: 70,
          timeLimit: 10,
          maxRetakes: 3,
          isPublished: true,
          isLocked: false
        }
      })
      console.log(`  ✅ Updated Quiz 08 with ${week8Questions.length} questions`)
    }
    
    console.log('🎉 Weeks 7-8 quizzes updated successfully!')
    console.log(`📊 Quiz Summary:`)
    console.log(`  - Week 7: Assignment Briefs (${week7Questions.length} questions)`)
    console.log(`  - Week 8: Professionalism (${week8Questions.length} questions)`)
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
