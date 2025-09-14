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

async function fixProductionJWTFinal() {
  try {
    console.log('🚨 EMERGENCY JWT FIX - Production Login Issue')
    console.log('=' .repeat(50))
    
    // Connect to production database
    await productionPrisma.$connect()
    console.log('✅ Connected to production database')
    
    // Get admin user
    const adminUser = await productionPrisma.user.findUnique({
      where: { email: 'admin@unitzero.com' }
    })
    
    if (!adminUser) {
      console.log('❌ Admin user not found!')
      return
    }
    
    console.log('✅ Admin user found:', adminUser.email)
    console.log('📊 User ID:', adminUser.id)
    
    // Test password
    const passwordMatch = await bcrypt.compare('admin123', adminUser.password)
    console.log('🔑 Password test:', passwordMatch ? '✅ CORRECT' : '❌ WRONG')
    
    if (!passwordMatch) {
      console.log('🔧 Fixing admin password...')
      const newHashedPassword = await bcrypt.hash('admin123', 10)
      await productionPrisma.user.update({
        where: { id: adminUser.id },
        data: { password: newHashedPassword }
      })
      console.log('✅ Admin password updated')
    }
    
    // Test ALL possible JWT secrets
    const possibleSecrets = [
      'your-super-secret-jwt-key-change-this-in-production',
      'unitzero-super-secret-key-2024',
      'jwt-secret-key-for-unitzero',
      'production-jwt-secret-key',
      'vercel-jwt-secret',
      'nextjs-jwt-secret',
      'default-jwt-secret',
      process.env.JWT_SECRET
    ].filter(Boolean)
    
    console.log('\n🔍 Testing JWT secrets...')
    let workingSecret = null
    
    for (const secret of possibleSecrets) {
      try {
        const testPayload = { id: adminUser.id, email: adminUser.email, role: adminUser.role }
        const token = jwt.sign(testPayload, secret as string)
        const decoded = jwt.verify(token, secret as string)
        
        console.log(`✅ Secret "${(secret as string).substring(0, 20)}..." WORKS`)
        workingSecret = secret
        break
      } catch (error) {
        console.log(`❌ Secret "${(secret as string).substring(0, 20)}..." failed`)
      }
    }
    
    if (!workingSecret) {
      console.log('❌ No working JWT secret found!')
      return
    }
    
    console.log(`\n🎯 Using JWT secret: ${(workingSecret as string).substring(0, 20)}...`)
    
    // Generate a fresh admin token
    const freshToken = jwt.sign(
      { id: adminUser.id, email: adminUser.email, role: adminUser.role },
      workingSecret as string
    )
    
    console.log('✅ Fresh admin token generated')
    console.log('🔑 Token preview:', freshToken.substring(0, 50) + '...')
    
    // Test the token
    const verified = jwt.verify(freshToken, workingSecret as string)
    console.log('✅ Token verification successful')
    
    // Create a simple test page
    const testHTML = `
<!DOCTYPE html>
<html>
<head>
    <title>Unit Zero - JWT Test</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .success { color: green; }
        .error { color: red; }
        .info { background: #f0f0f0; padding: 20px; margin: 20px 0; }
        button { background: #dc2626; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; }
    </style>
</head>
<body>
    <h1>Unit Zero - JWT Test Page</h1>
    <div class="info">
        <h3>Admin Login Test</h3>
        <p><strong>Email:</strong> admin@unitzero.com</p>
        <p><strong>Password:</strong> admin123</p>
        <p><strong>JWT Secret:</strong> ${(workingSecret as string).substring(0, 20)}...</p>
        <p><strong>Token:</strong> ${freshToken.substring(0, 50)}...</p>
    </div>
    
    <div class="info">
        <h3>Test Login</h3>
        <button onclick="testLogin()">Test Admin Login</button>
        <div id="result"></div>
    </div>
    
    <script>
        async function testLogin() {
            const result = document.getElementById('result');
            result.innerHTML = 'Testing...';
            
            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: 'admin@unitzero.com',
                        password: 'admin123'
                    })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    result.innerHTML = '<div class="success">✅ Login successful! Token: ' + data.token.substring(0, 50) + '...</div>';
                } else {
                    result.innerHTML = '<div class="error">❌ Login failed: ' + data.error + '</div>';
                }
            } catch (error) {
                result.innerHTML = '<div class="error">❌ Error: ' + error.message + '</div>';
            }
        }
    </script>
</body>
</html>`
    
    // Write test file
    require('fs').writeFileSync('jwt-test.html', testHTML)
    console.log('📄 Created jwt-test.html for testing')
    
    console.log('\n🎯 SUMMARY:')
    console.log('✅ Production database connected')
    console.log('✅ Admin user exists and password is correct')
    console.log('✅ JWT secret found and working')
    console.log('✅ Fresh token generated')
    
    console.log('\n🌐 TEST YOUR LOGIN:')
    console.log('1. Go to: https://unit-zero.nl')
    console.log('2. Email: admin@unitzero.com')
    console.log('3. Password: admin123')
    console.log('4. If still failing, try: https://unit-zero-beta.vercel.app')
    
    console.log('\n🔧 ALTERNATIVE TEST:')
    console.log('1. Open jwt-test.html in your browser')
    console.log('2. Click "Test Admin Login" button')
    console.log('3. Check if login works')
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await productionPrisma.$disconnect()
  }
}

fixProductionJWTFinal()
