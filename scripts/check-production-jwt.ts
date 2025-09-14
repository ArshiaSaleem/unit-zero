import { PrismaClient } from '@prisma/client'

// Production database (PostgreSQL from Vercel)
const productionPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.PRODUCTION_DATABASE_URL || 'postgres://c2012740f591e59ba3fcee86319ef1dc7c74e4f71411b52a90c2fe9e04fc7faa:sk_Yg9DcqhWhsTT-NeDw0V2z@db.prisma.io:5432/postgres?sslmode=require'
    }
  }
})

async function checkProductionJWT() {
  try {
    console.log('🔍 Checking production JWT configuration...')
    
    // Check if we can connect to production
    await productionPrisma.$connect()
    console.log('✅ Connected to production database')
    
    // Check admin user
    const adminUser = await productionPrisma.user.findUnique({
      where: { email: 'admin@unitzero.com' },
      select: { id: true, email: true, role: true, password: true }
    })
    
    if (!adminUser) {
      console.log('❌ Admin user not found in production')
      return
    }
    
    console.log('✅ Admin user found in production:', adminUser.email)
    console.log('📊 User ID:', adminUser.id)
    console.log('👤 Role:', adminUser.role)
    
    // Test different JWT secrets that might be used
    const possibleSecrets = [
      'your-super-secret-jwt-key-change-this-in-production',
      'unitzero-super-secret-key-2024',
      'jwt-secret-key-for-unitzero',
      'production-jwt-secret-key',
      process.env.JWT_SECRET
    ]
    
    console.log('\n🔑 Testing different JWT secrets...')
    
    for (const secret of possibleSecrets) {
      if (!secret) continue
      
      try {
        const jwt = require('jsonwebtoken')
        const testPayload = { id: adminUser.id, email: adminUser.email, role: adminUser.role }
        const token = jwt.sign(testPayload, secret)
        const decoded = jwt.verify(token, secret)
        
        console.log(`✅ Secret "${secret.substring(0, 20)}..." works`)
        console.log(`   Token: ${token.substring(0, 50)}...`)
      } catch (error) {
        console.log(`❌ Secret "${secret.substring(0, 20)}..." failed`)
      }
    }
    
    console.log('\n🌐 Production URLs to test:')
    console.log('   Main: https://unit-zero.nl')
    console.log('   Vercel: https://unit-zero-eib0yax45-arshia-saleems-projects.vercel.app')
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await productionPrisma.$disconnect()
  }
}

checkProductionJWT()
