import { auth } from '../firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail, 
  signOut as firebaseSignOut, 
  updateProfile
} from "firebase/auth";

/**
 * سیستم احراز هویت ایمیل/رمز عبور
 * این متدها از Firebase استفاده می‌کنند اما به دلیل استفاده از esm.sh 
 * احتمال بلاک شدن آن‌ها در شبکه ایران بسیار کمتر است.
 */

export const registerWithEmail = async (email: string, password: string, fullName: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    if (userCredential.user) {
      await updateProfile(userCredential.user, { displayName: fullName });
    }
    return userCredential.user;
  } catch (error) {
    console.error("Registration Error:", error);
    throw error;
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error("Login Error:", error);
    throw error;
  }
};

export const resetPassword = async (email: string) => {
  return await sendPasswordResetEmail(auth, email);
};

export const signOut = async () => {
  return await firebaseSignOut(auth);
};

// متد گوگل حذف شد تا وابستگی به APIهای مسدود شده گوگل از بین برود.
