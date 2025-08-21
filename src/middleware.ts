
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const isPublicPath = path === '/login'

  // This is a placeholder for checking if the user is authenticated
  // In a real app, you'd check a token in the cookies
  const isAuthenticated = request.cookies.get('user-token')?.value === 'true'

  if (isPublicPath && isAuthenticated) {
    return NextResponse.redirect(new URL('/', request.nextUrl))
  }

  if (!isPublicPath && !isAuthenticated) {
     // Check if the route is an API, static file, or image optimization route
    if (path.startsWith('/api') || path.startsWith('/_next') || path.includes('.')) {
      return NextResponse.next()
    }
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
