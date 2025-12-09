import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Get token from cookies
    const token = request.cookies.get('auth_token')?.value;

    // Define all protected dashboard routes
    const isSuperAdminRoute = request.nextUrl.pathname.startsWith('/dashboard/superadmin');
    const isAdminRoute = request.nextUrl.pathname.startsWith('/dashboard/admin');
    const isInstructorRoute = request.nextUrl.pathname.startsWith('/dashboard/instructor');
    const isStudentRoute = request.nextUrl.pathname.startsWith('/dashboard/student');

    // Any dashboard route is protected
    const isProtectedRoute = isSuperAdminRoute || isAdminRoute || isInstructorRoute || isStudentRoute;

    // Auth pages (login/signup)
    const isAuthRoute = request.nextUrl.pathname.startsWith('/login') ||
        request.nextUrl.pathname.startsWith('/signup');

    // RULE 1: Block access to protected routes without token
    if (isProtectedRoute && !token) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
        return NextResponse.redirect(loginUrl);
    }

    // RULE 2: Redirect authenticated users away from login/signup
    if (isAuthRoute && token) {
        return NextResponse.redirect(new URL('/dashboard/student/courses', request.url));
    }

    // RULE 3: Allow request to continue
    return NextResponse.next();
}

// Run middleware on all dashboard routes and auth pages
export const config = {
    matcher: [
        '/dashboard/superadmin/:path*',
        '/dashboard/admin/:path*',
        '/dashboard/instructor/:path*',
        '/dashboard/student/:path*',
        '/login',
        '/signup',
    ],
};
