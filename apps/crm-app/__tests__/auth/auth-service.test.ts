import { AuthService } from '@/lib/services/auth'
import { prismaMock } from '../__mocks__/prisma'
import bcrypt from 'bcryptjs'

jest.mock('bcryptjs')

jest.mock('@/lib/db', () => ({
  prisma: prismaMock,
}))

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createUser', () => {
    it('should create a user with hashed password', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      }

      const hashedPassword = 'hashedPassword123'
      const createdUser = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        password: hashedPassword,
        role: 'OPERATIONS' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
      }

      ;(bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword)
      prismaMock.user.create.mockResolvedValue(createdUser)

      const result = await AuthService.createUser(userData)

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 12)
      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: {
          name: 'John Doe',
          email: 'john@example.com',
          password: hashedPassword,
          role: 'OPERATIONS',
        },
      })
      expect(result).toEqual({
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'OPERATIONS',
      })
    })
  })

  describe('getUserByEmail', () => {
    it('should return user when found', async () => {
      const mockUser = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'OPERATIONS' as const,
      }

      prismaMock.user.findUnique.mockResolvedValue(mockUser as any)

      const result = await AuthService.getUserByEmail('john@example.com')

      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'john@example.com' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      })
      expect(result).toEqual(mockUser)
    })

    it('should return null when user not found', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null)

      const result = await AuthService.getUserByEmail('nonexistent@example.com')

      expect(result).toBeNull()
    })
  })

  describe('validatePassword', () => {
    it('should return true for valid password', async () => {
      const mockUser = {
        password: 'hashedPassword123',
      }

      prismaMock.user.findUnique.mockResolvedValue(mockUser as any)
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)

      const result = await AuthService.validatePassword(
        'john@example.com',
        'password123'
      )

      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'john@example.com' },
        select: { password: true },
      })
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'password123',
        'hashedPassword123'
      )
      expect(result).toBe(true)
    })

    it('should return false for invalid password', async () => {
      const mockUser = {
        password: 'hashedPassword123',
      }

      prismaMock.user.findUnique.mockResolvedValue(mockUser as any)
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(false)

      const result = await AuthService.validatePassword(
        'john@example.com',
        'wrongpassword'
      )

      expect(result).toBe(false)
    })

    it('should return false when user not found', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null)

      const result = await AuthService.validatePassword(
        'nonexistent@example.com',
        'password123'
      )

      expect(result).toBe(false)
    })
  })
})
