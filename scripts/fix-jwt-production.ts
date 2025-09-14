import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

// Production database (PostgreSQL from Vercel)
const productionPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.PRODUCTION_DATABASE_URL || 'postgres://c2012740f591e59ba3fcee86319ef1dc7c74e4f71411b52a90c2fe9e04fc7faa:sk_Yg9DcqhWhsTT-NeDw0V2z@db.prisma.io:5432/postgres?sslmode=require'
    }
  }
})

async function fixJWTProduction() {
  try {
    console.log('🔧 Fixing JWT production issues...')
    
    // Test JWT generation with different secrets
    const testPayload = { id: 'test', email: 'test@example.com', role: 'ADMIN' }
    
    const secrets = [
      'your-super-secret-jwt-key-change-this-in-production',
      'unitzero-super-secret-key-2024',
      'jwt-secret-key-for-unitzero',
      'production-jwt-secret-key'
    ]
    
    console.log('🔑 Testing JWT secrets:')
    for (const secret of secrets) {
      try {
        const token = jwt.sign(testPayload, secret, { expiresIn: '24h' })
        const decoded = jwt.verify(token, secret)
        console.log(`   ✅ Secret works: ${secret.substring(0, 20)}...`)
      } catch (error) {
        console.log(`   ❌ Secret failed: ${secret.substring(0, 20)}...`)
      }
    }
    
    // Check if admin user exists and create a test token
    const adminUser = await productionPrisma.user.findUnique({
      where: { email: 'admin@unitzero.com' }
    })
    
    if (adminUser) {
      console.log('\n👤 Admin user found, creating test token...')
      
      // Use the most likely secret
      const likelySecret = 'your-super-secret-jwt-key-change-this-in-production'
      const testToken = jwt.sign(
        { 
          id: adminUser.id, 
          email: adminUser.email, 
          role: adminUser.role 
        }, 
        likelySecret, 
        { expiresIn: '24h' }
      )
      
      console.log('✅ Test token created successfully')
      console.log(`   Token: ${testToken.substring(0, 50)}...`)
      
      // Verify the token
      try {
        const decoded = jwt.verify(testToken, likelySecret) as any
        console.log('✅ Token verification successful')
        console.log(`   Decoded: ${JSON.stringify(decoded)}`)
      } catch (error) {
        console.log('❌ Token verification failed:', error)
      }
    }
    
    console.log('\n🎯 Next steps:')
    console.log('1. Check your Vercel environment variables')
    console.log('2. Make sure JWT_SECRET is set correctly')
    console.log('3. Try clearing browser cache/cookies')
    console.log('4. Test login again at https://unit-zero.nl')
    
  } catch (error) {
    console.error('❌ Error fixing JWT production:', error)
  } finally {
    await productionPrisma.$disconnect()
  }
}

fixJWTProduction()
