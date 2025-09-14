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

async function debugProductionLogin() {
  try {
    console.log('🔍 Debugging production login issues...')
    
    // Check all users in the database
    const allUsers = await productionPrisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        password: true,
        createdAt: true
      },
      orderBy: { createdAt: 'asc' }
    })
    
    console.log(`📊 Total users found: ${allUsers.length}`)
    console.log('\n👥 All users in database:')
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (${user.role}) - Created: ${user.createdAt.toISOString()}`)
    })
    
    // Check specifically for admin user
    const adminUser = await productionPrisma.user.findUnique({
      where: { email: 'admin@unitzero.com' }
    })
    
    if (adminUser) {
      console.log('\n✅ Admin user found:')
      console.log(`   ID: ${adminUser.id}`)
      console.log(`   Email: ${adminUser.email}`)
      console.log(`   Role: ${adminUser.role}`)
      console.log(`   Password hash: ${adminUser.password.substring(0, 20)}...`)
      
      // Test password verification
      const testPassword = 'admin123'
      const isPasswordValid = await bcrypt.compare(testPassword, adminUser.password)
      console.log(`   Password '${testPassword}' valid: ${isPasswordValid}`)
      
      if (!isPasswordValid) {
        console.log('❌ Password verification failed. Updating password...')
        const newHashedPassword = await bcrypt.hash(testPassword, 10)
        await productionPrisma.user.update({
          where: { email: 'admin@unitzero.com' },
          data: { password: newHashedPassword }
        })
        console.log('✅ Password updated successfully')
      }
    } else {
      console.log('\n❌ Admin user not found. Creating admin user...')
      const hashedPassword = await bcrypt.hash('admin123', 10)
      
      const newAdmin = await productionPrisma.user.create({
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
      console.log(`   ID: ${newAdmin.id}`)
    }
    
    // Check for any users with ADMIN role
    const adminUsers = await productionPrisma.user.findMany({
      where: { role: 'ADMIN' }
    })
    
    console.log(`\n👑 Total ADMIN users: ${adminUsers.length}`)
    adminUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} - ID: ${user.id}`)
    })
    
    // Test login with different passwords
    console.log('\n🔐 Testing different passwords for admin@unitzero.com:')
    const testPasswords = ['admin123', 'admin', 'password', '123456', 'unitzero']
    
    for (const password of testPasswords) {
      if (adminUser) {
        const isValid = await bcrypt.compare(password, adminUser.password)
        console.log(`   '${password}': ${isValid ? '✅ VALID' : '❌ Invalid'}`)
      }
    }
    
    console.log('\n🎉 Debug completed!')
    console.log('🌐 Try logging in at https://unit-zero.nl with:')
    console.log('   Email: admin@unitzero.com')
    console.log('   Password: admin123')
    
  } catch (error) {
    console.error('❌ Error debugging production login:', error)
  } finally {
    await productionPrisma.$disconnect()
  }
}

debugProductionLogin()
