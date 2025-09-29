import { NextRequest, NextResponse } from 'next/server'

// Define role-based route protection rules (lightweight types)
type UserRole = 'ADMIN' | 'OPERATIONS' | 'TRAINING' | 'QC_MANAGER'

const PROTECTED_ROUTES: Record<string, UserRole[]> = {
  '/admin': ['ADMIN'],
  '/admin/users': ['ADMIN'],
  '/admin/settings': ['ADMIN'],
  '/manager': ['ADMIN', 'QC_MANAGER'],
  '/operations': ['ADMIN', 'OPERATIONS', 'QC_MANAGER'],
}

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
  // This reduces the middleware bundle size significantly

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)', '/'],
}
