import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const { pathname } = request.nextUrl

  // Define public routes that do not require authentication
  const publicRoutes = [
    '/sign-in',
    '/sign-up',
    '/forgot-password',
    '/forgot-password-2',
    '/forgot-password-3',
    '/sign-in-2',
    '/sign-in-3',
    '/sign-up-2',
    '/sign-up-3',
    '/errors',
    '/landing',
    '/location-picker'
  ]

  // Check if the current route is public
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

  // 1. If user has token and tries to access auth routes, redirect to dashboard
  if (token && isPublicRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // 2. If user does NOT have token and tries to access a protected route (non-public), redirect to sign-in
  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }

  // 3. Handle root path - redirect to dashboard (which is protected, so valid token will stay, invalid will cycle to sign-in)
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
}
