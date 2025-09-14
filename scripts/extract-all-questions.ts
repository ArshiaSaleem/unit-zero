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

// Extract all questions manually
const allQuestions = []

// Week 1 questions (1-16)
const week1Content = html.match(/Week\s+01.*?(?=Week\s+02|$)/s)?.[0] || ''
console.log('Week 1 content length:', week1Content.length)

// Extract questions 1-10 from the main ol structure
const week1MainOl = week1Content.match(/<ol>(.*?)<\/ol>/s)?.[1] || ''
const week1QuestionMatches = [...week1MainOl.matchAll(/<li>([^<]+)<ol>(.*?)<\/ol><\/li>/gs)]

console.log(`Week 1 main ol questions: ${week1QuestionMatches.length}`)

for (let i = 0; i < week1QuestionMatches.length; i++) {
  const questionText = cleanText(week1QuestionMatches[i][1])
  const optionsHtml = week1QuestionMatches[i][2]
  
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
    allQuestions.push({
      week: 1,
      questionNumber: i + 1,
      question: questionText,
      options: options,
      correctAnswer: correctAnswer
    })
    console.log(`  Q${i + 1}: ${questionText.substring(0, 50)}... (${options.length} options, correct: ${correctAnswer})`)
  }
}

// Extract questions 11-16 from strong tags
const week1StrongMatches = [...week1Content.matchAll(/<p><strong>(\d+\.\s*[^<]+)<\/strong><\/p><ol>(.*?)<\/ol>/gs)]
console.log(`Week 1 strong questions: ${week1StrongMatches.length}`)

for (const match of week1StrongMatches) {
  const questionText = cleanText(match[1])
  const optionsHtml = match[2]
  
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
    allQuestions.push({
      week: 1,
      questionNumber: questionNumber,
      question: questionText,
      options: options,
      correctAnswer: correctAnswer
    })
    console.log(`  Q${questionNumber}: ${questionText.substring(0, 50)}... (${options.length} options, correct: ${correctAnswer})`)
  }
}

console.log(`\nTotal Week 1 questions: ${allQuestions.filter(q => q.week === 1).length}`)

// Save to file
fs.writeFileSync('extracted-questions.json', JSON.stringify(allQuestions, null, 2))
console.log('✅ Questions saved to extracted-questions.json')
