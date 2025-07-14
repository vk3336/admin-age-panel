import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname

  // Allow access to login page and static assets without authentication
  if (path === '/login' || path.startsWith('/_next') || path.startsWith('/api') || path.includes('.') || path === '/') {
    return NextResponse.next()
  }

  // Check for authentication cookie
  const authCookie = request.cookies.get('admin-auth')
  
  // If no auth cookie or invalid auth, redirect to login
  if (!authCookie || authCookie.value !== 'true') {
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  // If authenticated, allow access
  return NextResponse.next()
}

// Optimize middleware to run only on necessary routes
export const config = {
  matcher: [
    // Match all routes except static files and API routes
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
} 