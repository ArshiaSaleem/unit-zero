import { prisma } from '../src/lib/prisma'
import * as XLSX from 'xlsx'
import bcrypt from 'bcryptjs'

interface StudentData {
  firstName: string
  lastName: string
  email: string
  tabName: string
}

async function cleanupExistingStudents() {
  try {
    console.log('🧹 Cleaning up existing student data...')
    
    // Delete all existing students
    const deletedStudents = await prisma.user.deleteMany({
      where: { role: 'STUDENT' }
    })
    
    console.log(`✅ Deleted ${deletedStudents.count} existing students`)
  } catch (error) {
    console.error('❌ Error cleaning up students:', error)
    throw error
  }
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
        
        // Check if row has data (at least first name and last name)
        if (row && row.length >= 2 && row[0] && row[1]) {
          let firstName = String(row[0]).trim()
          let lastName = String(row[1]).trim()
          let email = ''
          
          // Look for email in different columns (try column 2, 3, 4, etc.)
          for (let col = 2; col < row.length; col++) {
            if (row[col] && String(row[col]).includes('@')) {
              email = String(row[col]).trim()
              break
            }
          }
          
          // If no email found, generate one
          if (!email) {
            email = `${firstName.toLowerCase()}.${lastName.toLowerCase().replace(/\s+/g, '')}@student.unitzero.com`
          }
          
          // Handle middle names - combine with last name
          // Check if there are additional name parts that aren't emails
          for (let col = 2; col < row.length; col++) {
            if (row[col] && !String(row[col]).includes('@') && !String(row[col]).match(/^\d+$/)) {
              const additionalName = String(row[col]).trim()
              if (additionalName && additionalName !== firstName && additionalName !== lastName) {
                lastName = `${lastName} ${additionalName}`
              }
            }
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
    const excelPath = process.argv[2] || 'user-names/List of Students - Zadkine.xlsx'
    
    console.log('🚀 Starting student cleanup and re-registration...')
    console.log(`📁 Excel file: ${excelPath}`)
    
    // Clean up existing students
    await cleanupExistingStudents()
    
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
    
    console.log('\n🎉 Student cleanup and re-registration completed!')
    console.log('💡 Students can now login with their email and password: student123')
    console.log('🔐 They will be prompted to change their password on first login')
    
  } catch (error) {
    console.error('❌ Script failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
