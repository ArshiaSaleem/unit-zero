const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

// Use production database URL
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "postgres://c2012740f591e59ba3fcee86319ef1dc7c74e4f71411b52a90c2fe9e04fc7faa:sk_Yg9DcqhWhsTT-NeDw0V2z@db.prisma.io:5432/postgres?sslmode=require"
    }
  }
});

async function fixAdminUser() {
  try {
    console.log('Checking admin user...');
    
    // Find admin user
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@unitzero.com' }
    });

    if (!adminUser) {
      console.log('Admin user not found! Creating...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      const newAdmin = await prisma.user.create({
        data: {
          email: 'admin@unitzero.com',
          password: hashedPassword,
          role: 'ADMIN',
          firstName: 'Admin',
          lastName: 'User',
          mustChangePassword: false // Admin should never be prompted to change password
        }
      });
      
      console.log('Admin user created:', newAdmin);
    } else {
      console.log('Admin user found:', {
        id: adminUser.id,
        email: adminUser.email,
        role: adminUser.role,
        mustChangePassword: adminUser.mustChangePassword
      });

      // Fix admin user if needed
      if (adminUser.mustChangePassword) {
        console.log('Fixing admin user - setting mustChangePassword to false...');
        
        const updatedAdmin = await prisma.user.update({
          where: { id: adminUser.id },
          data: {
            mustChangePassword: false,
            password: await bcrypt.hash('admin123', 10) // Reset password to admin123
          }
        });
        
        console.log('Admin user updated:', {
          id: updatedAdmin.id,
          email: updatedAdmin.email,
          mustChangePassword: updatedAdmin.mustChangePassword
        });
      }
    }

  } catch (error) {
    console.error('Error fixing admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAdminUser();
