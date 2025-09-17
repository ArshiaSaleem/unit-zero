// Utility functions for quiz randomization and anti-cheating measures

export interface QuizQuestion {
  id: string
  type: 'multiple-choice' | 'true-false' | 'short-answer' | 'essay'
  question: string
  options?: string[]
  correctAnswer?: string
  points?: number
}

export interface RandomizedQuestion extends QuizQuestion {
  shuffledOptions?: string[]
  originalCorrectAnswer?: string
  correctAnswerIndex?: number
}

/**
 * Shuffles an array using Fisher-Yates algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

/**
 * Randomly selects questions from the available questions, ensuring no duplicates
 */
export function selectRandomQuestions(questions: QuizQuestion[], count: number = 10): QuizQuestion[] {
  if (questions.length <= count) {
    return questions
  }
  
  // Remove duplicates first by question text
  const uniqueQuestions = questions.filter((question, index, self) => 
    index === self.findIndex(q => q.question === question.question)
  )
  
  if (uniqueQuestions.length <= count) {
    return uniqueQuestions
  }
  
  const shuffled = shuffleArray(uniqueQuestions)
  return shuffled.slice(0, count)
}

/**
 * Shuffles the options for a multiple choice question and tracks the correct answer
 */
export function shuffleQuestionOptions(question: QuizQuestion): RandomizedQuestion {
  if (question.type !== 'multiple-choice' || !question.options || !question.correctAnswer) {
    return question as RandomizedQuestion
  }

  // Find the index of the correct answer
  const correctAnswerIndex = question.options.findIndex(option => option === question.correctAnswer)
  
  // Shuffle the options
  const shuffledOptions = shuffleArray(question.options)
  
  // Find the new index of the correct answer after shuffling
  const newCorrectAnswerIndex = shuffledOptions.findIndex(option => option === question.correctAnswer)
  
  return {
    ...question,
    shuffledOptions,
    originalCorrectAnswer: question.correctAnswer,
    correctAnswerIndex: newCorrectAnswerIndex,
    // Keep the original correct answer text for scoring
    correctAnswer: question.correctAnswer
  }
}

/**
 * Generates a randomized quiz for a student
 * - Selects random questions from available questions (no duplicates)
 * - Does NOT shuffle options to ensure accurate scoring
 */
export function generateRandomizedQuiz(questions: QuizQuestion[], questionCount: number = 10): RandomizedQuestion[] {
  // Select random questions (this now removes duplicates)
  const selectedQuestions = selectRandomQuestions(questions, questionCount)
  
  // Return questions with original options (no shuffling) to ensure accurate scoring
  return selectedQuestions.map(question => ({
    ...question,
    shuffledOptions: question.options || [], // Keep original order
    originalCorrectAnswer: question.correctAnswer,
    correctAnswer: question.correctAnswer
  }))
}

/**
 * Converts randomized questions back to original format for scoring
 * This is used when submitting answers to ensure correct scoring
 */
export function convertRandomizedToOriginal(questions: RandomizedQuestion[]): QuizQuestion[] {
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

/**
 * Maps student answers from randomized quiz back to original format
 * This handles the case where options were shuffled
 */
export function mapStudentAnswers(
  randomizedQuestions: RandomizedQuestion[], 
  studentAnswers: Array<{ answer: string }>
): Array<{ answer: string }> {
  return studentAnswers.map((answer, index) => {
    const question = randomizedQuestions[index]
    
    // For multiple choice questions, convert the selected index back to the actual option text
    if (question.type === 'multiple-choice' && answer.answer) {
      const selectedIndex = parseInt(answer.answer)
      const options = question.shuffledOptions || question.options || []
      
      if (!isNaN(selectedIndex) && selectedIndex >= 0 && selectedIndex < options.length) {
        return {
          answer: options[selectedIndex]
        }
      }
    }
    
    // For other question types, return the answer as-is
    return answer
  })
}
