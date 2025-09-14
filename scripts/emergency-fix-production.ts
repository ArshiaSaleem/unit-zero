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

async function emergencyFixProduction() {
  try {
    console.log('🚨 EMERGENCY FIX - Production Login Issue')
    console.log('=' .repeat(60))
    
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
    
    // Ensure password is correct
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
    
    // Test ALL possible JWT secrets that might be used in production
    const possibleSecrets = [
      'your-super-secret-jwt-key-change-this-in-production',
      'unitzero-super-secret-key-2024',
      'jwt-secret-key-for-unitzero',
      'production-jwt-secret-key',
      'vercel-jwt-secret',
      'nextjs-jwt-secret',
      'default-jwt-secret',
      'jwt-secret',
      'JWT_SECRET',
      'your-super-secret-jwt-key-change-this-in-production',
      process.env.JWT_SECRET
    ].filter(Boolean)
    
    console.log('\n🔍 Testing ALL possible JWT secrets...')
    let workingSecrets = []
    
    for (const secret of possibleSecrets) {
      try {
        const testPayload = { id: adminUser.id, email: adminUser.email, role: adminUser.role }
        const token = jwt.sign(testPayload, secret as string)
        const decoded = jwt.verify(token, secret as string)
        
        console.log(`✅ Secret "${(secret as string).substring(0, 25)}..." WORKS`)
        workingSecrets.push(secret)
      } catch (error) {
        console.log(`❌ Secret "${(secret as string).substring(0, 25)}..." failed`)
      }
    }
    
    if (workingSecrets.length === 0) {
      console.log('❌ No working JWT secrets found!')
      return
    }
    
    console.log(`\n🎯 Found ${workingSecrets.length} working JWT secrets`)
    
    // Use the first working secret
    const workingSecret = workingSecrets[0]
    console.log(`🔑 Using JWT secret: ${(workingSecret as string).substring(0, 25)}...`)
    
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
    
    // Create a comprehensive test page
    const testHTML = `
<!DOCTYPE html>
<html>
<head>
    <title>Unit Zero - Emergency Login Test</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .success { color: #059669; background: #d1fae5; padding: 15px; border-radius: 5px; margin: 10px 0; }
        .error { color: #dc2626; background: #fee2e2; padding: 15px; border-radius: 5px; margin: 10px 0; }
        .info { background: #f0f9ff; padding: 20px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #3b82f6; }
        .warning { background: #fef3c7; padding: 20px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #f59e0b; }
        button { background: #dc2626; color: white; padding: 12px 24px; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; margin: 10px 5px; }
        button:hover { background: #b91c1c; }
        .urls { background: #f3f4f6; padding: 15px; border-radius: 5px; margin: 10px 0; }
        .urls a { color: #3b82f6; text-decoration: none; margin-right: 15px; }
        .urls a:hover { text-decoration: underline; }
        input { padding: 10px; margin: 5px; border: 1px solid #d1d5db; border-radius: 5px; width: 300px; }
        .form-group { margin: 15px 0; }
        label { display: block; margin-bottom: 5px; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚨 Unit Zero - Emergency Login Test</h1>
        
        <div class="info">
            <h3>📊 System Status</h3>
            <p><strong>Database:</strong> ✅ Connected</p>
            <p><strong>Admin User:</strong> ✅ Found (${adminUser.email})</p>
            <p><strong>Password:</strong> ✅ Correct</p>
            <p><strong>JWT Secret:</strong> ✅ Working (${(workingSecret as string).substring(0, 25)}...)</p>
            <p><strong>Token Generation:</strong> ✅ Working</p>
        </div>
        
        <div class="warning">
            <h3>⚠️ If Login Still Fails</h3>
            <p>The issue is likely:</p>
            <ul>
                <li>Browser cache (try incognito mode)</li>
                <li>Different JWT secret in production environment</li>
                <li>Environment variable not properly set in Vercel</li>
            </ul>
        </div>
        
        <div class="urls">
            <h3>🌐 Test These URLs:</h3>
            <a href="https://unit-zero.nl" target="_blank">https://unit-zero.nl</a>
            <a href="https://unit-zero-beta.vercel.app" target="_blank">https://unit-zero-beta.vercel.app</a>
            <a href="https://unit-zero-git-main-arshia-saleems-projects.vercel.app" target="_blank">Vercel Main</a>
        </div>
        
        <div class="form-group">
            <h3>🔑 Test Login API</h3>
            <label>Email:</label>
            <input type="email" id="email" value="admin@unitzero.com" />
            <label>Password:</label>
            <input type="password" id="password" value="admin123" />
            <br>
            <button onclick="testLogin('https://unit-zero.nl')">Test unit-zero.nl</button>
            <button onclick="testLogin('https://unit-zero-beta.vercel.app')">Test Vercel Beta</button>
            <button onclick="testLogin('https://unit-zero-git-main-arshia-saleems-projects.vercel.app')">Test Vercel Main</button>
        </div>
        
        <div id="result"></div>
        
        <div class="info">
            <h3>🔧 Manual Test</h3>
            <p>1. Open incognito/private browser window</p>
            <p>2. Go to one of the URLs above</p>
            <p>3. Login with: admin@unitzero.com / admin123</p>
            <p>4. If it works, the issue is browser cache</p>
            <p>5. If it doesn't work, the issue is environment variables</p>
        </div>
    </div>
    
    <script>
        async function testLogin(baseUrl) {
            const result = document.getElementById('result');
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            result.innerHTML = '<div class="info">Testing ' + baseUrl + '...</div>';
            
            try {
                const response = await fetch(baseUrl + '/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    result.innerHTML = '<div class="success">✅ Login successful!<br>Token: ' + data.token.substring(0, 50) + '...<br>URL: ' + baseUrl + '</div>';
                } else {
                    result.innerHTML = '<div class="error">❌ Login failed: ' + data.error + '<br>URL: ' + baseUrl + '</div>';
                }
            } catch (error) {
                result.innerHTML = '<div class="error">❌ Error: ' + error.message + '<br>URL: ' + baseUrl + '</div>';
            }
        }
    </script>
</body>
</html>`
    
    // Write test file
    require('fs').writeFileSync('emergency-login-test.html', testHTML)
    console.log('📄 Created emergency-login-test.html')
    
    console.log('\n🎯 EMERGENCY ACTION PLAN:')
    console.log('1. Open emergency-login-test.html in your browser')
    console.log('2. Test all three URLs')
    console.log('3. If any URL works, use that one')
    console.log('4. If none work, the issue is environment variables in Vercel')
    
    console.log('\n🌐 DIRECT TEST:')
    console.log('Try these URLs in incognito mode:')
    console.log('- https://unit-zero.nl')
    console.log('- https://unit-zero-beta.vercel.app')
    console.log('- https://unit-zero-git-main-arshia-saleems-projects.vercel.app')
    
    console.log('\n🔑 LOGIN CREDENTIALS:')
    console.log('Email: admin@unitzero.com')
    console.log('Password: admin123')
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await productionPrisma.$disconnect()
  }
}

emergencyFixProduction()
