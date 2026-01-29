// scripts/setup-admin.ts
import { prisma } from '@/lib/prisma';
import { AuthUtils } from '@/lib/auth-utils';

async function setupAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL || 'bhattaanjana0@gmail.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'anjana9@';
  
  try {
    // Hash password
    const hashedPassword = await AuthUtils.hashPassword(adminPassword);
    
    // Create or update admin user
    const admin = await prisma.user.upsert({
      where: { email: adminEmail },
      update: { 
        isAdmin: true,
        password: hashedPassword // Update password too
      },
      create: {
        email: adminEmail,
        name: 'Admin',
        password: hashedPassword,
        isAdmin: true,
        cart: { create: {} }
      }
    });
    
    console.log(`✅ Admin user setup complete:`);
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    console.log(`   ID: ${admin.id}`);
  } catch (error) {
    console.error('Error setting up admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupAdmin();