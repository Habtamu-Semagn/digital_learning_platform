import { storage } from './storage';

/**
 * Decode JWT token to extract payload
 */
export function decodeToken(token: string) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: string | null): boolean {
    if (!token) return true;

    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return true;

    // Check if token expiration time is in the past
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
}

/**
 * Check if user is authenticated (has valid token)
 */
export function isAuthenticated(): boolean {
    const token = storage.getToken();
    return token !== null && !isTokenExpired(token);
}

/**
 * Get current user from storage
 */
export function getCurrentUser() {
    if (!isAuthenticated()) {
        return null;
    }
    return storage.getUser();
}

/**
 * Check if user has one of the required roles
 */
export function hasRole(...roles: string[]): boolean {
    const user = getCurrentUser();
    if (!user || !user.role) return false;
    return roles.includes(user.role);
}

/**
 * Get redirect path based on user role
 */
export function getRoleBasedRedirect(role: string): string {
    const redirectPaths: Record<string, string> = {
        superadmin: '/dashboard/superadmin/all-users',
        admin: '/dashboard/admin/courses',
        instructor: '/dashboard/instructor/courses',
        student: '/dashboard/student/courses',
        user: '/dashboard/student/courses',
    };

    return redirectPaths[role] || '/dashboard/student/courses';
}
