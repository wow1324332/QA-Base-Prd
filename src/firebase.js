import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBIsBcW0eBceMAJdhGsKmdNew7vvMPbwB4",
  authDomain: "qa-base-prd.firebaseapp.com",
  projectId: "qa-base-prd",
  storageBucket: "qa-base-prd.firebasestorage.app",
  messagingSenderId: "138324755275",
  appId: "1:138324755275:web:ead26c4202fad8c0885ece"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
