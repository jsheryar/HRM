
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // The login page is a public path
  const isPublicPath = path === '/login'

  // In a real app, you'd check a secure, httpOnly cookie.
  // For this prototype, we're checking a cookie that the client-side code sets.
  const token = request.cookies.get('user')?.value
  const isAuthenticated = !!token

  if (isPublicPath && isAuthenticated) {
    // If the user is authenticated, redirect them from the login page to the dashboard.
    // The specific dashboard is handled by the AuthProvider on the client side.
    return NextResponse.redirect(new URL('/', request.nextUrl))
  }

  if (!isPublicPath && !isAuthenticated) {
    // If the user is not authenticated and trying to access a protected page,
    // redirect them to the login page.
    return NextResponse.redirect(new URL('/login', request.nextUrl))
  }

  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
