import { NextRequest } from 'next/server'

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}

export interface RateLimitConfig {
  interval: number // Time window in milliseconds
  uniqueTokenPerInterval: number // Max requests per interval
}

export function rateLimit(config: RateLimitConfig) {
  return {
    check: (
      request: NextRequest,
      limit: number = config.uniqueTokenPerInterval
    ) => {
      const token = getClientIdentifier(request)
      const now = Date.now()
      const windowStart = now - config.interval

      // Clean up old entries
      Object.keys(store).forEach((key) => {
        if (store[key].resetTime < windowStart) {
          delete store[key]
        }
      })

      const tokenData = store[token]

      if (!tokenData || tokenData.resetTime < windowStart) {
        store[token] = {
          count: 1,
          resetTime: now + config.interval,
        }
        return {
          success: true,
          limit,
          remaining: limit - 1,
          reset: new Date(now + config.interval),
        }
      }

      if (tokenData.count >= limit) {
        return {
          success: false,
          limit,
          remaining: 0,
          reset: new Date(tokenData.resetTime),
        }
      }

      tokenData.count++
      return {
        success: true,
        limit,
        remaining: limit - tokenData.count,
        reset: new Date(tokenData.resetTime),
      }
    },
  }
}

function getClientIdentifier(request: NextRequest): string {
  // Use forwarded IP if available (for proxy setups), otherwise use direct IP
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : request.ip || 'unknown'

  // For development, include user agent to differentiate between different browser sessions
  const userAgent = request.headers.get('user-agent') || 'unknown'

  return `${ip}-${userAgent.slice(0, 50)}` // Limit user agent length
}

// Pre-configured rate limiters for different endpoints
export const authRateLimit = rateLimit({
  interval: 15 * 60 * 1000, // 15 minutes
  uniqueTokenPerInterval: 5, // 5 attempts per 15 minutes
})

export const generalRateLimit = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 60, // 60 requests per minute
})
