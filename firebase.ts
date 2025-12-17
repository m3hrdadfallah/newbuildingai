// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCf5NGycTd_K2ntf-Nd1uiWd7NfEFJVq28",
  authDomain: "sazyarweb.firebaseapp.com",
  projectId: "sazyarweb",
  storageBucket: "sazyarweb.firebasestorage.app",
  messagingSenderId: "196151116296",
  appId: "1:196151116296:web:07e170fe1ec874ddd047bd",
  measurementId: "G-174BXSNCSW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);