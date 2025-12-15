import { auth } from '../firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
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

// 3. Google Sign In
export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  // Using popup method as requested
  return await signInWithPopup(auth, provider);
};

// 4. Phone Authentication (OTP)
export const setupRecaptcha = (elementId: string) => {
  // Clear existing verifier if any to prevent duplicates
  if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
  }
  
  return new RecaptchaVerifier(auth, elementId, {
    'size': 'invisible',
    'callback': () => {
      // reCAPTCHA solved - allow signInWithPhoneNumber.
    }
  });
};

export const sendOtpToPhone = async (phoneNumber: string, appVerifier: RecaptchaVerifier) => {
  return await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
};

// 5. Password Reset
export const resetPassword = async (email: string) => {
  return await sendPasswordResetEmail(auth, email);
};

// 6. Sign Out
export const signOut = async () => {
  return await firebaseSignOut(auth);
};