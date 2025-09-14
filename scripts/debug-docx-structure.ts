import * as fs from 'fs'
import * as mammoth from 'mammoth'

async function debugDocxStructure() {
  try {
    console.log('🔍 Debugging DOCX structure...')
    
    const result = await mammoth.convertToHtml({ path: 'course-content/QUIZes.docx' })
    const html = result.value
    
    // Save HTML to file for inspection
    fs.writeFileSync('debug-quiz-html.html', html)
    console.log('✅ HTML saved to debug-quiz-html.html')
    
    // Look for specific patterns
    console.log('\n📊 Analyzing structure...')
    
    // Count weeks
    const weekPattern = /Week\s+(\d+)/gi
    const weekMatches = [...html.matchAll(weekPattern)]
    console.log(`Found ${weekMatches.length} week patterns`)
    
    // Count questions with numbers
    const questionPattern = /(\d+\.\s*[^?]*\?)/g
    const questionMatches = [...html.matchAll(questionPattern)]
    console.log(`Found ${questionMatches.length} numbered questions`)
    
    // Count ordered lists
    const olPattern = /<ol>(.*?)<\/ol>/gs
    const olMatches = [...html.matchAll(olPattern)]
    console.log(`Found ${olMatches.length} ordered lists`)
    
    // Look for checkmarks
    const checkmarkPattern = /✅/g
    const checkmarkMatches = [...html.matchAll(checkmarkPattern)]
    console.log(`Found ${checkmarkMatches.length} checkmarks`)
    
    // Analyze Week 1 specifically
    const week1Match = html.match(/Week\s+1.*?(?=Week\s+2|$)/is)
    if (week1Match) {
      const week1Content = week1Match[0]
      console.log(`\n📝 Week 1 content length: ${week1Content.length} characters`)
      
      // Count questions in Week 1
      const week1Questions = [...week1Content.matchAll(questionPattern)]
      console.log(`Week 1 numbered questions: ${week1Questions.length}`)
      
      // Count ordered lists in Week 1
      const week1OLs = [...week1Content.matchAll(olPattern)]
      console.log(`Week 1 ordered lists: ${week1OLs.length}`)
      
      // Count checkmarks in Week 1
      const week1Checkmarks = [...week1Content.matchAll(checkmarkPattern)]
      console.log(`Week 1 checkmarks: ${week1Checkmarks.length}`)
      
      // Show first few questions
      console.log('\n🔍 First few questions in Week 1:')
      for (let i = 0; i < Math.min(5, week1Questions.length); i++) {
        console.log(`  ${i + 1}. ${week1Questions[i][1].substring(0, 100)}...`)
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

debugDocxStructure()
