import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { answers, questions } = await request.json()
    
    let correctAnswers = 0
    const totalQuestions = questions.length

    console.log('=== QUIZ SCORING TEST ===')
    console.log('Total questions:', totalQuestions)
    console.log('Student answers:', JSON.stringify(answers, null, 2))
    console.log('Questions:', JSON.stringify(questions.map(q => ({
      id: q.id,
      type: q.type,
      question: q.question.substring(0, 50) + '...',
      options: q.options,
      correctAnswer: q.correctAnswer
    })), null, 2))

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i]
      const userAnswer = answers[i]

      if (!userAnswer) {
        console.log(`Question ${i + 1}: No answer provided`)
        continue
      }

      console.log(`\n--- Question ${i + 1} ---`)
      console.log('Question type:', question.type)
      console.log('User answer:', userAnswer.answer)
      console.log('Correct answer:', question.correctAnswer)
      console.log('Question options:', question.options)

      switch (question.type) {
        case 'multiple-choice':
          if (question.options && userAnswer.answer) {
            const selectedIndex = parseInt(userAnswer.answer)
            const selectedOption = question.options[selectedIndex]
            const correctAnswer = question.correctAnswer
            console.log('Selected index:', selectedIndex)
            console.log('Selected option:', selectedOption)
            console.log('Correct answer:', correctAnswer)
            
            if (selectedOption === correctAnswer) {
              correctAnswers++
              console.log('✅ CORRECT')
            } else {
              console.log('❌ WRONG')
            }
          }
          break
        case 'true-false':
          if (userAnswer.answer === question.correctAnswer) {
            correctAnswers++
            console.log('✅ CORRECT')
          } else {
            console.log('❌ WRONG')
          }
          break
        case 'short-answer':
          if (userAnswer.answer && 
              question.correctAnswer && 
              userAnswer.answer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim()) {
            correctAnswers++
            console.log('✅ CORRECT')
          } else {
            console.log('❌ WRONG')
          }
          break
        case 'essay':
          if (userAnswer.answer && userAnswer.answer.trim().length > 0) {
            correctAnswers++
            console.log('✅ CORRECT (essay answered)')
          } else {
            console.log('❌ WRONG (essay not answered)')
          }
          break
      }
    }

    const score = Math.round((correctAnswers / totalQuestions) * 100)
    console.log(`\n=== FINAL SCORE ===`)
    console.log('Correct answers:', correctAnswers)
    console.log('Total questions:', totalQuestions)
    console.log('Score percentage:', score)
    console.log('========================')

    return NextResponse.json({
      correctAnswers,
      totalQuestions,
      score,
      details: {
        correctAnswers,
        totalQuestions,
        scorePercentage: score
      }
    })
  } catch (error) {
    console.error('Test scoring error:', error)
    return NextResponse.json({ error: 'Test failed' }, { status: 500 })
  }
}
