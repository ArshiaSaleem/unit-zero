import * as fs from 'fs'
import * as mammoth from 'mammoth'

// Function to parse quiz questions from HTML content
function parseQuizQuestions(html: string) {
  console.log('=== DEBUGGING QUIZ PARSER ===')
  
  // Split by week patterns
  const weekPattern = /Week\s+(\d+)/gi
  const weekMatches = [...html.matchAll(weekPattern)]
  
  console.log(`Found ${weekMatches.length} week patterns:`, weekMatches.map(m => m[1]))
  
  if (weekMatches.length === 0) {
    console.log('No week patterns found!')
    return []
  }
  
  // Take just the first week for debugging
  const weekMatch = weekMatches[0]
  const weekNumber = parseInt(weekMatch[1])
  const startIndex = weekMatch.index!
  const endIndex = weekMatches.length > 1 ? weekMatches[1].index! : html.length
  const weekContent = html.substring(startIndex, endIndex)
  
  console.log(`\n=== WEEK ${weekNumber} CONTENT (first 500 chars) ===`)
  console.log(weekContent.substring(0, 500))
  
  // Find all ordered lists in this week's content
  const olMatches = [...weekContent.matchAll(/<ol>(.*?)<\/ol>/gs)]
  console.log(`\nFound ${olMatches.length} ordered lists in Week ${weekNumber}`)
  
  for (let i = 0; i < Math.min(olMatches.length, 2); i++) {
    const olContent = olMatches[i][1]
    console.log(`\n=== ORDERED LIST ${i + 1} (first 300 chars) ===`)
    console.log(olContent.substring(0, 300))
    
    // Find all list items that contain questions
    const liMatches = [...olContent.matchAll(/<li>(.*?)<\/li>/gs)]
    console.log(`\nFound ${liMatches.length} list items in this ol`)
    
    for (let j = 0; j < Math.min(liMatches.length, 3); j++) {
      const liContent = liMatches[j][1]
      console.log(`\n--- List Item ${j + 1} ---`)
      console.log(liContent.substring(0, 200))
      
      // Check if this list item contains a question (has nested ol)
      if (liContent.includes('<ol>')) {
        console.log('✅ This list item has nested ol (question)')
        
        // Extract question text (everything before the first <ol>)
        const questionText = liContent.split('<ol>')[0].replace(/<[^>]*>/g, '').trim()
        console.log('Question text:', questionText)
        
        // Extract options from the nested ol
        const nestedOlMatch = liContent.match(/<ol>(.*?)<\/ol>/s)
        if (nestedOlMatch) {
          const nestedOlContent = nestedOlMatch[1]
          console.log('Nested ol content:', nestedOlContent.substring(0, 200))
          
          const optionMatches = [...nestedOlContent.matchAll(/<li>(.*?)<\/li>/gs)]
          console.log(`Found ${optionMatches.length} options`)
          
          for (let k = 0; k < optionMatches.length; k++) {
            const optionText = optionMatches[k][1].replace(/<[^>]*>/g, '').trim()
            console.log(`Option ${k + 1}: ${optionText}`)
          }
        }
      } else {
        console.log('❌ This list item does not have nested ol')
      }
    }
  }
  
  return []
}

async function debugQuizParser() {
  try {
    console.log('📖 Processing QUIZes.docx file for debugging...')
    
    const result = await mammoth.convertToHtml({ path: 'course-content/QUIZes.docx' })
    const html = result.value
    
    console.log(`✅ DOCX converted to HTML (${html.length} characters)`)
    
    // Parse questions
    parseQuizQuestions(html)
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Run the debug script
debugQuizParser()
