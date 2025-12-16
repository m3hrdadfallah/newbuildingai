import * as firebaseApp from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// استفاده از متغیر محیطی برای امنیت
// کلید جدید در فایل .env.local تنظیم شده است
const apiKey = process.env.API_KEY;

const firebaseConfig = {
  apiKey: apiKey,
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