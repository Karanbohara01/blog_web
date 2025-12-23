import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Use Node.js runtime for middleware to avoid crypto issues
export const runtime = 'nodejs';

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Protected routes that require authentication
    const protectedRoutes = ['/create', '/messages', '/settings', '/notifications'];

    // Auth routes (login/register) - redirect to home if already logged in
    const authRoutes = ['/login', '/register'];

    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
    const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

    // Check for session cookie
    const sessionCookie = request.cookies.get('authjs.session-token') ||
        request.cookies.get('__Secure-authjs.session-token');
    const isLoggedIn = !!sessionCookie;

    if (isProtectedRoute && !isLoggedIn) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(loginUrl);
    }

    if (isAuthRoute && isLoggedIn) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
