/**
 * Unit tests for the optimized middleware
 */

import { NextRequest } from 'next/server'
import { middleware } from '../middleware'

// Mock NextResponse
jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    next: jest.fn(() => ({ type: 'next' })),
    redirect: jest.fn((url) => ({ type: 'redirect', url })),
  },
}))

describe('Optimized Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should allow public routes', () => {
    const request = {
      nextUrl: { pathname: '/login' },
      cookies: { get: jest.fn() },
    } as any

    const result = middleware(request)
    expect(result.type).toBe('next')
  })

  it('should allow API routes', () => {
    const request = {
      nextUrl: { pathname: '/api/customers' },
      cookies: { get: jest.fn() },
    } as any

    const result = middleware(request)
    expect(result.type).toBe('next')
  })

  it('should redirect to login when no session token', () => {
    const request = {
      nextUrl: { pathname: '/dashboard' },
      url: 'http://localhost:3000/dashboard',
      cookies: { get: jest.fn().mockReturnValue(undefined) },
    } as any

    const result = middleware(request)
    expect(result.type).toBe('redirect')
    expect(result.url.toString()).toMatch(/login/)
  })

  it('should allow access when session token exists', () => {
    const request = {
      nextUrl: { pathname: '/dashboard' },
      cookies: {
        get: jest.fn().mockReturnValue({ value: 'valid-token' })
      },
    } as any

    const result = middleware(request)
    expect(result.type).toBe('next')
  })
})