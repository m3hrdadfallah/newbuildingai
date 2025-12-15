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
  updateProfile
} from "firebase/auth";

// ثبت نام با ایمیل و نام کامل
export const registerWithEmail = async (email: string, password: string, fullName: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  // بلافاصله نام کاربر را در پروفایل Auth آپدیت می‌کنیم
  await updateProfile(userCredential.user, {
    displayName: fullName
  });
  return userCredential.user;
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
    'size': 'invisible',
    'callback': () => {
      // reCAPTCHA solved
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