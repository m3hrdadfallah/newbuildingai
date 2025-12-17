import React, { createContext, useContext, useEffect, useState } from 'react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { logoutUser, MockUser } from './auth';

interface UserData extends MockUser {
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
    const checkAuth = async () => {
      const savedUser = localStorage.getItem('sazyar_user');
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser) as MockUser;
          let userData: UserData = {
            ...parsedUser,
            name: parsedUser.displayName,
            username: parsedUser.email.split('@')[0],
            quota: { used: 0, limit: 20 }
          };

          // تلاش برای دریافت متادیتای اضافی از Firestore (اختیاری)
          try {
            const userRef = doc(db, "users", parsedUser.uid);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
              userData = { ...userData, ...userSnap.data() };
            } else {
              await setDoc(userRef, userData, { merge: true });
            }
          } catch (e) {
            console.warn("Firestore access skipped or failed (offline mode or permission issue)");
          }

          setUser(userData);
        } catch (e) {
          console.error("Auth initialization error:", e);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const logout = async () => {
    await logoutUser();
    setUser(null);
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
      localStorage.setItem('sazyar_user', JSON.stringify(updatedUser));
      
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