// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCyBuebHuJ7pmUxLZ05gxzjF2-ezA4--A0",
  authDomain: "sazyarapp.firebaseapp.com",
  projectId: "sazyarapp",
  storageBucket: "sazyarapp.firebasestorage.app",
  messagingSenderId: "200546815732",
  appId: "1:200546815732:web:a3548a43e25cccac2a98a1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);