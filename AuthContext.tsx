import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { logoutUser } from './auth';

interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  plan?: 'Free' | 'Pro';
  subscriptionExpiry?: string;
  quota?: {
    used: number;
    limit: number;
  };
  name?: string;
  username?: string;
}

interface AuthContextType {
  user: UserData | null;
  loading: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
  handleMockPayment: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        let userData: UserData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          plan: 'Free',
          name: firebaseUser.displayName || 'کاربر جدید',
          username: firebaseUser.email?.split('@')[0] || 'user',
          quota: { used: 0, limit: 20 }
        };

        try {
          const userRef = doc(db, "users", firebaseUser.uid);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            userData = { ...userData, ...userSnap.data() };
          } else {
            await setDoc(userRef, userData, { merge: true });
          }
          setUser(userData);
        } catch (error) {
          console.error("Firestore sync error:", error);
          setUser(userData);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await logoutUser();
  };

  const handleMockPayment = async () => {
    if (user) {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30);
      const updatedUser: UserData = { 
        ...user, 
        plan: 'Pro',
        subscriptionExpiry: expiryDate.toISOString()
      };
      setUser(updatedUser);
      
      try {
        const userRef = doc(db, "users", user.uid);
        await setDoc(userRef, { 
          plan: 'Pro', 
          subscriptionExpiry: updatedUser.subscriptionExpiry 
        }, { merge: true });
      } catch (error) {
        console.error("Failed to sync plan upgrade", error);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated: !!user, logout, handleMockPayment }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};