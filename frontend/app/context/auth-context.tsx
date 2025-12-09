"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { storage } from '@/lib/storage';
import { isTokenExpired, getRoleBasedRedirect } from '@/lib/auth';
import { AuthAPI, User } from '@/lib/api';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (data: SignupData) => Promise<void>;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

interface SignupData {
    name: string;
    email: string;
    password: string;
    passwordConfirm: string;
    role: 'student' | 'instructor';
    institution?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    // State variables
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const isAuthenticated = !!user;

    useEffect(() => {
        const initAuth = async () => {
            try {
                const token = storage.getToken();

                if (!token || isTokenExpired(token)) {
                    storage.clearAuth();
                    setUser(null);
                    setIsLoading(false);
                    return;
                }

                const storedUser = storage.getUser();

                if (storedUser) {
                    setUser(storedUser);
                } else {
                    try {
                        const currentUser = await AuthAPI.getCurrentUser();
                        storage.setUser(currentUser);
                        setUser(currentUser);
                    } catch (error) {
                        storage.clearAuth();
                        setUser(null);
                    }
                }
            } catch (error) {
                console.error('Auth initialization error:', error);
                storage.clearAuth();
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        initAuth();
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        try {
            const response = await AuthAPI.login(email, password);

            if (response.token && response.data?.user) {
                // Store token and user
                storage.setToken(response.token);
                storage.setUser(response.data.user);
                setUser(response.data.user);

                // Redirect to role-based dashboard
                const redirectPath = getRoleBasedRedirect(response.data.user.role);
                router.push(redirectPath);
            } else {
                throw new Error('Invalid response from server');
            }
        } catch (error: any) {
            console.error('Login error:', error);
            throw error;
        }
    }, [router]);

    const signup = useCallback(async (data: SignupData) => {
        try {
            const response = await AuthAPI.signup(data);

            if (response.token && response.data?.user) {
                // Store token and user
                storage.setToken(response.token);
                storage.setUser(response.data.user);
                setUser(response.data.user);

                // Redirect to role-based dashboard
                const redirectPath = getRoleBasedRedirect(response.data.user.role);
                router.push(redirectPath);
            } else {
                throw new Error('Invalid response from server');
            }
        } catch (error: any) {
            console.error('Signup error:', error);
            throw error;
        }
    }, [router]);

    const logout = useCallback(() => {
        // Clear all auth data
        storage.clearAuth();
        setUser(null);

        // Redirect to login
        router.push('/login');
    }, [router]);

    const refreshUser = useCallback(async () => {
        try {
            const token = storage.getToken();

            if (!token || isTokenExpired(token)) {
                logout();
                return;
            }

            const currentUser = await AuthAPI.getCurrentUser();
            storage.setUser(currentUser);
            setUser(currentUser);
        } catch (error) {
            console.error('Error refreshing user:', error);
            logout();
        }
    }, [logout]);

    const value: AuthContextType = {
        user,
        isAuthenticated,
        isLoading,
        login,
        signup,
        logout,
        refreshUser,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}