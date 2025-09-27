import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import { UserRole } from '@tinedy/types'

// Define role-based route protection rules
const PROTECTED_ROUTES: Record<string, UserRole[]> = {
  '/admin': ['ADMIN'],
  '/admin/users': ['ADMIN'],
  '/admin/settings': ['ADMIN'],
  '/manager': ['ADMIN', 'QC_MANAGER'],
  '/operations': ['ADMIN', 'OPERATIONS', 'QC_MANAGER'],
}

export default auth((req) => {
  const { pathname } = req.nextUrl

  // Allow access to login page, unauthorized page, and API routes
  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/api/') ||
    pathname === '/unauthorized'
  ) {
    return NextResponse.next()
  }

  // Redirect to login if not authenticated
  if (!req.auth && pathname !== '/login') {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Check role-based access for protected routes
  if (req.auth) {
    for (const [route, allowedRoles] of Object.entries(PROTECTED_ROUTES)) {
      if (pathname.startsWith(route)) {
        const userRole = req.auth.user?.role as UserRole

        if (!userRole || !allowedRoles.includes(userRole)) {
          return NextResponse.redirect(new URL('/unauthorized', req.url))
        }
      }
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}
