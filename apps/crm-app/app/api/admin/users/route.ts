import { NextRequest } from 'next/server'
import { withRole } from '@/lib/utils/api-auth'
import { prisma } from '@/lib/db'

export const GET = withRole(['ADMIN'], async (req) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return Response.json({
      success: true,
      data: users,
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return Response.json(
      {
        success: false,
        error: 'Failed to fetch users',
      },
      { status: 500 }
    )
  }
})

export const POST = withRole(['ADMIN'], async (req) => {
  try {
    const { name, email, password, role } = await req.json()

    // Validate required fields
    if (!name || !email || !password || !role) {
      return Response.json(
        {
          success: false,
          error: 'Missing required fields',
        },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return Response.json(
        {
          success: false,
          error: 'User with this email already exists',
        },
        { status: 409 }
      )
    }

    // Create new user
    const bcrypt = require('bcryptjs')
    const hashedPassword = await bcrypt.hash(password, 12)

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    })

    return Response.json({
      success: true,
      data: newUser,
      message: 'User created successfully',
    })
  } catch (error) {
    console.error('Error creating user:', error)
    return Response.json(
      {
        success: false,
        error: 'Failed to create user',
      },
      { status: 500 }
    )
  }
})
