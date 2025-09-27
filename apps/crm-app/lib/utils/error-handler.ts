import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { Prisma } from '@prisma/client'

export interface ApiError {
  message: string
  status: number
  code?: string
  details?: any
}

/**
 * Custom API Error class for consistent error handling
 */
export class CustomApiError extends Error {
  status: number
  code?: string
  details?: any

  constructor(message: string, status: number = 500, code?: string, details?: any) {
    super(message)
    this.name = 'CustomApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}

/**
 * Handle different types of errors and return appropriate response
 */
export function handleApiError(error: any): NextResponse {
  console.error('API Error:', error)

  // Custom API errors
  if (error instanceof CustomApiError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        details: error.details
      },
      { status: error.status }
    )
  }

  // Zod validation errors
  if (error instanceof ZodError) {
    const fieldErrors = error.errors.reduce((acc, err) => {
      if (err.path[0]) {
        acc[err.path[0] as string] = err.message
      }
      return acc
    }, {} as Record<string, string>)

    return NextResponse.json(
      {
        error: 'Validation failed',
        errors: fieldErrors
      },
      { status: 400 }
    )
  }

  // Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        // Unique constraint violation
        const field = error.meta?.target as string[]
        return NextResponse.json(
          {
            error: 'Validation failed',
            errors: {
              [field?.[0] || 'field']: `${field?.[0] || 'Field'} already exists`
            }
          },
          { status: 400 }
        )

      case 'P2025':
        // Record not found
        return NextResponse.json(
          { error: 'Record not found' },
          { status: 404 }
        )

      case 'P2003':
        // Foreign key constraint violation
        return NextResponse.json(
          {
            error: 'Cannot delete record due to related data',
            details: 'This record is referenced by other data and cannot be deleted'
          },
          { status: 400 }
        )

      default:
        return NextResponse.json(
          { error: 'Database error' },
          { status: 500 }
        )
    }
  }

  // Prisma connection errors
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return NextResponse.json(
      { error: 'Database connection failed' },
      { status: 503 }
    )
  }

  // Network/timeout errors
  if (error.name === 'AbortError') {
    return NextResponse.json(
      { error: 'Request timeout' },
      { status: 408 }
    )
  }

  // JSON parsing errors
  if (error instanceof SyntaxError && error.message.includes('JSON')) {
    return NextResponse.json(
      { error: 'Invalid JSON format' },
      { status: 400 }
    )
  }

  // Rate limiting (if implemented)
  if (error.message.includes('rate limit')) {
    return NextResponse.json(
      {
        error: 'Too many requests',
        details: 'Please try again later'
      },
      { status: 429 }
    )
  }

  // File size errors
  if (error.message.includes('payload too large')) {
    return NextResponse.json(
      {
        error: 'Request payload too large',
        details: 'Reduce the size of your request'
      },
      { status: 413 }
    )
  }

  // Generic server error
  return NextResponse.json(
    {
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    },
    { status: 500 }
  )
}

/**
 * Async error wrapper for API routes
 */
export function withErrorHandling<T extends any[], R>(
  handler: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R | NextResponse> => {
    try {
      return await handler(...args)
    } catch (error) {
      return handleApiError(error)
    }
  }
}

/**
 * Validation helper for request parameters
 */
export function validateRequiredParams(
  params: Record<string, any>,
  required: string[]
): void {
  const missing = required.filter(key => !params[key])

  if (missing.length > 0) {
    throw new CustomApiError(
      `Missing required parameters: ${missing.join(', ')}`,
      400,
      'MISSING_PARAMS',
      { missing }
    )
  }
}

/**
 * Rate limiting helper (basic implementation)
 */
const requestCounts = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 100,
  windowMs: number = 60000
): void {
  const now = Date.now()
  const record = requestCounts.get(identifier)

  if (!record || now > record.resetTime) {
    requestCounts.set(identifier, { count: 1, resetTime: now + windowMs })
    return
  }

  if (record.count >= maxRequests) {
    throw new CustomApiError(
      'Rate limit exceeded',
      429,
      'RATE_LIMIT_EXCEEDED',
      {
        maxRequests,
        windowMs,
        resetTime: record.resetTime
      }
    )
  }

  record.count++
}