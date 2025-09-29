import { prisma } from '@/lib/db'
import { User as PrismaUser, UserRole } from '@prisma/client'

export interface UserCreateInput {
  email: string
  name: string
  password: string
  role: UserRole
  isActive?: boolean
}

export interface UserUpdateInput {
  email?: string
  name?: string
  role?: UserRole
  isActive?: boolean
}

export interface UserWithProfile extends PrismaUser {
  // Add any additional fields from profile relations if needed in the future
}

export interface UsersListResult {
  users: UserWithProfile[]
  totalCount: number
  hasNextPage: boolean
}

export class UserService {
  /**
   * ดึงรายการผู้ใช้ทั้งหมด
   */
  static async getAllUsers(
    page: number = 1,
    limit: number = 20
  ): Promise<UsersListResult> {
    const skip = (page - 1) * limit

    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.user.count(),
    ])

    return {
      users,
      totalCount,
      hasNextPage: totalCount > skip + limit,
    }
  }

  /**
   * ดึงผู้ใช้ตาม ID
   */
  static async getUserById(id: string): Promise<UserWithProfile | null> {
    return await prisma.user.findUnique({
      where: { id },
    })
  }

  /**
   * ดึงผู้ใช้ตาม email
   */
  static async getUserByEmail(email: string): Promise<UserWithProfile | null> {
    return await prisma.user.findUnique({
      where: { email },
    })
  }

  /**
   * ดึงรายการผู้ใช้ที่มี role เป็น OPERATIONS (สำหรับการมอบหมายงาน)
   */
  static async getOperationsUsers(): Promise<UserWithProfile[]> {
    return await prisma.user.findMany({
      where: {
        role: UserRole.OPERATIONS,
        isActive: true,
      },
      orderBy: {
        name: 'asc',
      },
    })
  }

  /**
   * ดึงรายการผู้ใช้ตาม role
   */
  static async getUsersByRole(
    role: UserRole,
    page: number = 1,
    limit: number = 20
  ): Promise<UsersListResult> {
    const skip = (page - 1) * limit

    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where: { role },
        skip,
        take: limit,
        orderBy: {
          name: 'asc',
        },
      }),
      prisma.user.count({
        where: { role },
      }),
    ])

    return {
      users,
      totalCount,
      hasNextPage: totalCount > skip + limit,
    }
  }

  /**
   * ดึงรายการผู้ใช้ที่ใช้งานอยู่
   */
  static async getActiveUsers(
    role?: UserRole,
    page?: number,
    limit?: number
  ): Promise<UserWithProfile[] | UsersListResult> {
    // ถ้าไม่ได้ระบุ pagination ให้ return array ธรรมดา
    if (page === undefined || limit === undefined) {
      const where: any = { isActive: true }
      if (role) {
        where.role = role
      }

      return await prisma.user.findMany({
        where,
        orderBy: {
          name: 'asc',
        },
      })
    }

    // ถ้าระบุ pagination ให้ return UsersListResult
    const skip = (page - 1) * limit
    const where: any = { isActive: true }
    if (role) {
      where.role = role
    }

    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          name: 'asc',
        },
      }),
      prisma.user.count({ where }),
    ])

    return {
      users,
      totalCount,
      hasNextPage: totalCount > skip + limit,
    }
  }

  /**
   * สร้างผู้ใช้ใหม่
   */
  static async createUser(data: UserCreateInput): Promise<PrismaUser> {
    return await prisma.user.create({
      data: {
        ...data,
        isActive: data.isActive ?? true,
      },
    })
  }

  /**
   * อัปเดตข้อมูลผู้ใช้
   */
  static async updateUser(
    id: string,
    data: UserUpdateInput
  ): Promise<PrismaUser> {
    return await prisma.user.update({
      where: { id },
      data,
    })
  }

  /**
   * ลบผู้ใช้ (soft delete - set isActive to false)
   */
  static async deactivateUser(id: string): Promise<PrismaUser> {
    return await prisma.user.update({
      where: { id },
      data: { isActive: false },
    })
  }

  /**
   * เปิดใช้งานผู้ใช้
   */
  static async activateUser(id: string): Promise<PrismaUser> {
    return await prisma.user.update({
      where: { id },
      data: { isActive: true },
    })
  }

  /**
   * ลบผู้ใช้ถาวร (hard delete)
   */
  static async deleteUser(id: string): Promise<PrismaUser> {
    return await prisma.user.delete({
      where: { id },
    })
  }

  /**
   * ค้นหาผู้ใช้ตามเงื่อนไขต่างๆ
   */
  static async searchUsers(
    filters: {
      role?: UserRole
      isActive?: boolean
      nameQuery?: string
      emailQuery?: string
    },
    page: number = 1,
    limit: number = 20
  ): Promise<UsersListResult> {
    const skip = (page - 1) * limit
    const where: any = {}

    if (filters.role) {
      where.role = filters.role
    }

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive
    }

    if (filters.nameQuery) {
      where.name = {
        contains: filters.nameQuery,
        mode: 'insensitive',
      }
    }

    if (filters.emailQuery) {
      where.email = {
        contains: filters.emailQuery,
        mode: 'insensitive',
      }
    }

    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          name: 'asc',
        },
      }),
      prisma.user.count({ where }),
    ])

    return {
      users,
      totalCount,
      hasNextPage: totalCount > skip + limit,
    }
  }

  /**
   * ตรวจสอบว่า email มีอยู่แล้วหรือไม่
   */
  static async isEmailExists(
    email: string,
    excludeId?: string
  ): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) return false
    if (excludeId && user.id === excludeId) return false

    return true
  }
}
