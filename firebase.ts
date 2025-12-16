import * as firebaseApp from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// تنظیمات دقیق پروژه جدید sazyarwebapp
const firebaseConfig = {
  apiKey: "AIzaSyDiVz7v-adQ6EdJJ-oFLiEPismQ4jb4SMM",
  authDomain: "sazyarwebapp.firebaseapp.com",
  projectId: "sazyarwebapp",
  storageBucket: "sazyarwebapp.firebasestorage.app",
  messagingSenderId: "196151116296",
  appId: "1:196151116296:web:07e170fe1ec874ddd047bd"
};

// Initialize Firebase
const app = firebaseApp.initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);