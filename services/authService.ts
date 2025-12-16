import { auth } from '../firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  User
} from "firebase/auth";

// --- Standard Authentication Methods ---

// 1. Register with Email & Password
export const registerWithEmail = async (email: string, password: string, fullName: string): Promise<User> => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  
  // Update display name immediately
  if (userCredential.user) {
      await updateProfile(userCredential.user, {
        displayName: fullName
      });
  }
  return userCredential.user;
};

// 2. Sign In with Email & Password
export const signIn = async (email: string, password: string) => {
  // Using standard firebase method
  return await signInWithEmailAndPassword(auth, email, password);
};

// 3. Password Reset
export const resetPassword = async (email: string) => {
  return await sendPasswordResetEmail(auth, email);
};

// 4. Sign Out
export const signOut = async () => {
  return await firebaseSignOut(auth);
};