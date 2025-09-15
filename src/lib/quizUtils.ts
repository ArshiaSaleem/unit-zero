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
 * Randomly selects 10 questions from the available questions
 */
export function selectRandomQuestions(questions: QuizQuestion[], count: number = 10): QuizQuestion[] {
  if (questions.length <= count) {
    return questions
  }
  
  const shuffled = shuffleArray(questions)
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
 * - Selects 10 random questions from available questions
 * - Does NOT shuffle options to ensure accurate scoring
 */
export function generateRandomizedQuiz(questions: QuizQuestion[], questionCount: number = 10): RandomizedQuestion[] {
  // Select random questions
  const selectedQuestions = selectRandomQuestions(questions, questionCount)
  
  // Return questions without shuffling options to ensure accurate scoring
  return selectedQuestions.map(question => ({
    ...question,
    shuffledOptions: question.options || [],
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
