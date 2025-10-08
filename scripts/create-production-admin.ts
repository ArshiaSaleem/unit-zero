import { prisma } from '../src/lib/prisma'
import { hashPassword } from '../src/lib/auth'

async function createProductionAdmin() {
  console.log('🔧 Creating production admin user...\n')
  
  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@unitzero.com' }
    })
    
    if (existingAdmin) {
      console.log('Admin user already exists:')
      console.log(`  Email: ${existingAdmin.email}`)
      console.log(`  Role: ${existingAdmin.role}`)
      console.log(`  Active: ${existingAdmin.isActive}`)
      console.log(`  Password: ${existingAdmin.password.substring(0, 20)}...`)
      
      // Reset password to admin123
      const hashedPassword = await hashPassword('admin123')
      await prisma.user.update({
        where: { email: 'admin@unitzero.com' },
        data: { 
          password: hashedPassword,
          isActive: true,
          role: 'ADMIN'
        }
      })
      console.log('✅ Admin password reset to: admin123')
      
    } else {
      // Create new admin user
      const hashedPassword = await hashPassword('admin123')
      const admin = await prisma.user.create({
        data: {
          email: 'admin@unitzero.com',
          password: hashedPassword,
          role: 'ADMIN',
          firstName: 'Admin',
          lastName: 'User',
          isActive: true,
          mustChangePassword: false
        }
      })
      console.log('✅ Admin user created:')
      console.log(`  Email: ${admin.email}`)
      console.log(`  Password: admin123`)
      console.log(`  Role: ${admin.role}`)
    }
    
    // Also ensure we have a test teacher
    const existingTeacher = await prisma.user.findUnique({
      where: { email: 'teacher@unitzero.com' }
    })
    
    if (!existingTeacher) {
      const hashedPassword = await hashPassword('teacher123')
      const teacher = await prisma.user.create({
        data: {
          email: 'teacher@unitzero.com',
          password: hashedPassword,
          role: 'TEACHER',
          firstName: 'Test',
          lastName: 'Teacher',
          isActive: true,
          mustChangePassword: false
        }
      })
      console.log('✅ Test teacher created:')
      console.log(`  Email: ${teacher.email}`)
      console.log(`  Password: teacher123`)
    }
    
    // Test the created admin
    console.log('\n🧪 Testing admin login...')
    const { authenticateUser } = await import('../src/lib/auth')
    const result = await authenticateUser('admin@unitzero.com', 'admin123')
    
    if (result) {
      console.log('✅ Admin authentication successful!')
      console.log(`   Role: ${result.role}`)
      console.log(`   ID: ${result.id}`)
    } else {
      console.log('❌ Admin authentication failed!')
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createProductionAdmin()
