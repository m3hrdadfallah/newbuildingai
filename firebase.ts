import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCf5NGycTd_K2ntf-Nd1uiWd7NfEFJVq28",
  authDomain: "sazyarweb.firebaseapp.com",
  projectId: "sazyarweb",
  storageBucket: "sazyarweb.firebasestorage.app",
  messagingSenderId: "196151116296",
  appId: "1:196151116296:web:07e170fe1ec874ddd047bd"
};

// مقداردهی اولیه برنامه
const app = initializeApp(firebaseConfig);

// فقط دیتابیس نگه داشته می‌شود
export const db = getFirestore(app);

export default app;