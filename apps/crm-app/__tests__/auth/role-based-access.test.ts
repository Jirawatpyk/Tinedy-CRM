import {
  hasRequiredRole,
  isAdmin,
  isOperations,
  isManager,
} from '../../lib/utils/auth'
import { UserRole } from '@tinedy/types'

describe('Role-based Access Control', () => {
  describe('hasRequiredRole', () => {
    it('should return true when user has required role', () => {
      expect(hasRequiredRole('ADMIN', ['ADMIN'])).toBe(true)
      expect(hasRequiredRole('OPERATIONS', ['OPERATIONS'])).toBe(true)
      expect(hasRequiredRole('MANAGER', ['MANAGER'])).toBe(true)
    })

    it('should return true when user role is in required roles array', () => {
      expect(hasRequiredRole('ADMIN', ['ADMIN', 'MANAGER'])).toBe(true)
      expect(hasRequiredRole('OPERATIONS', ['OPERATIONS', 'MANAGER'])).toBe(
        true
      )
      expect(hasRequiredRole('MANAGER', ['ADMIN', 'MANAGER'])).toBe(true)
    })

    it('should return false when user does not have required role', () => {
      expect(hasRequiredRole('OPERATIONS', ['ADMIN'])).toBe(false)
      expect(hasRequiredRole('MANAGER', ['ADMIN'])).toBe(false)
      expect(hasRequiredRole('OPERATIONS', ['MANAGER'])).toBe(false)
    })
  })

  describe('Role checking functions', () => {
    it('should correctly identify admin role', () => {
      expect(isAdmin('ADMIN')).toBe(true)
      expect(isAdmin('OPERATIONS')).toBe(false)
      expect(isAdmin('MANAGER')).toBe(false)
    })

    it('should correctly identify operations role', () => {
      expect(isOperations('OPERATIONS')).toBe(true)
      expect(isOperations('ADMIN')).toBe(false)
      expect(isOperations('MANAGER')).toBe(false)
    })

    it('should correctly identify manager role', () => {
      expect(isManager('MANAGER')).toBe(true)
      expect(isManager('ADMIN')).toBe(false)
      expect(isManager('OPERATIONS')).toBe(false)
    })
  })
})
