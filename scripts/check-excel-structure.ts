import * as XLSX from 'xlsx'

async function checkExcelStructure() {
  try {
    console.log('🔍 Checking updated Excel file structure...')
    
    const filePath = 'user-names/Student-Users.xlsx'
    const workbook = XLSX.readFile(filePath)
    
    console.log(`📊 Total sheets: ${workbook.SheetNames.length}`)
    console.log(`📋 Sheet names: ${workbook.SheetNames.join(', ')}`)
    
    let totalStudents = 0
    
    workbook.SheetNames.forEach((sheetName, index) => {
      const worksheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
      
      console.log(`\n📄 Sheet ${index + 1}: "${sheetName}"`)
      console.log(`   Rows: ${jsonData.length}`)
      
      if (jsonData.length > 0) {
        console.log(`   Headers: ${jsonData[0]}`)
        
        // Count students (skip header row) - proper structure
        let studentCount = 0
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i] as any[]
          if (row && row.length >= 4) {
            // Check for valid student data: first name (A), last name (C), and email (D)
            const firstName = row[0] && String(row[0]).trim() !== ''
            const lastName = row[2] && String(row[2]).trim() !== ''
            const email = row[3] && String(row[3]).includes('@')
            
            if (firstName && lastName && email) {
              studentCount++
            }
          }
        }
        
        // Also check for empty rows that might contain data
        let totalRows = 0
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i] as any[]
          if (row && row.length > 0) {
            totalRows++
          }
        }
        
        console.log(`   Students: ${studentCount}`)
        console.log(`   Total non-empty rows: ${totalRows}`)
        totalStudents += studentCount
        
        // Show first few students as preview
        console.log(`   Preview:`)
        for (let i = 1; i <= Math.min(3, studentCount); i++) {
          const row = jsonData[i] as any[]
          if (row && row.length >= 2) {
            console.log(`     ${i}. ${row[0]} ${row[1]} ${row[2] || ''}`)
          }
        }
        if (studentCount > 3) {
          console.log(`     ... and ${studentCount - 3} more`)
        }
      }
    })
    
    console.log(`\n🎯 Total students across all sheets: ${totalStudents}`)
    
  } catch (error) {
    console.error('❌ Error checking Excel structure:', error)
  }
}

checkExcelStructure()
