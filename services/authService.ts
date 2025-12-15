import { auth } from '../firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  User as FirebaseUser,
  GoogleAuthProvider,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  sendPasswordResetEmail,
  ConfirmationResult
} from "firebase/auth";

// ثبت نام با ایمیل
export const signUp = async (email: string, password: string) => {
  return await createUserWithEmailAndPassword(auth, email, password);
};

// ورود با ایمیل
export const signIn = async (email: string, password: string) => {
  return await signInWithEmailAndPassword(auth, email, password);
};

// ورود با گوگل
export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  return await signInWithPopup(auth, provider);
};

// آماده‌سازی ریکپچا برای ورود با موبایل
export const setupRecaptcha = (elementId: string) => {
  return new RecaptchaVerifier(auth, elementId, {
    'size': 'invisible', // یا 'normal' اگر می‌خواهید دیده شود
    'callback': () => {
      // reCAPTCHA solved, allow signInWithPhoneNumber.
    }
  });
};

// ارسال کد تایید به موبایل
export const sendOtpToPhone = async (phoneNumber: string, appVerifier: RecaptchaVerifier) => {
  return await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
};

// بازیابی رمز عبور
export const resetPassword = async (email: string) => {
  return await sendPasswordResetEmail(auth, email);
};

// خروج
export const signOut = async () => {
  return await firebaseSignOut(auth);
};

// دریافت کاربر فعلی
export const getCurrentUser = (): FirebaseUser | null => {
  return auth.currentUser;
};