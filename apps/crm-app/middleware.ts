import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow access to public routes, login page, unauthorized page, and API routes
  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/api/') ||
    pathname === '/unauthorized' ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname === '/'
  ) {
    return NextResponse.next()
  }

  // Check for authentication token in cookies
  const sessionToken =
    request.cookies.get('authjs.session-token') ||
    request.cookies.get('__Secure-authjs.session-token')

  // Redirect to login if no session token found
  if (!sessionToken) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // For now, allow authenticated users to access all routes
  // Role-based checking will be handled in individual pages/API routes
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next|.*\..*).*)', '/'],
}
