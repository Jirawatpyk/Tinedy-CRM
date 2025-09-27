import { UserRole } from '@tinedy/types'

export const ROLES = {
  ADMIN: 'ADMIN' as UserRole,
  OPERATIONS: 'OPERATIONS' as UserRole,
  MANAGER: 'MANAGER' as UserRole,
} as const

export function hasRequiredRole(
  userRole: UserRole,
  requiredRoles: UserRole[]
): boolean {
  return requiredRoles.includes(userRole)
}

export function isAdmin(userRole: UserRole): boolean {
  return userRole === ROLES.ADMIN
}

export function isOperations(userRole: UserRole): boolean {
  return userRole === ROLES.OPERATIONS
}

export function isManager(userRole: UserRole): boolean {
  return userRole === ROLES.MANAGER
}

export function getRoleDisplayName(role: UserRole): string {
  switch (role) {
    case ROLES.ADMIN:
      return 'Administrator'
    case ROLES.OPERATIONS:
      return 'Operations Team'
    case ROLES.MANAGER:
      return 'Manager'
    default:
      return 'Unknown'
  }
}
