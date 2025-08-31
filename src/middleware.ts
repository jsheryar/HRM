
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Allow requests for API routes, static files, and image optimization
  if (pathname.startsWith('/api') || pathname.startsWith('/_next') || pathname.includes('.')) {
    return NextResponse.next()
  }

  // Allow the login page to be accessed
  if (pathname === '/login') {
    return NextResponse.next()
  }

  // For all other routes, we will rely on the client-side check in AuthProvider
  // and AppLayout for redirection. This avoids server-side redirects that
  // can conflict with client-side routing and state management.
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
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
