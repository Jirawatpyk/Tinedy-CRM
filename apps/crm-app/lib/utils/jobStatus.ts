/**
 * Job Status State Machine Utility
 *
 * Defines valid status transitions for jobs in the Tinedy CRM system.
 * Used for both frontend (UX filtering) and backend (security validation).
 *
 * @module jobStatus
 */

import { JobStatus } from '@/lib/db'

/**
 * Status Transition Rules (State Machine)
 *
 * - NEW: Initial status when job is created
 *   → Can transition to: ASSIGNED, CANCELLED
 *
 * - ASSIGNED: Job has been assigned to a team member
 *   → Can transition to: IN_PROGRESS, CANCELLED
 *
 * - IN_PROGRESS: Work has started
 *   → Can transition to: COMPLETED, ON_HOLD, CANCELLED
 *
 * - ON_HOLD: Job temporarily paused
 *   → Can transition to: IN_PROGRESS, CANCELLED
 *
 * - COMPLETED: Work finished successfully (TERMINAL STATE)
 *   → Cannot transition (terminal state)
 *
 * - DONE: Legacy status, treated as COMPLETED (TERMINAL STATE)
 *   → Cannot transition (terminal state)
 *
 * - CANCELLED: Job was cancelled (TERMINAL STATE)
 *   → Cannot transition (terminal state)
 */

/**
 * Status transition map defining valid next statuses for each current status
 */
const STATUS_TRANSITIONS: Record<JobStatus, JobStatus[]> = {
  NEW: ['ASSIGNED', 'CANCELLED'],
  ASSIGNED: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['COMPLETED', 'ON_HOLD', 'CANCELLED'],
  ON_HOLD: ['IN_PROGRESS', 'CANCELLED'],
  COMPLETED: [], // Terminal state
  DONE: [], // Terminal state (legacy)
  CANCELLED: [], // Terminal state
}

/**
 * Get all valid next statuses for a given current status
 *
 * @param currentStatus - The current job status
 * @returns Array of valid next statuses that the job can transition to
 *
 * @example
 * ```typescript
 * const validStatuses = getValidNextStatuses('NEW')
 * // Returns: ['ASSIGNED', 'CANCELLED']
 *
 * const completedNextStatuses = getValidNextStatuses('COMPLETED')
 * // Returns: [] (terminal state, no transitions allowed)
 * ```
 */
export function getValidNextStatuses(currentStatus: JobStatus): JobStatus[] {
  return STATUS_TRANSITIONS[currentStatus] || []
}

/**
 * Check if a status transition is valid according to the state machine rules
 *
 * @param fromStatus - The current status
 * @param toStatus - The target status
 * @returns true if the transition is valid, false otherwise
 *
 * @example
 * ```typescript
 * isValidTransition('NEW', 'ASSIGNED') // true
 * isValidTransition('NEW', 'COMPLETED') // false
 * isValidTransition('COMPLETED', 'IN_PROGRESS') // false (terminal state)
 * ```
 */
export function isValidTransition(
  fromStatus: JobStatus,
  toStatus: JobStatus
): boolean {
  // Same status is always allowed (no-op)
  if (fromStatus === toStatus) {
    return true
  }

  const validNextStatuses = getValidNextStatuses(fromStatus)
  return validNextStatuses.includes(toStatus)
}

/**
 * Get a human-readable error message for an invalid status transition
 *
 * @param fromStatus - The current status
 * @param toStatus - The attempted target status
 * @returns Error message describing why the transition is invalid
 *
 * @example
 * ```typescript
 * getTransitionErrorMessage('COMPLETED', 'IN_PROGRESS')
 * // Returns: "ไม่สามารถเปลี่ยนสถานะจาก COMPLETED ไปเป็น IN_PROGRESS ได้ เนื่องจากงานเสร็จสิ้นแล้ว (สถานะสุดท้าย)"
 * ```
 */
export function getTransitionErrorMessage(
  fromStatus: JobStatus,
  toStatus: JobStatus
): string {
  // Check if current status is a terminal state
  const isTerminalState = getValidNextStatuses(fromStatus).length === 0

  if (isTerminalState) {
    const terminalStateMessages: Record<string, string> = {
      COMPLETED: 'เนื่องจากงานเสร็จสิ้นแล้ว (สถานะสุดท้าย)',
      DONE: 'เนื่องจากงานเสร็จสิ้นแล้ว (สถานะสุดท้าย)',
      CANCELLED: 'เนื่องจากงานถูกยกเลิกแล้ว (สถานะสุดท้าย)',
    }

    return `ไม่สามารถเปลี่ยนสถานะจาก ${fromStatus} ไปเป็น ${toStatus} ได้ ${terminalStateMessages[fromStatus] || ''}`
  }

  // Get valid next statuses for context
  const validStatuses = getValidNextStatuses(fromStatus)
  const validStatusesText = validStatuses.join(', ')

  return `ไม่สามารถเปลี่ยนสถานะจาก ${fromStatus} ไปเป็น ${toStatus} ได้ สถานะถัดไปที่ถูกต้อง: ${validStatusesText}`
}

/**
 * Check if a status is a terminal state (cannot transition to any other status)
 *
 * @param status - The status to check
 * @returns true if the status is terminal, false otherwise
 */
export function isTerminalStatus(status: JobStatus): boolean {
  return getValidNextStatuses(status).length === 0
}

/**
 * Get all terminal statuses
 *
 * @returns Array of all terminal job statuses
 */
export function getTerminalStatuses(): JobStatus[] {
  return Object.keys(STATUS_TRANSITIONS).filter(
    (status) => getValidNextStatuses(status as JobStatus).length === 0
  ) as JobStatus[]
}
