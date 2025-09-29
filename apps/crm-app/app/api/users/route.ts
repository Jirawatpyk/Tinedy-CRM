import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { UserService } from '@/lib/services/user'
import { UserRole } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    // ตรวจสอบ authentication
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ตรวจสอบ role permission (Admin only)
    if (session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // If role=OPERATIONS is specified, return operations users only
    if (role === 'OPERATIONS') {
      const operationsUsers = await UserService.getOperationsUsers()
      return NextResponse.json(operationsUsers)
    }

    // If role filter is specified, filter by role
    if (role && Object.values(UserRole).includes(role as UserRole)) {
      const result = await UserService.getUsersByRole(
        role as UserRole,
        page,
        limit
      )
      return NextResponse.json(result)
    }

    // Default: return all users with pagination
    const result = await UserService.getAllUsers(page, limit)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
