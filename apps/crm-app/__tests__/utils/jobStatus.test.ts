/**
 * Job Status State Machine Utility Tests
 *
 * Comprehensive test suite for Story 2.6: Job Status Update
 * Tests all status transition logic, validation rules, and helper functions
 *
 * @module jobStatus.test
 */

import { JobStatus } from '@/lib/db'
import {
  getValidNextStatuses,
  isValidTransition,
  getTransitionErrorMessage,
  isTerminalStatus,
  getTerminalStatuses,
} from '@/lib/utils/jobStatus'

describe('jobStatus utility - getValidNextStatuses()', () => {
  // Test NEW status transitions (2 valid next statuses)
  test('NEW status can transition to ASSIGNED or CANCELLED', () => {
    const validStatuses = getValidNextStatuses(JobStatus.NEW)
    expect(validStatuses).toHaveLength(2)
    expect(validStatuses).toContain(JobStatus.ASSIGNED)
    expect(validStatuses).toContain(JobStatus.CANCELLED)
  })

  test('NEW status cannot transition to IN_PROGRESS', () => {
    const validStatuses = getValidNextStatuses(JobStatus.NEW)
    expect(validStatuses).not.toContain(JobStatus.IN_PROGRESS)
  })

  test('NEW status cannot transition to COMPLETED', () => {
    const validStatuses = getValidNextStatuses(JobStatus.NEW)
    expect(validStatuses).not.toContain(JobStatus.COMPLETED)
  })

  test('NEW status cannot transition to ON_HOLD', () => {
    const validStatuses = getValidNextStatuses(JobStatus.NEW)
    expect(validStatuses).not.toContain(JobStatus.ON_HOLD)
  })

  // Test ASSIGNED status transitions (2 valid next statuses)
  test('ASSIGNED status can transition to IN_PROGRESS or CANCELLED', () => {
    const validStatuses = getValidNextStatuses(JobStatus.ASSIGNED)
    expect(validStatuses).toHaveLength(2)
    expect(validStatuses).toContain(JobStatus.IN_PROGRESS)
    expect(validStatuses).toContain(JobStatus.CANCELLED)
  })

  test('ASSIGNED status cannot transition to COMPLETED', () => {
    const validStatuses = getValidNextStatuses(JobStatus.ASSIGNED)
    expect(validStatuses).not.toContain(JobStatus.COMPLETED)
  })

  test('ASSIGNED status cannot transition to ON_HOLD', () => {
    const validStatuses = getValidNextStatuses(JobStatus.ASSIGNED)
    expect(validStatuses).not.toContain(JobStatus.ON_HOLD)
  })

  test('ASSIGNED status cannot transition back to NEW', () => {
    const validStatuses = getValidNextStatuses(JobStatus.ASSIGNED)
    expect(validStatuses).not.toContain(JobStatus.NEW)
  })

  // Test IN_PROGRESS status transitions (3 valid next statuses)
  test('IN_PROGRESS status can transition to COMPLETED, ON_HOLD, or CANCELLED', () => {
    const validStatuses = getValidNextStatuses(JobStatus.IN_PROGRESS)
    expect(validStatuses).toHaveLength(3)
    expect(validStatuses).toContain(JobStatus.COMPLETED)
    expect(validStatuses).toContain(JobStatus.ON_HOLD)
    expect(validStatuses).toContain(JobStatus.CANCELLED)
  })

  test('IN_PROGRESS status cannot transition to NEW', () => {
    const validStatuses = getValidNextStatuses(JobStatus.IN_PROGRESS)
    expect(validStatuses).not.toContain(JobStatus.NEW)
  })

  test('IN_PROGRESS status cannot transition to ASSIGNED', () => {
    const validStatuses = getValidNextStatuses(JobStatus.IN_PROGRESS)
    expect(validStatuses).not.toContain(JobStatus.ASSIGNED)
  })

  // Test ON_HOLD status transitions (2 valid next statuses)
  test('ON_HOLD status can transition to IN_PROGRESS or CANCELLED', () => {
    const validStatuses = getValidNextStatuses(JobStatus.ON_HOLD)
    expect(validStatuses).toHaveLength(2)
    expect(validStatuses).toContain(JobStatus.IN_PROGRESS)
    expect(validStatuses).toContain(JobStatus.CANCELLED)
  })

  test('ON_HOLD status cannot transition to COMPLETED', () => {
    const validStatuses = getValidNextStatuses(JobStatus.ON_HOLD)
    expect(validStatuses).not.toContain(JobStatus.COMPLETED)
  })

  test('ON_HOLD status cannot transition to NEW', () => {
    const validStatuses = getValidNextStatuses(JobStatus.ON_HOLD)
    expect(validStatuses).not.toContain(JobStatus.NEW)
  })

  // Test COMPLETED terminal state (0 valid next statuses)
  test('COMPLETED is a terminal state with no valid transitions', () => {
    const validStatuses = getValidNextStatuses(JobStatus.COMPLETED)
    expect(validStatuses).toHaveLength(0)
  })

  // Test DONE terminal state (0 valid next statuses - legacy)
  test('DONE is a terminal state with no valid transitions (legacy status)', () => {
    const validStatuses = getValidNextStatuses(JobStatus.DONE)
    expect(validStatuses).toHaveLength(0)
  })

  // Test CANCELLED terminal state (0 valid next statuses)
  test('CANCELLED is a terminal state with no valid transitions', () => {
    const validStatuses = getValidNextStatuses(JobStatus.CANCELLED)
    expect(validStatuses).toHaveLength(0)
  })
})

describe('jobStatus utility - isValidTransition()', () => {
  // Test same status transitions (always valid - no-op)
  test('transition from status to itself is always valid (NEW → NEW)', () => {
    expect(isValidTransition(JobStatus.NEW, JobStatus.NEW)).toBe(true)
  })

  test('transition from status to itself is always valid (IN_PROGRESS → IN_PROGRESS)', () => {
    expect(
      isValidTransition(JobStatus.IN_PROGRESS, JobStatus.IN_PROGRESS)
    ).toBe(true)
  })

  test('transition from status to itself is always valid (COMPLETED → COMPLETED)', () => {
    expect(isValidTransition(JobStatus.COMPLETED, JobStatus.COMPLETED)).toBe(
      true
    )
  })

  // Test valid NEW transitions
  test('NEW → ASSIGNED is valid', () => {
    expect(isValidTransition(JobStatus.NEW, JobStatus.ASSIGNED)).toBe(true)
  })

  test('NEW → CANCELLED is valid', () => {
    expect(isValidTransition(JobStatus.NEW, JobStatus.CANCELLED)).toBe(true)
  })

  // Test invalid NEW transitions
  test('NEW → IN_PROGRESS is invalid', () => {
    expect(isValidTransition(JobStatus.NEW, JobStatus.IN_PROGRESS)).toBe(false)
  })

  test('NEW → COMPLETED is invalid', () => {
    expect(isValidTransition(JobStatus.NEW, JobStatus.COMPLETED)).toBe(false)
  })

  test('NEW → ON_HOLD is invalid', () => {
    expect(isValidTransition(JobStatus.NEW, JobStatus.ON_HOLD)).toBe(false)
  })

  test('NEW → DONE is invalid', () => {
    expect(isValidTransition(JobStatus.NEW, JobStatus.DONE)).toBe(false)
  })

  // Test valid ASSIGNED transitions
  test('ASSIGNED → IN_PROGRESS is valid', () => {
    expect(isValidTransition(JobStatus.ASSIGNED, JobStatus.IN_PROGRESS)).toBe(
      true
    )
  })

  test('ASSIGNED → CANCELLED is valid', () => {
    expect(isValidTransition(JobStatus.ASSIGNED, JobStatus.CANCELLED)).toBe(
      true
    )
  })

  // Test invalid ASSIGNED transitions
  test('ASSIGNED → NEW is invalid (cannot go backwards)', () => {
    expect(isValidTransition(JobStatus.ASSIGNED, JobStatus.NEW)).toBe(false)
  })

  test('ASSIGNED → COMPLETED is invalid (must go through IN_PROGRESS)', () => {
    expect(isValidTransition(JobStatus.ASSIGNED, JobStatus.COMPLETED)).toBe(
      false
    )
  })

  test('ASSIGNED → ON_HOLD is invalid', () => {
    expect(isValidTransition(JobStatus.ASSIGNED, JobStatus.ON_HOLD)).toBe(false)
  })

  test('ASSIGNED → DONE is invalid', () => {
    expect(isValidTransition(JobStatus.ASSIGNED, JobStatus.DONE)).toBe(false)
  })

  // Test valid IN_PROGRESS transitions
  test('IN_PROGRESS → COMPLETED is valid', () => {
    expect(isValidTransition(JobStatus.IN_PROGRESS, JobStatus.COMPLETED)).toBe(
      true
    )
  })

  test('IN_PROGRESS → ON_HOLD is valid', () => {
    expect(isValidTransition(JobStatus.IN_PROGRESS, JobStatus.ON_HOLD)).toBe(
      true
    )
  })

  test('IN_PROGRESS → CANCELLED is valid', () => {
    expect(isValidTransition(JobStatus.IN_PROGRESS, JobStatus.CANCELLED)).toBe(
      true
    )
  })

  // Test invalid IN_PROGRESS transitions
  test('IN_PROGRESS → NEW is invalid (cannot go backwards)', () => {
    expect(isValidTransition(JobStatus.IN_PROGRESS, JobStatus.NEW)).toBe(false)
  })

  test('IN_PROGRESS → ASSIGNED is invalid (cannot go backwards)', () => {
    expect(isValidTransition(JobStatus.IN_PROGRESS, JobStatus.ASSIGNED)).toBe(
      false
    )
  })

  test('IN_PROGRESS → DONE is invalid', () => {
    expect(isValidTransition(JobStatus.IN_PROGRESS, JobStatus.DONE)).toBe(false)
  })

  // Test valid ON_HOLD transitions
  test('ON_HOLD → IN_PROGRESS is valid (resume work)', () => {
    expect(isValidTransition(JobStatus.ON_HOLD, JobStatus.IN_PROGRESS)).toBe(
      true
    )
  })

  test('ON_HOLD → CANCELLED is valid', () => {
    expect(isValidTransition(JobStatus.ON_HOLD, JobStatus.CANCELLED)).toBe(true)
  })

  // Test invalid ON_HOLD transitions
  test('ON_HOLD → COMPLETED is invalid (must resume to IN_PROGRESS first)', () => {
    expect(isValidTransition(JobStatus.ON_HOLD, JobStatus.COMPLETED)).toBe(
      false
    )
  })

  test('ON_HOLD → NEW is invalid', () => {
    expect(isValidTransition(JobStatus.ON_HOLD, JobStatus.NEW)).toBe(false)
  })

  test('ON_HOLD → ASSIGNED is invalid', () => {
    expect(isValidTransition(JobStatus.ON_HOLD, JobStatus.ASSIGNED)).toBe(false)
  })

  test('ON_HOLD → DONE is invalid', () => {
    expect(isValidTransition(JobStatus.ON_HOLD, JobStatus.DONE)).toBe(false)
  })

  // Test terminal state COMPLETED (cannot transition to anything)
  test('COMPLETED → IN_PROGRESS is invalid (terminal state)', () => {
    expect(isValidTransition(JobStatus.COMPLETED, JobStatus.IN_PROGRESS)).toBe(
      false
    )
  })

  test('COMPLETED → NEW is invalid (terminal state)', () => {
    expect(isValidTransition(JobStatus.COMPLETED, JobStatus.NEW)).toBe(false)
  })

  test('COMPLETED → ASSIGNED is invalid (terminal state)', () => {
    expect(isValidTransition(JobStatus.COMPLETED, JobStatus.ASSIGNED)).toBe(
      false
    )
  })

  test('COMPLETED → ON_HOLD is invalid (terminal state)', () => {
    expect(isValidTransition(JobStatus.COMPLETED, JobStatus.ON_HOLD)).toBe(
      false
    )
  })

  test('COMPLETED → CANCELLED is invalid (terminal state)', () => {
    expect(isValidTransition(JobStatus.COMPLETED, JobStatus.CANCELLED)).toBe(
      false
    )
  })

  // Test terminal state CANCELLED (cannot transition to anything)
  test('CANCELLED → IN_PROGRESS is invalid (terminal state)', () => {
    expect(isValidTransition(JobStatus.CANCELLED, JobStatus.IN_PROGRESS)).toBe(
      false
    )
  })

  test('CANCELLED → COMPLETED is invalid (terminal state)', () => {
    expect(isValidTransition(JobStatus.CANCELLED, JobStatus.COMPLETED)).toBe(
      false
    )
  })

  test('CANCELLED → NEW is invalid (terminal state)', () => {
    expect(isValidTransition(JobStatus.CANCELLED, JobStatus.NEW)).toBe(false)
  })

  // Test terminal state DONE (legacy - cannot transition to anything)
  test('DONE → IN_PROGRESS is invalid (terminal state)', () => {
    expect(isValidTransition(JobStatus.DONE, JobStatus.IN_PROGRESS)).toBe(false)
  })

  test('DONE → COMPLETED is invalid (terminal state)', () => {
    expect(isValidTransition(JobStatus.DONE, JobStatus.COMPLETED)).toBe(false)
  })

  test('DONE → NEW is invalid (terminal state)', () => {
    expect(isValidTransition(JobStatus.DONE, JobStatus.NEW)).toBe(false)
  })
})

describe('jobStatus utility - getTransitionErrorMessage()', () => {
  // Test error messages for terminal states
  test('returns correct error message for COMPLETED terminal state', () => {
    const errorMsg = getTransitionErrorMessage(
      JobStatus.COMPLETED,
      JobStatus.IN_PROGRESS
    )
    expect(errorMsg).toContain('ไม่สามารถเปลี่ยนสถานะจาก COMPLETED')
    expect(errorMsg).toContain('IN_PROGRESS')
    expect(errorMsg).toContain('งานเสร็จสิ้นแล้ว')
  })

  test('returns correct error message for CANCELLED terminal state', () => {
    const errorMsg = getTransitionErrorMessage(
      JobStatus.CANCELLED,
      JobStatus.IN_PROGRESS
    )
    expect(errorMsg).toContain('ไม่สามารถเปลี่ยนสถานะจาก CANCELLED')
    expect(errorMsg).toContain('IN_PROGRESS')
    expect(errorMsg).toContain('งานถูกยกเลิกแล้ว')
  })

  test('returns correct error message for DONE terminal state (legacy)', () => {
    const errorMsg = getTransitionErrorMessage(
      JobStatus.DONE,
      JobStatus.IN_PROGRESS
    )
    expect(errorMsg).toContain('ไม่สามารถเปลี่ยนสถานะจาก DONE')
    expect(errorMsg).toContain('งานเสร็จสิ้นแล้ว')
  })

  // Test error messages for invalid non-terminal transitions
  test('returns error message with valid next statuses for NEW → IN_PROGRESS', () => {
    const errorMsg = getTransitionErrorMessage(
      JobStatus.NEW,
      JobStatus.IN_PROGRESS
    )
    expect(errorMsg).toContain('ไม่สามารถเปลี่ยนสถานะจาก NEW')
    expect(errorMsg).toContain('IN_PROGRESS')
    expect(errorMsg).toContain('สถานะถัดไปที่ถูกต้อง')
    expect(errorMsg).toContain('ASSIGNED')
    expect(errorMsg).toContain('CANCELLED')
  })

  test('returns error message with valid next statuses for ASSIGNED → COMPLETED', () => {
    const errorMsg = getTransitionErrorMessage(
      JobStatus.ASSIGNED,
      JobStatus.COMPLETED
    )
    expect(errorMsg).toContain('ไม่สามารถเปลี่ยนสถานะจาก ASSIGNED')
    expect(errorMsg).toContain('COMPLETED')
    expect(errorMsg).toContain('สถานะถัดไปที่ถูกต้อง')
    expect(errorMsg).toContain('IN_PROGRESS')
    expect(errorMsg).toContain('CANCELLED')
  })

  test('returns error message with valid next statuses for ON_HOLD → COMPLETED', () => {
    const errorMsg = getTransitionErrorMessage(
      JobStatus.ON_HOLD,
      JobStatus.COMPLETED
    )
    expect(errorMsg).toContain('ไม่สามารถเปลี่ยนสถานะจาก ON_HOLD')
    expect(errorMsg).toContain('COMPLETED')
    expect(errorMsg).toContain('สถานะถัดไปที่ถูกต้อง')
    expect(errorMsg).toContain('IN_PROGRESS')
    expect(errorMsg).toContain('CANCELLED')
  })
})

describe('jobStatus utility - isTerminalStatus()', () => {
  // Test terminal statuses
  test('COMPLETED is a terminal status', () => {
    expect(isTerminalStatus(JobStatus.COMPLETED)).toBe(true)
  })

  test('DONE is a terminal status (legacy)', () => {
    expect(isTerminalStatus(JobStatus.DONE)).toBe(true)
  })

  test('CANCELLED is a terminal status', () => {
    expect(isTerminalStatus(JobStatus.CANCELLED)).toBe(true)
  })

  // Test non-terminal statuses
  test('NEW is not a terminal status', () => {
    expect(isTerminalStatus(JobStatus.NEW)).toBe(false)
  })

  test('ASSIGNED is not a terminal status', () => {
    expect(isTerminalStatus(JobStatus.ASSIGNED)).toBe(false)
  })

  test('IN_PROGRESS is not a terminal status', () => {
    expect(isTerminalStatus(JobStatus.IN_PROGRESS)).toBe(false)
  })

  test('ON_HOLD is not a terminal status', () => {
    expect(isTerminalStatus(JobStatus.ON_HOLD)).toBe(false)
  })
})

describe('jobStatus utility - getTerminalStatuses()', () => {
  test('returns all three terminal statuses', () => {
    const terminalStatuses = getTerminalStatuses()
    expect(terminalStatuses).toHaveLength(3)
    expect(terminalStatuses).toContain(JobStatus.COMPLETED)
    expect(terminalStatuses).toContain(JobStatus.DONE)
    expect(terminalStatuses).toContain(JobStatus.CANCELLED)
  })

  test('does not include non-terminal statuses', () => {
    const terminalStatuses = getTerminalStatuses()
    expect(terminalStatuses).not.toContain(JobStatus.NEW)
    expect(terminalStatuses).not.toContain(JobStatus.ASSIGNED)
    expect(terminalStatuses).not.toContain(JobStatus.IN_PROGRESS)
    expect(terminalStatuses).not.toContain(JobStatus.ON_HOLD)
  })
})