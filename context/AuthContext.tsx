import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextType {
    user: User | null;
    login: (username: string) => void;
    logout: () => void;
    handleMockPayment: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);

    const login = (username: string) => {
        // Mock Login
        const isPro = username === 'admin';
        setUser({
            id: 'u1',
            username,
            name: isPro ? 'مدیر ارشد پروژه' : 'کارشناس کنترل پروژه',
            role: isPro ? 'Manager' : 'Viewer',
            plan: isPro ? 'Pro' : 'Free',
            subscriptionExpiry: isPro ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : undefined,
            quota: {
                used: isPro ? 45 : 5,
                limit: isPro ? 1000 : 20
            }
        });
    };

    const logout = () => {
        setUser(null);
    };

    const handleMockPayment = () => {
        if (user) {
            setUser({
                ...user,
                plan: 'Pro',
                subscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                quota: {
                    used: 0,
                    limit: 1000
                }
            });
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, handleMockPayment, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};