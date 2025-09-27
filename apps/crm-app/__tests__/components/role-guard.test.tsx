import { render, screen } from '@testing-library/react'
import { SessionProvider } from 'next-auth/react'
import {
  RoleGuard,
  AdminOnly,
  ManagerOnly,
  OperationsOnly,
} from '../../components/shared/role-guard'
import { UserRole } from '@tinedy/types'

// Mock useRole hook
jest.mock('../../lib/hooks/useRole', () => ({
  useRole: jest.fn(),
}))

const mockUseRole = require('../../lib/hooks/useRole').useRole

const mockSession = (role: UserRole, isAuthenticated = true) => ({
  hasRole: (requiredRoles: UserRole[]) => requiredRoles.includes(role),
  isLoading: false,
  isAuthenticated,
  role,
})

describe('RoleGuard Components', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('RoleGuard', () => {
    it('should render children when user has required role', () => {
      mockUseRole.mockReturnValue(mockSession('ADMIN'))

      render(
        <RoleGuard requiredRoles={['ADMIN']}>
          <div>Admin Content</div>
        </RoleGuard>
      )

      expect(screen.getByText('Admin Content')).toBeInTheDocument()
    })

    it('should render fallback when user does not have required role', () => {
      mockUseRole.mockReturnValue(mockSession('OPERATIONS'))

      render(
        <RoleGuard
          requiredRoles={['ADMIN']}
          fallback={<div>Not Authorized</div>}
        >
          <div>Admin Content</div>
        </RoleGuard>
      )

      expect(screen.getByText('Not Authorized')).toBeInTheDocument()
      expect(screen.queryByText('Admin Content')).not.toBeInTheDocument()
    })

    it('should render fallback when user is not authenticated', () => {
      mockUseRole.mockReturnValue(mockSession('ADMIN', false))

      render(
        <RoleGuard requiredRoles={['ADMIN']} fallback={<div>Please Login</div>}>
          <div>Admin Content</div>
        </RoleGuard>
      )

      expect(screen.getByText('Please Login')).toBeInTheDocument()
      expect(screen.queryByText('Admin Content')).not.toBeInTheDocument()
    })

    it('should show loading when isLoading is true', () => {
      mockUseRole.mockReturnValue({
        hasRole: jest.fn(),
        isLoading: true,
        isAuthenticated: false,
        role: null,
      })

      render(
        <RoleGuard requiredRoles={['ADMIN']}>
          <div>Admin Content</div>
        </RoleGuard>
      )

      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })
  })

  describe('AdminOnly', () => {
    it('should render children for admin users', () => {
      mockUseRole.mockReturnValue(mockSession('ADMIN'))

      render(
        <AdminOnly>
          <div>Admin Only Content</div>
        </AdminOnly>
      )

      expect(screen.getByText('Admin Only Content')).toBeInTheDocument()
    })

    it('should not render children for non-admin users', () => {
      mockUseRole.mockReturnValue(mockSession('OPERATIONS'))

      render(
        <AdminOnly fallback={<div>Not Admin</div>}>
          <div>Admin Only Content</div>
        </AdminOnly>
      )

      expect(screen.getByText('Not Admin')).toBeInTheDocument()
      expect(screen.queryByText('Admin Only Content')).not.toBeInTheDocument()
    })
  })

  describe('ManagerOnly', () => {
    it('should render children for manager and admin users', () => {
      mockUseRole.mockReturnValue(mockSession('QC_MANAGER'))

      render(
        <ManagerOnly>
          <div>Manager Content</div>
        </ManagerOnly>
      )

      expect(screen.getByText('Manager Content')).toBeInTheDocument()
    })

    it('should render children for admin users', () => {
      mockUseRole.mockReturnValue(mockSession('ADMIN'))

      render(
        <ManagerOnly>
          <div>Manager Content</div>
        </ManagerOnly>
      )

      expect(screen.getByText('Manager Content')).toBeInTheDocument()
    })

    it('should not render children for operations users', () => {
      mockUseRole.mockReturnValue(mockSession('OPERATIONS'))

      render(
        <ManagerOnly fallback={<div>Not Manager</div>}>
          <div>Manager Content</div>
        </ManagerOnly>
      )

      expect(screen.getByText('Not Manager')).toBeInTheDocument()
    })
  })

  describe('OperationsOnly', () => {
    it('should render children for all authorized roles', () => {
      ;['ADMIN', 'OPERATIONS', 'MANAGER'].forEach((role) => {
        mockUseRole.mockReturnValue(mockSession(role as UserRole))

        const { unmount } = render(
          <OperationsOnly>
            <div>Operations Content</div>
          </OperationsOnly>
        )

        expect(screen.getByText('Operations Content')).toBeInTheDocument()
        unmount()
      })
    })
  })
})
