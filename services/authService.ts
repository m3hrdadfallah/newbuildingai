import { auth } from '../firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  User as FirebaseUser
} from "firebase/auth";

// ثبت نام
export const signUp = async (email: string, password: string) => {
  return await createUserWithEmailAndPassword(auth, email, password);
};

// ورود
export const signIn = async (email: string, password: string) => {
  return await signInWithEmailAndPassword(auth, email, password);
};

// خروج
export const signOut = async () => {
  return await firebaseSignOut(auth);
};

// دریافت کاربر فعلی
export const getCurrentUser = (): FirebaseUser | null => {
  return auth.currentUser;
};
