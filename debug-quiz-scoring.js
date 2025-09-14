// Debug script to test quiz scoring logic
const quizData = [
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
  }
]

// Simulate student answers (indices)
const studentAnswers = [
  { answer: "1" }, // Should be "Business and Technology Education Council"
  { answer: "1" }  // Should be "BTEC focuses on practical, real-world tasks"
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
console.log("=== ORIGINAL QUIZ DATA ===")
console.log(JSON.stringify(quizData, null, 2))

console.log("\n=== STUDENT ANSWERS (INDICES) ===")
console.log(JSON.stringify(studentAnswers, null, 2))

// Step 1: Shuffle questions (simulate what happens when student gets quiz)
const randomizedQuestions = quizData.map(question => shuffleQuestionOptions(question))
console.log("\n=== RANDOMIZED QUESTIONS ===")
console.log(JSON.stringify(randomizedQuestions, null, 2))

// Step 2: Map student answers from indices to actual text
const mappedAnswers = mapStudentAnswers(randomizedQuestions, studentAnswers)
console.log("\n=== MAPPED STUDENT ANSWERS ===")
console.log(JSON.stringify(mappedAnswers, null, 2))

// Step 3: Convert randomized questions back to original for scoring
const originalQuestions = convertRandomizedToOriginal(randomizedQuestions)
console.log("\n=== ORIGINAL QUESTIONS FOR SCORING ===")
console.log(JSON.stringify(originalQuestions, null, 2))

// Step 4: Calculate score
let correctAnswers = 0
const totalQuestions = originalQuestions.length

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
