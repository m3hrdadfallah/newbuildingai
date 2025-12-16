import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// import { getAnalytics } from "firebase/analytics";

// تنظیمات جدید پروژه sazyarweb با کلید صحیح
const firebaseConfig = {
  apiKey: "AIzaSyDiVz7v-adQ6EdJJ-oFLiEPismQ4jb4SMM",
  authDomain: "sazyarweb.firebaseapp.com",
  projectId: "sazyarweb",
  storageBucket: "sazyarweb.firebasestorage.app",
  messagingSenderId: "196151116296",
  appId: "1:196151116296:web:07e170fe1ec874ddd047bd",
  // measurementId: "G-174BXSNCSW" // برای جلوگیری از خطای 403 Installations API غیرفعال شد
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
// export const analytics = getAnalytics(app);