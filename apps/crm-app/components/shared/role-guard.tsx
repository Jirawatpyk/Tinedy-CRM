'use client'

import { useRole } from '@/lib/hooks/useRole'
import { UserRole } from '@tinedy/types'

interface RoleGuardProps {
  children: React.ReactNode
  requiredRoles: UserRole[]
  fallback?: React.ReactNode
}

export function RoleGuard({
  children,
  requiredRoles,
  fallback = null,
}: RoleGuardProps) {
  const { hasRole, isLoading, isAuthenticated } = useRole()

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!isAuthenticated) {
    return <>{fallback}</>
  }

  if (!hasRole(requiredRoles)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

// Convenience components for specific roles
export function AdminOnly({
  children,
  fallback,
}: {
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  return (
    <RoleGuard requiredRoles={['ADMIN']} fallback={fallback}>
      {children}
    </RoleGuard>
  )
}

export function ManagerOnly({
  children,
  fallback,
}: {
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  return (
    <RoleGuard requiredRoles={['ADMIN', 'MANAGER']} fallback={fallback}>
      {children}
    </RoleGuard>
  )
}

export function OperationsOnly({
  children,
  fallback,
}: {
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  return (
    <RoleGuard
      requiredRoles={['ADMIN', 'OPERATIONS', 'MANAGER']}
      fallback={fallback}
    >
      {children}
    </RoleGuard>
  )
}
