import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createTestAdmin() {
  try {
    // Check if admin exists
    const existing = await prisma.admin.findFirst();
    if (existing) {
      console.log('Admin already exists:', existing.email);
      return;
    }

    // Create test admin
    const hashedPassword = await bcrypt.hash('admin123', 12);
    const admin = await prisma.admin.create({
      data: {
        firstName: 'Test',
        lastName: 'Admin', 
        email: 'admin@kampala-kids.com',
        password: hashedPassword,
        role: 'ADMIN',
        isActive: true,
        permissions: JSON.stringify(['read', 'write', 'delete'])
      }
    });
    console.log('Test admin created:', admin.email);
    console.log('Password: admin123');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createTestAdmin();