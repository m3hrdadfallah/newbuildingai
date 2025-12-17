import { auth } from '../firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail, 
  signOut as firebaseSignOut, 
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";

/**
 * ورود با اکانت گوگل
 */
export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  auth.languageCode = 'fa';
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error("Google Sign-In Error:", error);
    throw error;
  }
};

/**
 * ثبت‌نام با ایمیل و رمز عبور
 */
export const registerWithEmail = async (email: string, password: string, fullName: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  
  if (userCredential.user) {
      await updateProfile(userCredential.user, {
        displayName: fullName
      });
  }
  return userCredential.user;
};

/**
 * ورود با ایمیل و رمز عبور
 */
export const signIn = async (email: string, password: string) => {
  return await signInWithEmailAndPassword(auth, email, password);
};

/**
 * فراموشی رمز عبور
 */
export const resetPassword = async (email: string) => {
  return await sendPasswordResetEmail(auth, email);
};

/**
 * خروج از حساب
 */
export const signOut = async () => {
  return await firebaseSignOut(auth);
};