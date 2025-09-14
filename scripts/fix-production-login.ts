import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

// Production database (PostgreSQL from Vercel)
const productionPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.PRODUCTION_DATABASE_URL || 'postgres://c2012740f591e59ba3fcee86319ef1dc7c74e4f71411b52a90c2fe9e04fc7faa:sk_Yg9DcqhWhsTT-NeDw0V2z@db.prisma.io:5432/postgres?sslmode=require'
    }
  }
})

async function fixProductionLogin() {
  try {
    console.log('🔧 Fixing production login issues...')
    
    // Check if admin user exists
    const adminUser = await productionPrisma.user.findUnique({
      where: { email: 'admin@unitzero.com' }
    })
    
    if (!adminUser) {
      console.log('❌ Admin user not found. Creating admin user...')
      
      // Create admin user with correct password
      const hashedPassword = await bcrypt.hash('admin123', 10)
      
      await productionPrisma.user.create({
        data: {
          email: 'admin@unitzero.com',
          password: hashedPassword,
          firstName: 'Admin',
          lastName: 'User',
          role: 'ADMIN',
          mustChangePassword: false
        }
      })
      
      console.log('✅ Admin user created successfully')
    } else {
      console.log('✅ Admin user exists')
      
      // Update password to ensure it's correct
      const hashedPassword = await bcrypt.hash('admin123', 10)
      await productionPrisma.user.update({
        where: { email: 'admin@unitzero.com' },
        data: { password: hashedPassword }
      })
      
      console.log('✅ Admin password updated')
    }
    
    // Check if teacher user exists
    const teacherUser = await productionPrisma.user.findUnique({
      where: { email: 'teacher@example.com' }
    })
    
    if (!teacherUser) {
      console.log('❌ Teacher user not found. Creating teacher user...')
      
      const hashedPassword = await bcrypt.hash('teacher123', 10)
      
      await productionPrisma.user.create({
        data: {
          email: 'teacher@example.com',
          password: hashedPassword,
          firstName: 'Teacher',
          lastName: 'User',
          role: 'TEACHER',
          mustChangePassword: false
        }
      })
      
      console.log('✅ Teacher user created successfully')
    } else {
      console.log('✅ Teacher user exists')
      
      const hashedPassword = await bcrypt.hash('teacher123', 10)
      await productionPrisma.user.update({
        where: { email: 'teacher@example.com' },
        data: { password: hashedPassword }
      })
      
      console.log('✅ Teacher password updated')
    }
    
    // Check if student user exists
    const studentUser = await productionPrisma.user.findUnique({
      where: { email: 'student@example.com' }
    })
    
    if (!studentUser) {
      console.log('❌ Student user not found. Creating student user...')
      
      const hashedPassword = await bcrypt.hash('student123', 10)
      
      await productionPrisma.user.create({
        data: {
          email: 'student@example.com',
          password: hashedPassword,
          firstName: 'Student',
          lastName: 'User',
          role: 'STUDENT',
          mustChangePassword: false
        }
      })
      
      console.log('✅ Student user created successfully')
    } else {
      console.log('✅ Student user exists')
      
      const hashedPassword = await bcrypt.hash('student123', 10)
      await productionPrisma.user.update({
        where: { email: 'student@example.com' },
        data: { password: hashedPassword }
      })
      
      console.log('✅ Student password updated')
    }
    
    // Check total users
    const userCount = await productionPrisma.user.count()
    console.log(`📊 Total users in production database: ${userCount}`)
    
    console.log('🎉 Production login fix completed!')
    console.log('🌐 You can now test login at https://unit-zero.nl')
    console.log('📧 Test credentials:')
    console.log('   Admin: admin@unitzero.com / admin123')
    console.log('   Teacher: teacher@example.com / teacher123')
    console.log('   Student: student@example.com / student123')
    
  } catch (error) {
    console.error('❌ Error fixing production login:', error)
  } finally {
    await productionPrisma.$disconnect()
  }
}

fixProductionLogin()
