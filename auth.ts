import { auth } from './firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";

// ثبت نام
export const signUp = async (email, password) => {
  return await createUserWithEmailAndPassword(auth, email, password);
};

// ورود
export const signIn = async (email, password) => {
  return await signInWithEmailAndPassword(auth, email, password);
};
