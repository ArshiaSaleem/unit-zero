import * as fs from 'fs'

// Read the HTML file
const html = fs.readFileSync('debug-quiz-html.html', 'utf8')

// Function to clean HTML and extract text
function cleanText(html: string): string {
  return html
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
    .replace(/&amp;/g, '&') // Replace &amp; with &
    .replace(/&lt;/g, '<') // Replace &lt; with <
    .replace(/&gt;/g, '>') // Replace &gt; with >
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim()
}

// Extract all questions for weeks 3-10
const allQuestions = []

for (let week = 3; week <= 10; week++) {
  console.log(`\n=== WEEK ${week} ===`)
  
  const weekPattern = new RegExp(`Week\\s+0?${week}.*?(?=Week\\s+0?${week + 1}|$)`, 's')
  const weekMatch = html.match(weekPattern)
  
  if (!weekMatch) {
    console.log(`No content found for Week ${week}`)
    continue
  }
  
  const weekContent = weekMatch[0]
  console.log(`Week ${week} content length: ${weekContent.length}`)
  
  const questions = []
  
  // Extract questions 1-10 from the main ol structure
  const mainOlMatch = weekContent.match(/<ol>(.*?)<\/ol>/s)
  if (mainOlMatch) {
    const mainOlContent = mainOlMatch[1]
    const questionPattern = /<li>([^<]+)<ol>(.*?)<\/ol><\/li>/gs
    const questionMatches = [...mainOlContent.matchAll(questionPattern)]
    
    console.log(`  Found ${questionMatches.length} questions in main ol structure`)
    
    for (let i = 0; i < questionMatches.length; i++) {
      const questionText = cleanText(questionMatches[i][1])
      const optionsHtml = questionMatches[i][2]
      
      if (questionText.length < 10) continue
      
      const optionLiMatches = [...optionsHtml.matchAll(/<li>(.*?)<\/li>/gs)]
      const options: string[] = []
      let correctAnswer = 0
      
      for (let k = 0; k < optionLiMatches.length; k++) {
        let optionText = cleanText(optionLiMatches[k][1])
        
        if (optionText.includes('✅')) {
          correctAnswer = k
          optionText = optionText.replace('✅', '').trim()
        }
        
        if (optionText && optionText.length > 2) {
          options.push(optionText)
        }
      }
      
      if (options.length >= 2) {
        questions.push({
          questionNumber: i + 1,
          question: questionText,
          options: options,
          correctAnswer: correctAnswer
        })
        console.log(`  Q${i + 1}: ${questionText.substring(0, 50)}... (${options.length} options, correct: ${correctAnswer})`)
      }
    }
  }
  
  // Extract questions 11-16 from strong tags
  const strongQuestionPattern = /<p><strong>(\d+\.\s*[^<]+)<\/strong><\/p><ol>(.*?)<\/ol>/gs
  const strongMatches = [...weekContent.matchAll(strongQuestionPattern)]
  
  console.log(`  Found ${strongMatches.length} strong question structures`)
  
  for (const match of strongMatches) {
    const questionText = cleanText(match[1])
    const optionsHtml = match[2]
    
    if (questionText.length < 10) continue
    
    const optionLiMatches = [...optionsHtml.matchAll(/<li>(.*?)<\/li>/gs)]
    const options: string[] = []
    let correctAnswer = 0
    
    for (let k = 0; k < optionLiMatches.length; k++) {
      let optionText = cleanText(optionLiMatches[k][1])
      
      if (optionText.includes('✅')) {
        correctAnswer = k
        optionText = optionText.replace('✅', '').trim()
      }
      
      if (optionText && optionText.length > 2) {
        options.push(optionText)
      }
    }
    
    if (options.length >= 2) {
      const questionNumber = parseInt(questionText.match(/^(\d+)\./)?.[1] || '0')
      questions.push({
        questionNumber: questionNumber,
        question: questionText,
        options: options,
        correctAnswer: correctAnswer
      })
      console.log(`  Q${questionNumber}: ${questionText.substring(0, 50)}... (${options.length} options, correct: ${correctAnswer})`)
    }
  }
  
  // Sort questions by number
  questions.sort((a, b) => a.questionNumber - b.questionNumber)
  
  allQuestions.push({
    week: week,
    questions: questions
  })
  
  console.log(`✅ Week ${week}: Found ${questions.length} questions`)
}

// Save to file
fs.writeFileSync('remaining-weeks-questions.json', JSON.stringify(allQuestions, null, 2))
console.log('\n✅ All remaining weeks questions saved to remaining-weeks-questions.json')
