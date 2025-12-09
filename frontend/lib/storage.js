// Token and user storage utilities using cookies
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

// Helper function to set a cookie
function setCookie(name, value, days = 7) {
    if (typeof window === 'undefined') return;

    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
}

// Helper function to get a cookie
function getCookie(name) {
    if (typeof window === 'undefined') return null;

    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

// Helper function to delete a cookie
function deleteCookie(name) {
    if (typeof window === 'undefined') return;
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
}

export const storage = {
    // Token management
    setToken(token) {
        setCookie(TOKEN_KEY, token, 7); // Store for 7 days
    },

    getToken() {
        return getCookie(TOKEN_KEY);
    },

    removeToken() {
        deleteCookie(TOKEN_KEY);
    },

    // User data management
    setUser(user) {
        setCookie(USER_KEY, JSON.stringify(user), 7);
    },

    getUser() {
        const user = getCookie(USER_KEY);
        return user ? JSON.parse(user) : null;
    },

    removeUser() {
        deleteCookie(USER_KEY);
    },

    // Clear all auth data
    clearAuth() {
        this.removeToken();
        this.removeUser();
    },
};
