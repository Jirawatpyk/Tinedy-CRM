import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createAdmin() {
  console.log('🔐 Creating admin user...')

  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@tinedy.com' },
    })

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists')
      return
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 12)

    const admin = await prisma.user.create({
      data: {
        email: 'admin@tinedy.com',
        password: hashedPassword,
        name: 'ผู้ดูแลระบบ',
        role: 'ADMIN',
        isActive: true,
      },
    })

    console.log('✅ Admin user created successfully!')
    console.log('📧 Email: admin@tinedy.com')
    console.log('🔑 Password: admin123')
  } catch (error) {
    console.error('❌ Error creating admin user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()
