import * as XLSX from 'xlsx'
import { prisma } from '../src/lib/prisma'
import bcrypt from 'bcryptjs'

interface StudentData {
  firstName: string
  lastName: string
  email: string
  tabName: string
}

async function readExcelFile(filePath: string): Promise<StudentData[]> {
  try {
    console.log('📖 Reading Excel file...')
    const workbook = XLSX.readFile(filePath)
    const students: StudentData[] = []
    
    // Process each sheet (tab)
    workbook.SheetNames.forEach((sheetName) => {
      console.log(`📋 Processing sheet: ${sheetName}`)
      const worksheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
      
      // Skip header row and process data
      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i] as any[]
        
        // Check if row has data (Column A: First Name, Column C: Last Name, Column D: Email)
        if (row && row.length >= 4 && row[0] && row[2] && row[3]) {
          let firstName = String(row[0]).trim()
          let lastName = String(row[2]).trim()
          let email = String(row[3]).trim()
          
          // Handle middle names from Column B - combine with last name
          if (row[1] && String(row[1]).trim() !== '') {
            const middleName = String(row[1]).trim()
            lastName = `${middleName} ${lastName}`
          }
          
          // Clean up names
          firstName = firstName.replace(/\s+/g, ' ').trim()
          lastName = lastName.replace(/\s+/g, ' ').trim()
          
          // Skip if names are empty or contain email-like content
          if (firstName && lastName && !firstName.includes('@') && !lastName.includes('@')) {
            students.push({
              firstName,
              lastName,
              email,
              tabName: sheetName
            })
          }
        }
      }
    })
    
    console.log(`✅ Found ${students.length} students across ${workbook.SheetNames.length} sheets`)
    return students
  } catch (error) {
    console.error('❌ Error reading Excel file:', error)
    throw error
  }
}

async function registerStudents(students: StudentData[]): Promise<void> {
  try {
    console.log('🔄 Registering students...')
    
    const defaultPassword = process.env.DEFAULT_STUDENT_PASSWORD || 'student123'
    const hashedPassword = await bcrypt.hash(defaultPassword, 10)
    
    let successCount = 0
    let errorCount = 0
    
    for (const student of students) {
      try {
        // Check if student already exists
        const existingStudent = await prisma.user.findUnique({
          where: { email: student.email }
        })
        
        if (existingStudent) {
          console.log(`⚠️  Student already exists: ${student.email}`)
          continue
        }
        
        // Create new student
        await prisma.user.create({
          data: {
            email: student.email,
            password: hashedPassword,
            firstName: student.firstName,
            lastName: student.lastName,
            role: 'STUDENT',
            isActive: true,
            mustChangePassword: true
          }
        })
        
        console.log(`✅ Registered: ${student.firstName} ${student.lastName} (${student.email})`)
        successCount++
      } catch (error) {
        console.error(`❌ Error registering ${student.email}:`, error)
        errorCount++
      }
    }
    
    console.log(`\n📊 Registration Summary:`)
    console.log(`✅ Successfully registered: ${successCount} students`)
    console.log(`❌ Errors: ${errorCount} students`)
    console.log(`📋 Total processed: ${students.length} students`)
  } catch (error) {
    console.error('❌ Error registering students:', error)
    throw error
  }
}

async function main() {
  try {
    const excelPath = process.argv[2] || 'user-names/Student-Users.xlsx'
    
    console.log('🚀 Starting student registration from Excel...')
    console.log(`📁 Excel file: ${excelPath}`)
    
    // Read Excel file
    const students = await readExcelFile(excelPath)
    
    if (students.length === 0) {
      console.log('⚠️  No students found in Excel file')
      return
    }
    
    // Show preview of first few students
    console.log('\n📋 Preview of students to be registered:')
    students.slice(0, 5).forEach((student, index) => {
      console.log(`${index + 1}. ${student.firstName} ${student.lastName} (${student.email}) - Tab: ${student.tabName}`)
    })
    
    if (students.length > 5) {
      console.log(`... and ${students.length - 5} more students`)
    }
    
    // Register students
    await registerStudents(students)
    
    console.log('\n🎉 Student registration completed!')
    console.log('💡 Students can now login with their email and password: student123')
    console.log('🔐 They will be prompted to change their password on first login')
    
  } catch (error) {
    console.error('❌ Script failed:', error)
    process.exit(1)
  }
}

main()
