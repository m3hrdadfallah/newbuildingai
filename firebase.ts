import * as firebaseApp from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDbOU4cvMDzHaX_OfF4qQpXOS0-iQTB-ik",
  authDomain: "sazyarapp.firebaseapp.com",
  projectId: "sazyarapp",
  storageBucket: "sazyarapp.firebasestorage.app",
  messagingSenderId: "200546815732",
  appId: "1:200546815732:web:a3548a43e25cccac2a98a1"
};

// Initialize Firebase
const app = firebaseApp.initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);