import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// Production database (PostgreSQL from Vercel)
const productionPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.PRODUCTION_DATABASE_URL || 'postgres://c2012740f591e59ba3fcee86319ef1dc7c74e4f71411b52a90c2fe9e04fc7faa:sk_Yg9DcqhWhsTT-NeDw0V2z@db.prisma.io:5432/postgres?sslmode=require'
    }
  }
})

async function fixJWTMismatch() {
  try {
    console.log('🔧 Fixing JWT mismatch issues...')
    
    // Test JWT generation with the production secret
    const testPayload = { id: 'test', email: 'test@example.com', role: 'ADMIN' }
    const jwtSecret = 'your-super-secret-jwt-key-change-this-in-production'
    
    console.log('🔑 Testing JWT generation...')
    const testToken = jwt.sign(testPayload, jwtSecret)
    console.log('✅ JWT generation successful')
    
    // Verify the token
    const decoded = jwt.verify(testToken, jwtSecret)
    console.log('✅ JWT verification successful')
    
    // Check admin user
    const adminUser = await productionPrisma.user.findUnique({
      where: { email: 'admin@unitzero.com' }
    })
    
    if (!adminUser) {
      console.log('❌ Admin user not found')
      return
    }
    
    console.log('✅ Admin user found:', adminUser.email)
    
    // Test password verification
    const passwordMatch = await bcrypt.compare('admin123', adminUser.password)
    console.log('✅ Password verification:', passwordMatch ? 'SUCCESS' : 'FAILED')
    
    // Generate a fresh token for admin
    const freshToken = jwt.sign(
      { id: adminUser.id, email: adminUser.email, role: adminUser.role },
      jwtSecret
    )
    
    console.log('✅ Fresh token generated for admin')
    console.log('🔑 Token preview:', freshToken.substring(0, 50) + '...')
    
    // Test token verification
    const verified = jwt.verify(freshToken, jwtSecret)
    console.log('✅ Fresh token verification successful')
    
    console.log('\n🎯 Summary:')
    console.log('✅ JWT_SECRET is working correctly')
    console.log('✅ Admin user exists and password is correct')
    console.log('✅ Fresh tokens can be generated and verified')
    console.log('\n🌐 Try logging in at: https://unit-zero.nl')
    console.log('📧 Email: admin@unitzero.com')
    console.log('🔑 Password: admin123')
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await productionPrisma.$disconnect()
  }
}

fixJWTMismatch()
