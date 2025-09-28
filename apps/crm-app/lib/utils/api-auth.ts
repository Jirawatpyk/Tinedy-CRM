import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { UserRole } from '@/types'
import { hasRequiredRole } from './auth'

export interface AuthenticatedRequest extends NextRequest {
  user: {
    id: string
    email: string
    name: string
    role: UserRole
  }
}

export async function requireAuth(request: NextRequest) {
  const session = await auth()

  if (!session || !session.user) {
    return {
      error: 'Unauthorized',
      status: 401,
    }
  }

  return {
    user: session.user,
    session,
  }
}

export async function requireRole(
  request: NextRequest,
  requiredRoles: UserRole[]
) {
  const authResult = await requireAuth(request)

  if ('error' in authResult) {
    return authResult
  }

  const userRole = authResult.user.role as UserRole

  if (!hasRequiredRole(userRole, requiredRoles)) {
    return {
      error: 'Forbidden: Insufficient permissions',
      status: 403,
    }
  }

  return authResult
}

export function withAuth(
  handler: (req: AuthenticatedRequest) => Promise<Response>
) {
  return async (request: NextRequest) => {
    const authResult = await requireAuth(request)

    if ('error' in authResult) {
      return Response.json(
        { error: authResult.error },
        { status: authResult.status }
      )
    }

    const authenticatedRequest = request as AuthenticatedRequest
    authenticatedRequest.user = {
      ...authResult.user,
      role: authResult.user.role as UserRole,
    }

    return handler(authenticatedRequest)
  }
}

export function withRole(
  requiredRoles: UserRole[],
  handler: (req: AuthenticatedRequest) => Promise<Response>
) {
  return async (request: NextRequest) => {
    const authResult = await requireRole(request, requiredRoles)

    if ('error' in authResult) {
      return Response.json(
        { error: authResult.error },
        { status: authResult.status }
      )
    }

    const authenticatedRequest = request as AuthenticatedRequest
    authenticatedRequest.user = {
      ...authResult.user,
      role: authResult.user.role as UserRole,
    }

    return handler(authenticatedRequest)
  }
}
