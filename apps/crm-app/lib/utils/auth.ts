import { UserRole } from '@/types'

export const ROLES = {
  ADMIN: 'ADMIN' as UserRole,
  OPERATIONS: 'OPERATIONS' as UserRole,
  TRAINING: 'TRAINING' as UserRole,
  QC_MANAGER: 'QC_MANAGER' as UserRole,
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

export function isTraining(userRole: UserRole): boolean {
  return userRole === ROLES.TRAINING
}

export function isQCManager(userRole: UserRole): boolean {
  return userRole === ROLES.QC_MANAGER
}

export function getRoleDisplayName(role: UserRole): string {
  switch (role) {
    case ROLES.ADMIN:
      return 'Administrator'
    case ROLES.OPERATIONS:
      return 'Operations Team'
    case ROLES.TRAINING:
      return 'Training Team'
    case ROLES.QC_MANAGER:
      return 'QC Manager'
    default:
      return 'Unknown'
  }
}
