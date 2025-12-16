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
                    // Try to get existing user data from Firestore
                    const userData = await getUserData(firebaseUser.uid);
                    
                    if (mounted) {
                        if (userData) {
                            // User exists in Firestore
                            setUser({ ...userData, id: firebaseUser.uid });
                        } else {
                            // New User -> Sync to Firestore
                            const displayName = firebaseUser.displayName || 'کاربر جدید';
                            const username = firebaseUser.email || firebaseUser.uid;

                            const newUser: User = {
                                id: firebaseUser.uid,
                                username: username,
                                email: firebaseUser.email || undefined,
                                name: displayName,
                                role: 'Viewer',
                                plan: 'Free',
                                quota: { used: 0, limit: 20 }
                            };
                            
                            // Save to Firestore
                            try {
                                await saveUserData(firebaseUser.uid, newUser);
                                setUser(newUser);
                            } catch (saveError) {
                                console.error("Error creating user in Firestore:", saveError);
                                // Fallback to memory user so app doesn't crash
                                setUser(newUser);
                            }
                        }
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                    // Minimal fallback
                    setUser({
                        id: firebaseUser.uid,
                        username: firebaseUser.email || 'unknown',
                        name: firebaseUser.displayName || 'کاربر مهمان',
                        role: 'Viewer',
                        plan: 'Free'
                    });
                }
            } else {
                if (mounted) setUser(null);
            }
            if (mounted) setLoading(false);
        });

        return () => {
            mounted = false;
            unsubscribe();
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
            <div className="flex h-screen items-center justify-center bg-gray-50 dir-rtl">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">در حال احراز هویت...</p>
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