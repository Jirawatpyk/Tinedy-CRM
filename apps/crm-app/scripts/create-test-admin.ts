#!/usr/bin/env tsx

import bcrypt from 'bcryptjs'
import { prisma } from '../lib/db'

async function createTestAdmin() {
  try {
    console.log('🔧 Creating test admin user...')

    // Check if admin user already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@tinedy.com' },
    })

    if (existingAdmin) {
      console.log('✅ Admin user already exists')
      console.log('Email: admin@tinedy.com')
      console.log('Password: admin123')
      return
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 12)

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        id: 'admin-' + Date.now(),
        email: 'admin@tinedy.com',
        name: 'Admin User',
        password: hashedPassword,
        role: 'ADMIN',
        isActive: true,
        updatedAt: new Date(),
      },
    })

    console.log('✅ Test admin user created successfully!')
    console.log('Email: admin@tinedy.com')
    console.log('Password: admin123')
    console.log('Role: ADMIN')
    console.log('User ID:', admin.id)
  } catch (error) {
    console.error('❌ Error creating admin user:', error)
    throw error
  }
}

async function main() {
  try {
    await createTestAdmin()
  } catch (error) {
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
