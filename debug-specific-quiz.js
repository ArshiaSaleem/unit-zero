// Debug script for the specific quiz attempt that scored 0%

// This is the actual quiz data from the database
const originalQuizData = [
  {
    "id": "question-0",
    "type": "multiple-choice",
    "question": "What does BTEC stand for?",
    "options": [
      "British Technical Education Certificate",
      "Business and Technology Education Council",
      "Basic Training for Employment Courses",
      "Business Training and Exam Centre"
    ],
    "correctAnswer": "Business and Technology Education Council",
    "points": 1
  },
  {
    "id": "question-1",
    "type": "multiple-choice",
    "question": "What is the main difference between BTEC and traditional academic routes?",
    "options": [
      "BTEC uses final exams only",
      "BTEC focuses on practical, real-world tasks",
      "BTEC avoids group work",
      "BTEC is only for university students"
    ],
    "correctAnswer": "BTEC focuses on practical, real-world tasks",
    "points": 1
  },
  {
    "id": "question-2",
    "type": "multiple-choice",
    "question": "Which of the following is a common feature of BTEC assessment?",
    "options": [
      "Weekly quizzes",
      "Final written exams",
      "Coursework and scenario-based assignments",
      "Oral interviews"
    ],
    "correctAnswer": "Coursework and scenario-based assignments",
    "points": 1
  },
  {
    "id": "question-3",
    "type": "multiple-choice",
    "question": "What type of learner is BTEC most suitable for?",
    "options": [
      "Someone who prefers memorizing facts",
      "Someone who enjoys hands-on learning",
      "Someone who dislikes teamwork",
      "Someone who avoids deadlines"
    ],
    "correctAnswer": "Someone who enjoys hands-on learning",
    "points": 1
  },
  {
    "id": "question-4",
    "type": "multiple-choice",
    "question": "What is a scenario in a BTEC assignment brief?",
    "options": [
      "A list of questions",
      "A fictional story",
      "A real-world context for the task",
      "A summary of your last assignment"
    ],
    "correctAnswer": "A real-world context for the task",
    "points": 1
  },
  {
    "id": "question-5",
    "type": "multiple-choice",
    "question": "Which of the following subjects is commonly offered in BTEC?",
    "options": [
      "Latin",
      "Business",
      "Philosophy",
      "Physics"
    ],
    "correctAnswer": "Business",
    "points": 1
  },
  {
    "id": "question-6",
    "type": "multiple-choice",
    "question": "What does vocational education prepare you for?",
    "options": [
      "University entrance exams",
      "Real-world careers",
      "Debate competitions",
      "History essays"
    ],
    "correctAnswer": "Real-world careers",
    "points": 1
  },
  {
    "id": "question-7",
    "type": "multiple-choice",
    "question": "Which of these is NOT typically part of a BTEC assignment brief?",
    "options": [
      "Command verbs",
      "Deadline",
      "Multiple choice questions",
      "Scenario"
    ],
    "correctAnswer": "Multiple choice questions",
    "points": 1
  },
  {
    "id": "question-8",
    "type": "multiple-choice",
    "question": "What is the purpose of command verbs in BTEC assignments?",
    "options": [
      "To confuse students",
      "To guide how you should respond",
      "To list your grades",
      "To replace the scenario"
    ],
    "correctAnswer": "To guide how you should respond",
    "points": 1
  },
  {
    "id": "question-9",
    "type": "multiple-choice",
    "question": "Why is BTEC considered a flexible qualification?",
    "options": [
      "It avoids written work",
      "It allows students to choose between coursework and exams",
      "It can lead to university, apprenticeships, or employment",
      "It has no deadlines"
    ],
    "correctAnswer": "It can lead to university, apprenticeships, or employment",
    "points": 1
  }
]

// Student's actual answers from the database
const studentAnswers = [
  { answer: "0" }, // Question 0: Answer index 0
  { answer: "0" }, // Question 1: Answer index 0  
  { answer: "1" }, // Question 2: Answer index 1
  { answer: "0" }, // Question 3: Answer index 0
  { answer: "2" }, // Question 4: Answer index 2
  { answer: "2" }, // Question 5: Answer index 2
  { answer: "2" }, // Question 6: Answer index 2
  { answer: "2" }, // Question 7: Answer index 2
  { answer: "3" }, // Question 8: Answer index 3
  { answer: "1" }  // Question 9: Answer index 1
]

// Simulate the shuffleQuestionOptions function
function shuffleQuestionOptions(question) {
  if (question.type !== 'multiple-choice' || !question.options || !question.correctAnswer) {
    return question
  }

  // Find the index of the correct answer
  const correctAnswerIndex = question.options.findIndex(option => option === question.correctAnswer)
  
  // For testing, let's not actually shuffle, just simulate
  const shuffledOptions = [...question.options]
  
  // Find the new index of the correct answer after shuffling
  const newCorrectAnswerIndex = shuffledOptions.findIndex(option => option === question.correctAnswer)
  
  return {
    ...question,
    shuffledOptions,
    originalCorrectAnswer: question.correctAnswer,
    correctAnswerIndex: newCorrectAnswerIndex,
    // Update the correctAnswer to be the new index for scoring
    correctAnswer: newCorrectAnswerIndex.toString()
  }
}

// Simulate the mapStudentAnswers function
function mapStudentAnswers(randomizedQuestions, studentAnswers) {
  return studentAnswers.map((answer, index) => {
    const question = randomizedQuestions[index]
    
    // For multiple choice questions, convert the selected index back to the actual option text
    if (question.type === 'multiple-choice' && question.shuffledOptions && answer.answer) {
      const selectedIndex = parseInt(answer.answer)
      if (!isNaN(selectedIndex) && selectedIndex >= 0 && selectedIndex < question.shuffledOptions.length) {
        return {
          answer: question.shuffledOptions[selectedIndex]
        }
      }
    }
    
    return answer
  })
}

// Simulate the convertRandomizedToOriginal function
function convertRandomizedToOriginal(questions) {
  return questions.map(question => {
    if (question.type === 'multiple-choice' && question.originalCorrectAnswer) {
      return {
        ...question,
        options: question.shuffledOptions || question.options,
        correctAnswer: question.originalCorrectAnswer
      }
    }
    return question
  })
}

// Test the flow
console.log("=== TESTING ACTUAL QUIZ ATTEMPT ===")

// Step 1: Shuffle questions (simulate what happens when student gets quiz)
const randomizedQuestions = originalQuizData.map(question => shuffleQuestionOptions(question))
console.log("\n=== RANDOMIZED QUESTIONS ===")
randomizedQuestions.forEach((q, i) => {
  console.log(`Q${i}: ${q.question}`)
  console.log(`  Options: ${q.shuffledOptions.join(' | ')}`)
  console.log(`  Correct Answer Index: ${q.correctAnswerIndex}`)
  console.log(`  Original Correct Answer: "${q.originalCorrectAnswer}"`)
  console.log()
})

// Step 2: Map student answers from indices to actual text
const mappedAnswers = mapStudentAnswers(randomizedQuestions, studentAnswers)
console.log("\n=== MAPPED STUDENT ANSWERS ===")
mappedAnswers.forEach((answer, i) => {
  console.log(`Q${i}: "${answer.answer}"`)
})

// Step 3: Convert randomized questions back to original for scoring
const originalQuestions = convertRandomizedToOriginal(randomizedQuestions)
console.log("\n=== ORIGINAL QUESTIONS FOR SCORING ===")
originalQuestions.forEach((q, i) => {
  console.log(`Q${i}: ${q.question}`)
  console.log(`  Correct Answer: "${q.correctAnswer}"`)
})

// Step 4: Calculate score
let correctAnswers = 0
const totalQuestions = originalQuestions.length

console.log("\n=== SCORING DETAILS ===")
for (let i = 0; i < originalQuestions.length; i++) {
  const question = originalQuestions[i]
  const userAnswer = mappedAnswers[i]

  console.log(`\n--- Question ${i} ---`)
  console.log(`Question: ${question.question}`)
  console.log(`Correct Answer: "${question.correctAnswer}"`)
  console.log(`User Answer: "${userAnswer.answer}"`)
  console.log(`Match: ${userAnswer.answer === question.correctAnswer}`)

  if (!userAnswer) continue

  switch (question.type) {
    case 'multiple-choice':
      if (userAnswer.answer === question.correctAnswer) {
        correctAnswers++
        console.log("✅ CORRECT")
      } else {
        console.log("❌ INCORRECT")
      }
      break
  }
}

const score = Math.round((correctAnswers / totalQuestions) * 100)
console.log(`\n=== FINAL SCORE ===`)
console.log(`Correct: ${correctAnswers}/${totalQuestions}`)
console.log(`Score: ${score}%`)
