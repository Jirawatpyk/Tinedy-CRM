import {
  hasRequiredRole,
  isAdmin,
  isOperations,
  isQCManager,
} from '../../lib/utils/auth'
import { UserRole } from '@/types'

describe('Role-based Access Control', () => {
  describe('hasRequiredRole', () => {
    it('should return true when user has required role', () => {
      expect(hasRequiredRole('ADMIN', ['ADMIN'])).toBe(true)
      expect(hasRequiredRole('OPERATIONS', ['OPERATIONS'])).toBe(true)
      expect(hasRequiredRole('QC_MANAGER', ['QC_MANAGER'])).toBe(true)
    })

    it('should return true when user role is in required roles array', () => {
      expect(hasRequiredRole('ADMIN', ['ADMIN', 'QC_MANAGER'])).toBe(true)
      expect(hasRequiredRole('OPERATIONS', ['OPERATIONS', 'QC_MANAGER'])).toBe(
        true
      )
      expect(hasRequiredRole('QC_MANAGER', ['ADMIN', 'QC_MANAGER'])).toBe(true)
    })

    it('should return false when user does not have required role', () => {
      expect(hasRequiredRole('OPERATIONS', ['ADMIN'])).toBe(false)
      expect(hasRequiredRole('QC_MANAGER', ['ADMIN'])).toBe(false)
      expect(hasRequiredRole('OPERATIONS', ['QC_MANAGER'])).toBe(false)
    })
  })

  describe('Role checking functions', () => {
    it('should correctly identify admin role', () => {
      expect(isAdmin('ADMIN')).toBe(true)
      expect(isAdmin('OPERATIONS')).toBe(false)
      expect(isAdmin('QC_MANAGER')).toBe(false)
    })

    it('should correctly identify operations role', () => {
      expect(isOperations('OPERATIONS')).toBe(true)
      expect(isOperations('ADMIN')).toBe(false)
      expect(isOperations('QC_MANAGER')).toBe(false)
    })

    it('should correctly identify QC manager role', () => {
      expect(isQCManager('QC_MANAGER')).toBe(true)
      expect(isQCManager('ADMIN')).toBe(false)
      expect(isQCManager('OPERATIONS')).toBe(false)
    })
  })
})
