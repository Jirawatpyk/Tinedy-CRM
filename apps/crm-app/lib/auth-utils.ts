/**
 * Authentication utilities for server-side route protection
 * Used in pages and API routes to check user authentication and roles
 */

import { auth } from '@/auth'
import { UserRole } from '@prisma/client'
import { redirect } from 'next/navigation'

/**
 * Get current user session on server side
 */
export async function getCurrentUser() {
  const session = await auth()
  return session?.user || null
}

/**
 * Check if user has required role
 */
export function hasRole(
  userRole: UserRole | undefined,
  allowedRoles: UserRole[]
): boolean {
  if (!userRole) return false
  return allowedRoles.includes(userRole)
}

/**
 * Protect a page route with authentication and role checking
 * Call this in server components that need protection
 */
export async function protectRoute(
  allowedRoles?: UserRole[],
  redirectTo = '/login'
) {
  const session = await auth()

  // Check authentication
  if (!session?.user) {
    redirect(redirectTo)
  }

  // Check role authorization if roles are specified
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = session.user.role as UserRole
    if (!hasRole(userRole, allowedRoles)) {
      redirect('/unauthorized')
    }
  }

  return session.user
}

/**
 * Admin-only protection
 */
export async function requireAdmin() {
  return protectRoute(['ADMIN'])
}

/**
 * Operations team protection (includes admin and QC manager)
 */
export async function requireOperations() {
  return protectRoute(['ADMIN', 'OPERATIONS', 'QC_MANAGER'])
}

/**
 * Manager protection (admin and QC manager)
 */
export async function requireManager() {
  return protectRoute(['ADMIN', 'QC_MANAGER'])
}

/**
 * Training team protection
 */
export async function requireTraining() {
  return protectRoute(['ADMIN', 'TRAINING'])
}

/**
 * Check authentication without role checking
 */
export async function requireAuth() {
  return protectRoute()
}
