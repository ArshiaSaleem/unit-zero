// Debug script to test the convertRandomizedToOriginal function specifically

// This simulates what happens in the API
const randomizedQuestions = [
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
    "correctAnswer": "1", // This is the index after shuffling
    "points": 1,
    "shuffledOptions": [
      "British Technical Education Certificate",
      "Business and Technology Education Council",
      "Basic Training for Employment Courses",
      "Business Training and Exam Centre"
    ],
    "originalCorrectAnswer": "Business and Technology Education Council",
    "correctAnswerIndex": 1
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
    "correctAnswer": "1", // This is the index after shuffling
    "points": 1,
    "shuffledOptions": [
      "BTEC uses final exams only",
      "BTEC focuses on practical, real-world tasks",
      "BTEC avoids group work",
      "BTEC is only for university students"
    ],
    "originalCorrectAnswer": "BTEC focuses on practical, real-world tasks",
    "correctAnswerIndex": 1
  }
]

// Student answers
const studentAnswers = [
  { answer: "0" }, // Should map to "British Technical Education Certificate"
  { answer: "0" }  // Should map to "BTEC uses final exams only"
]

// The convertRandomizedToOriginal function from the API
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

// The mapStudentAnswers function from the API
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

console.log("=== RANDOMIZED QUESTIONS (as they come from API) ===")
randomizedQuestions.forEach((q, i) => {
  console.log(`Q${i}: ${q.question}`)
  console.log(`  correctAnswer: "${q.correctAnswer}" (index)`)
  console.log(`  originalCorrectAnswer: "${q.originalCorrectAnswer}"`)
  console.log(`  shuffledOptions: [${q.shuffledOptions.join(', ')}]`)
  console.log()
})

// Step 1: Map student answers
const mappedAnswers = mapStudentAnswers(randomizedQuestions, studentAnswers)
console.log("=== MAPPED STUDENT ANSWERS ===")
mappedAnswers.forEach((answer, i) => {
  console.log(`Q${i}: "${answer.answer}"`)
})

// Step 2: Convert randomized questions back to original
const originalQuestions = convertRandomizedToOriginal(randomizedQuestions)
console.log("\n=== CONVERTED TO ORIGINAL FOR SCORING ===")
originalQuestions.forEach((q, i) => {
  console.log(`Q${i}: ${q.question}`)
  console.log(`  correctAnswer: "${q.correctAnswer}"`)
  console.log(`  options: [${q.options.join(', ')}]`)
  console.log()
})

// Step 3: Score the answers
console.log("=== SCORING ===")
let correctAnswers = 0
for (let i = 0; i < originalQuestions.length; i++) {
  const question = originalQuestions[i]
  const userAnswer = mappedAnswers[i]
  
  console.log(`Q${i}: ${question.question}`)
  console.log(`  Correct: "${question.correctAnswer}"`)
  console.log(`  User: "${userAnswer.answer}"`)
  console.log(`  Match: ${userAnswer.answer === question.correctAnswer}`)
  
  if (userAnswer.answer === question.correctAnswer) {
    correctAnswers++
    console.log("  ✅ CORRECT")
  } else {
    console.log("  ❌ INCORRECT")
  }
  console.log()
}

const score = Math.round((correctAnswers / originalQuestions.length) * 100)
console.log(`=== FINAL SCORE ===`)
console.log(`Correct: ${correctAnswers}/${originalQuestions.length}`)
console.log(`Score: ${score}%`)
