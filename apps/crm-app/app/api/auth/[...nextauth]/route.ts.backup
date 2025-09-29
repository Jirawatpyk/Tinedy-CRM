import { handlers } from '@/auth'
import { authRateLimit } from '@/lib/rate-limit'
import { NextRequest, NextResponse } from 'next/server'

// Apply rate limiting to POST requests (login attempts)
async function rateLimitedPOST(request: NextRequest) {
  const result = authRateLimit.check(request)

  if (!result.success) {
    return NextResponse.json(
      {
        error: 'Too many authentication attempts. Please try again later.',
        retryAfter: Math.ceil((result.reset.getTime() - Date.now()) / 1000),
      },
      {
        status: 429,
        headers: {
          'Retry-After': Math.ceil(
            (result.reset.getTime() - Date.now()) / 1000
          ).toString(),
          'X-RateLimit-Limit': result.limit.toString(),
          'X-RateLimit-Remaining': result.remaining.toString(),
          'X-RateLimit-Reset': result.reset.getTime().toString(),
        },
      }
    )
  }

  // If rate limit check passes, proceed with NextAuth handler
  return handlers.POST(request)
}

export const GET = handlers.GET
export const POST = rateLimitedPOST
