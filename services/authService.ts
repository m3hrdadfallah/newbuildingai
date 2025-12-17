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

// --- Authentication Methods ---

// 1. Google Sign-In
export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  // اضافه کردن زبان فارسی به رابط گوگل
  auth.languageCode = 'fa';
  return await signInWithPopup(auth, provider);
};

// 2. Register with Email & Password
export const registerWithEmail = async (email: string, password: string, fullName: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  
  if (userCredential.user) {
      await updateProfile(userCredential.user, {
        displayName: fullName
      });
  }
  return userCredential.user;
};

// 3. Sign In with Email & Password
export const signIn = async (email: string, password: string) => {
  return await signInWithEmailAndPassword(auth, email, password);
};

// 4. Password Reset
export const resetPassword = async (email: string) => {
  return await sendPasswordResetEmail(auth, email);
};

// 5. Sign Out
export const signOut = async () => {
  return await firebaseSignOut(auth);
};