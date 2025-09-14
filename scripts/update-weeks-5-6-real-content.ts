import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface QuizQuestion {
  question: string
  options: string[]
  correctAnswer: number
}

// Week 5 - Command Verbs (Describe, Explain, Compare)
const week5Questions: QuizQuestion[] = [
  {
    question: "What does the command verb \"describe\" ask you to do?",
    options: [
      "Give your opinion",
      "List similarities and differences",
      "Provide detailed facts or features",
      "Explain why something happens"
    ],
    correctAnswer: 2
  },
  {
    question: "What is the main purpose of the verb \"explain\"?",
    options: [
      "To summarize a topic",
      "To give reasons or causes",
      "To list facts",
      "To compare two ideas"
    ],
    correctAnswer: 1
  },
  {
    question: "What does \"compare\" require in a BTEC assignment?",
    options: [
      "A list of features",
      "A personal opinion",
      "A breakdown of causes",
      "A discussion of similarities and differences"
    ],
    correctAnswer: 3
  },
  {
    question: "Which of the following is a strong sentence using \"describe\"?",
    options: [
      "\"It's a good product.\"",
      "\"The packaging is bright yellow with bold fonts.\"",
      "\"It works well because it's popular.\"",
      "\"It's better than the other brand.\""
    ],
    correctAnswer: 1
  },
  {
    question: "Which phrase is most useful when explaining something?",
    options: [
      "\"It looks like…\"",
      "\"This is because…\"",
      "\"It includes…\"",
      "\"It's similar to…\""
    ],
    correctAnswer: 1
  },
  {
    question: "What's a common mistake when answering a \"compare\" task?",
    options: [
      "Giving examples",
      "Only describing one item",
      "Using command verbs",
      "Writing too much"
    ],
    correctAnswer: 1
  },
  {
    question: "Which of these responses best matches the verb \"explain\"?",
    options: [
      "\"It is popular.\"",
      "\"It includes many features.\"",
      "\"It works well because of its design.\"",
      "\"It looks modern.\""
    ],
    correctAnswer: 2
  },
  {
    question: "What should you include when comparing two Dutch companies?",
    options: [
      "Only their differences",
      "Only their similarities",
      "Both similarities and differences with examples",
      "A list of their products"
    ],
    correctAnswer: 2
  },
  {
    question: "Why is it important to understand command verbs in BTEC?",
    options: [
      "To make your writing longer",
      "To match your response to the assessment criteria",
      "To avoid using sources",
      "To skip the scenario"
    ],
    correctAnswer: 1
  },
  {
    question: "Which of the following is a weak response to a \"compare\" task?",
    options: [
      "\"Both companies use social media.\"",
      "\"One uses Instagram, the other uses TikTok.\"",
      "\"They are similar.\"",
      "\"Both target young consumers, but one focuses on sustainability.\""
    ],
    correctAnswer: 2
  },
  {
    question: "What is the definition of plagiarism in academic work?",
    options: [
      "Using your own ideas without citing them",
      "Copying someone else's work and presenting it as your own",
      "Writing in your own words with references",
      "Quoting a source with proper citation"
    ],
    correctAnswer: 1
  },
  {
    question: "Which of the following is an example of academic honesty?",
    options: [
      "Submitting a friend's assignment",
      "Paraphrasing a source and citing it correctly",
      "Copying from a website without referencing",
      "Using AI tools without checking the content"
    ],
    correctAnswer: 1
  },
  {
    question: "Why is it important to avoid plagiarism in BTEC assignments?",
    options: [
      "It helps you finish faster",
      "It shows you can copy well",
      "It demonstrates integrity and original thinking",
      "It guarantees a higher grade"
    ],
    correctAnswer: 2
  },
  {
    question: "What is the best way to ensure your work is plagiarism-free?",
    options: [
      "Use only one source",
      "Paraphrase and cite all external ideas",
      "Avoid doing research",
      "Copy from trusted websites"
    ],
    correctAnswer: 1
  },
  {
    question: "What happens if a student is caught plagiarizing in BTEC?",
    options: [
      "They automatically pass",
      "They receive extra time",
      "Their work may be rejected or downgraded",
      "They get bonus marks"
    ],
    correctAnswer: 2
  },
  {
    question: "Which of the following tools can help check for plagiarism?",
    options: [
      "Google Translate",
      "Grammarly",
      "Turnitin or other plagiarism checkers",
      "Microsoft Word"
    ],
    correctAnswer: 2
  }
]

// Week 6 - Higher Level Command Verbs (Analyse, Evaluate, Justify)
const week6Questions: QuizQuestion[] = [
  {
    question: "What does the command verb \"analyse\" require you to do?",
    options: [
      "Give your personal opinion",
      "Summarize the topic briefly",
      "Break down information and explore relationships",
      "List facts and features"
    ],
    correctAnswer: 2
  },
  {
    question: "Which of the following best matches the verb \"evaluate\"?",
    options: [
      "Judge the effectiveness or value of something",
      "Explain why something happens",
      "List similarities and differences",
      "Describe the features of a product"
    ],
    correctAnswer: 0
  },
  {
    question: "What does the command verb \"justify\" ask you to do?",
    options: [
      "Explain how something works",
      "Give a balanced view of pros and cons",
      "Defend your opinion or recommendation with evidence",
      "List all possible options"
    ],
    correctAnswer: 2
  },
  {
    question: "Which of the following is a strong justification statement?",
    options: [
      "\"This is the best option because it aligns with customer needs and has proven success in similar campaigns.\"",
      "\"It might work well, but I'm not sure.\"",
      "\"This strategy is good because it looks nice.\"",
      "\"I think this is the best option.\""
    ],
    correctAnswer: 0
  },
  {
    question: "Why are \"analyse\", \"evaluate\", and \"justify\" considered higher-level command verbs in BTEC?",
    options: [
      "They require deeper thinking and evidence-based responses",
      "They are easier to answer than describe or explain",
      "They are used only in group work",
      "They are only used in presentations"
    ],
    correctAnswer: 0
  },
  {
    question: "What is a key feature of a strong evaluation?",
    options: [
      "Listing facts without judgment",
      "Giving a personal opinion with no evidence",
      "Weighing strengths and weaknesses with examples",
      "Copying from a source"
    ],
    correctAnswer: 2
  },
  {
    question: "What should you include when analysing a company's strategy?",
    options: [
      "Only the company's name",
      "A breakdown of its parts and how they work together",
      "A list of its products",
      "A personal opinion"
    ],
    correctAnswer: 1
  },
  {
    question: "Which phrase is most useful when justifying a recommendation?",
    options: [
      "\"I like this idea.\"",
      "\"This is the best option because…\"",
      "\"It looks nice.\"",
      "\"It's similar to others.\""
    ],
    correctAnswer: 1
  },
  {
    question: "What's a common mistake when evaluating a product or strategy?",
    options: [
      "Giving examples",
      "Ignoring weaknesses or limitations",
      "Using evidence",
      "Making a recommendation"
    ],
    correctAnswer: 1
  },
  {
    question: "How can you improve your analysis in assignments?",
    options: [
      "Use vague statements",
      "Focus only on one part",
      "Explore how different parts connect and affect outcomes",
      "Avoid using sources"
    ],
    correctAnswer: 2
  },
  {
    question: "What does the command verb \"analyse\" require you to do?",
    options: [
      "List facts and features",
      "Break down information and explore relationships",
      "Give your personal opinion",
      "Summarize the topic briefly"
    ],
    correctAnswer: 1
  },
  {
    question: "Which of the following best matches the verb \"evaluate\"?",
    options: [
      "Judge the effectiveness or value of something",
      "Describe the features of a product",
      "List similarities and differences",
      "Explain why something happens"
    ],
    correctAnswer: 0
  },
  {
    question: "What does the command verb \"justify\" ask you to do?",
    options: [
      "Defend your opinion or recommendation with evidence",
      "List all possible options",
      "Give a balanced view of pros and cons",
      "Explain how something works"
    ],
    correctAnswer: 0
  },
  {
    question: "Which of the following is a strong justification statement?",
    options: [
      "\"This strategy is good because it looks nice.\"",
      "\"I think this is the best option.\"",
      "\"It might work well, but I'm not sure.\"",
      "\"This is the best option because it aligns with customer needs and has proven success in similar campaigns.\""
    ],
    correctAnswer: 3
  },
  {
    question: "Why are \"analyse\", \"evaluate\", and \"justify\" considered higher-level command verbs in BTEC?",
    options: [
      "They are easier to answer than describe or explain",
      "They are used only in group work",
      "They require deeper thinking and evidence-based responses",
      "They are only used in presentations"
    ],
    correctAnswer: 2
  },
  {
    question: "What is a key feature of a strong evaluation?",
    options: [
      "Giving a personal opinion with no evidence",
      "Copying from a source",
      "Listing facts without judgment",
      "Weighing strengths and weaknesses with examples"
    ],
    correctAnswer: 3
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
    
    // Update Week 5
    const week5Section = course.sections.find(s => s.order === 5)
    if (week5Section && week5Section.quizzes[0]) {
      console.log(`📝 Updating Week 5 quiz with ${week5Questions.length} questions...`)
      await prisma.quiz.update({
        where: { id: week5Section.quizzes[0].id },
        data: {
          title: `Quiz 05`,
          description: `Week 5 quiz with ${week5Questions.length} questions from QUIZes.docx`,
          questions: JSON.stringify(week5Questions),
          passingScore: 70,
          timeLimit: 10,
          maxRetakes: 3,
          isPublished: true,
          isLocked: false
        }
      })
      console.log(`  ✅ Updated Quiz 05 with ${week5Questions.length} questions`)
    }
    
    // Update Week 6
    const week6Section = course.sections.find(s => s.order === 6)
    if (week6Section && week6Section.quizzes[0]) {
      console.log(`📝 Updating Week 6 quiz with ${week6Questions.length} questions...`)
      await prisma.quiz.update({
        where: { id: week6Section.quizzes[0].id },
        data: {
          title: `Quiz 06`,
          description: `Week 6 quiz with ${week6Questions.length} questions from QUIZes.docx`,
          questions: JSON.stringify(week6Questions),
          passingScore: 70,
          timeLimit: 10,
          maxRetakes: 3,
          isPublished: true,
          isLocked: false
        }
      })
      console.log(`  ✅ Updated Quiz 06 with ${week6Questions.length} questions`)
    }
    
    console.log('🎉 Weeks 5-6 quizzes updated successfully!')
    console.log(`📊 Quiz Summary:`)
    console.log(`  - Week 5: Command Verbs (${week5Questions.length} questions)`)
    console.log(`  - Week 6: Higher Level Command Verbs (${week6Questions.length} questions)`)
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
