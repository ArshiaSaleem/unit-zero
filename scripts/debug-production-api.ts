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

async function debugProductionAPI() {
  try {
    console.log('🔍 Debugging Production API...')
    
    // Test database connection
    await productionPrisma.$connect()
    console.log('✅ Database connected')
    
    // Test admin user
    const adminUser = await productionPrisma.user.findUnique({
      where: { email: 'admin@unitzero.com' }
    })
    
    if (!adminUser) {
      console.log('❌ Admin user not found')
      return
    }
    
    console.log('✅ Admin user found:', adminUser.email)
    
    // Test password
    const passwordMatch = await bcrypt.compare('admin123', adminUser.password)
    console.log('🔑 Password match:', passwordMatch)
    
    // Test JWT generation
    const jwtSecret = 'your-super-secret-jwt-key-change-this-in-production'
    const token = jwt.sign(
      { id: adminUser.id, email: adminUser.email, role: adminUser.role },
      jwtSecret
    )
    
    console.log('✅ JWT token generated')
    console.log('🔑 Token:', token.substring(0, 50) + '...')
    
    // Test JWT verification
    const decoded = jwt.verify(token, jwtSecret)
    console.log('✅ JWT verification successful')
    console.log('📊 Decoded:', decoded)
    
    // Test the exact same logic as the API
    console.log('\n🧪 Testing API Logic...')
    
    // Simulate the login API
    const email = 'admin@unitzero.com'
    const password = 'admin123'
    
    const user = await productionPrisma.user.findUnique({
      where: { email }
    })
    
    if (!user) {
      console.log('❌ User not found in API simulation')
      return
    }
    
    console.log('✅ User found in API simulation')
    
    const isValidPassword = await bcrypt.compare(password, user.password)
    console.log('🔑 Password validation:', isValidPassword)
    
    if (!isValidPassword) {
      console.log('❌ Invalid password in API simulation')
      return
    }
    
    const apiToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      jwtSecret
    )
    
    console.log('✅ API token generated')
    console.log('🔑 API Token:', apiToken.substring(0, 50) + '...')
    
    // Test token verification
    const apiDecoded = jwt.verify(apiToken, jwtSecret)
    console.log('✅ API token verification successful')
    
    console.log('\n🎯 DIAGNOSIS:')
    console.log('✅ Database connection works')
    console.log('✅ User exists and password is correct')
    console.log('✅ JWT generation works')
    console.log('✅ JWT verification works')
    console.log('✅ API logic simulation works')
    
    console.log('\n🔧 POSSIBLE ISSUES:')
    console.log('1. Environment variable mismatch in production')
    console.log('2. Different JWT secret in production')
    console.log('3. Database connection issue in production')
    console.log('4. Code deployment issue')
    
    console.log('\n🌐 TESTING PRODUCTION:')
    console.log('Try these URLs:')
    console.log('- https://unit-zero.nl')
    console.log('- https://unit-zero-beta.vercel.app')
    console.log('- https://unit-zero-git-main-arshia-saleems-projects.vercel.app')
    
    // Create a simple test
    const testData = {
      email: 'admin@unitzero.com',
      password: 'admin123',
      expectedToken: apiToken.substring(0, 50) + '...',
      jwtSecret: jwtSecret.substring(0, 20) + '...',
      userId: user.id
    }
    
    console.log('\n📋 TEST DATA:')
    console.log(JSON.stringify(testData, null, 2))
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await productionPrisma.$disconnect()
  }
}

debugProductionAPI()
