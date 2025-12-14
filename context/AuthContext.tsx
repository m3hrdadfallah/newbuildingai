import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { auth } from '../firebase';
import { onAuthStateChanged } from "firebase/auth";
import { signOut } from '../services/authService';
import { getUserData, saveUserData } from '../services/firestoreService';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    logout: () => void;
    handleMockPayment: () => void; // Keeping for upgrade simulation logic
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                // User is signed in
                const userData = await getUserData(firebaseUser.uid);
                
                if (userData) {
                    setUser({ ...userData, id: firebaseUser.uid });
                } else {
                    // New user, create default profile in Firestore
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
            } else {
                // User is signed out
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
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
            // Save subscription status to Firestore
            saveUserData(auth.currentUser.uid, {
                 plan: 'Pro',
                 subscriptionExpiry: updatedUser.subscriptionExpiry,
                 quota: updatedUser.quota
            });
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, logout, handleMockPayment, isAuthenticated: !!user }}>
            {!loading && children}
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