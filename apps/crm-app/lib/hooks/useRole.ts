'use client'

import { useSession } from 'next-auth/react'
import { UserRole } from '@/types'
import {
  hasRequiredRole,
  isAdmin,
  isOperations,
  isTraining,
  isQCManager,
} from '../utils/auth'

export function useRole() {
  const { data: session, status } = useSession()

  const userRole = session?.user?.role as UserRole

  return {
    role: userRole,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    hasRole: (requiredRoles: UserRole[]) => {
      if (!userRole) return false
      return hasRequiredRole(userRole, requiredRoles)
    },
    isAdmin: () => isAdmin(userRole),
    isOperations: () => isOperations(userRole),
    isTraining: () => isTraining(userRole),
    isQCManager: () => isQCManager(userRole),
  }
}
