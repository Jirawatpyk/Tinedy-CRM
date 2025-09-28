'use client'

import { useSession } from 'next-auth/react'
import { UserRole } from '@/types'
import { hasRequiredRole } from '../../lib/utils/auth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface WithRoleProps {
  requiredRoles: UserRole[]
  fallbackPath?: string
}

export function withRole<P extends object>(
  Component: React.ComponentType<P>,
  { requiredRoles, fallbackPath = '/unauthorized' }: WithRoleProps
) {
  const WrappedComponent = (props: P) => {
    const { data: session, status } = useSession()
    const router = useRouter()

    useEffect(() => {
      if (status === 'loading') return

      if (!session) {
        router.push('/login')
        return
      }

      const userRole = session.user?.role as UserRole
      if (!userRole || !hasRequiredRole(userRole, requiredRoles)) {
        router.push(fallbackPath)
        return
      }
    }, [session, status, router])

    if (status === 'loading') {
      return <div>กำลังโหลด...</div>
    }

    if (!session) {
      return null
    }

    const userRole = session.user?.role as UserRole
    if (!userRole || !hasRequiredRole(userRole, requiredRoles)) {
      return null
    }

    return <Component {...props} />
  }

  WrappedComponent.displayName = `withRole(${Component.displayName || Component.name})`
  return WrappedComponent
}
