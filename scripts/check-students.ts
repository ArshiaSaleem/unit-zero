import { prisma } from '../src/lib/prisma'

async function checkStudents() {
  try {
    console.log('🔍 Checking students in database...')
    
    const students = await prisma.user.findMany({
      where: { role: 'STUDENT' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true,
        mustChangePassword: true,
        createdAt: true
      }
    })
    
    console.log(`📊 Found ${students.length} students in database:`)
    
    students.forEach((student, index) => {
      console.log(`${index + 1}. ${student.firstName} ${student.lastName} (${student.email}) - Active: ${student.isActive}`)
    })
    
    if (students.length === 0) {
      console.log('⚠️  No students found in database')
    }
    
  } catch (error) {
    console.error('❌ Error checking students:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkStudents()
