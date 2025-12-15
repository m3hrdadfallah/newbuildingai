import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { auth } from '../firebase';
import { onAuthStateChanged } from "firebase/auth";
import { signOut } from '../services/authService';
import { getUserData, saveUserData } from '../services/firestoreService';
import { Loader2 } from 'lucide-react';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    logout: () => void;
    handleMockPayment: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (!mounted) return;
            if (firebaseUser) {
                try {
                    const userData = await getUserData(firebaseUser.uid);
                    if (mounted) {
                        if (userData) {
                            setUser({ ...userData, id: firebaseUser.uid });
                        } else {
                            const newUser: User = {
                                id: firebaseUser.uid,
                                username: firebaseUser.email || 'user',
                                name: firebaseUser.displayName || 'کاربر جدید',
                                role: 'Viewer',
                                plan: 'Free',
                                quota: { used: 0, limit: 20 }
                            };
                            await saveUserData(firebaseUser.uid, newUser);
                            setUser(newUser);
                        }
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                }
            } else {
                if (mounted) setUser(null);
            }
            if (mounted) setLoading(false);
        });

        // Failsafe: Turn off loading after 3 seconds if Firebase hangs
        const timer = setTimeout(() => {
            if (mounted && loading) {
                console.warn("Auth timeout - forcing load completion");
                setLoading(false);
            }
        }, 3000);

        return () => {
            mounted = false;
            unsubscribe();
            clearTimeout(timer);
        };
    }, []);

    const logout = async () => {
        await signOut();
        setUser(null);
    };

    const handleMockPayment = () => {
        if (user && auth.currentUser) {
            const updatedUser: User = {
                ...user,
                plan: 'Pro',
                subscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                quota: {
                    used: 0,
                    limit: 1000
                }
            };
            setUser(updatedUser);
            saveUserData(auth.currentUser.uid, {
                 plan: 'Pro',
                 subscriptionExpiry: updatedUser.subscriptionExpiry,
                 quota: updatedUser.quota
            });
        }
    };

    // Render loading state
    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">در حال اتصال به سازیار...</p>
                </div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ user, loading, logout, handleMockPayment, isAuthenticated: !!user }}>
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