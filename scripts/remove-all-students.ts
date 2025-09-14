import { prisma } from '../src/lib/prisma'

async function removeAllStudents() {
  try {
    console.log('🧹 Removing all student users...')
    
    // First, let's see how many students we have
    const studentCount = await prisma.user.count({
      where: { role: 'STUDENT' }
    })
    
    console.log(`📊 Found ${studentCount} students to remove`)
    
    if (studentCount === 0) {
      console.log('✅ No students found to remove')
      return
    }
    
    // Delete all students
    const result = await prisma.user.deleteMany({
      where: { role: 'STUDENT' }
    })
    
    console.log(`✅ Successfully removed ${result.count} students`)
    
    // Verify removal
    const remainingStudents = await prisma.user.count({
      where: { role: 'STUDENT' }
    })
    
    console.log(`📊 Remaining students: ${remainingStudents}`)
    
    if (remainingStudents === 0) {
      console.log('🎉 All students have been successfully removed!')
    } else {
      console.log('⚠️  Some students may still remain')
    }
    
  } catch (error) {
    console.error('❌ Error removing students:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

removeAllStudents()
