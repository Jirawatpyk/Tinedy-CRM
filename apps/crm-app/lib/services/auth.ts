import bcrypt from 'bcryptjs'
import { prisma } from '../db'
import { UserRole } from '@/types'

export interface CreateUserData {
  name: string
  email: string
  password: string
  role?: UserRole
}

export interface AuthUser {
  id: string
  name: string
  email: string
  role: UserRole
}

export class AuthService {
  static async createUser(data: CreateUserData): Promise<AuthUser> {
    const hashedPassword = await bcrypt.hash(data.password, 12)

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: data.role || 'OPERATIONS',
      },
    })

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    }
  }

  static async getUserByEmail(email: string): Promise<AuthUser | null> {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    })

    return user
  }

  static async validatePassword(
    email: string,
    password: string
  ): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { password: true },
    })

    if (!user) {
      return false
    }

    return bcrypt.compare(password, user.password)
  }
}
