// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBrTy5EC4AnJRSqeW0iKVBy4gy-zpFZrcE",
  authDomain: "newerfire.firebaseapp.com",
  projectId: "newerfire",
  storageBucket: "newerfire.firebasestorage.app",
  messagingSenderId: "516834961574",
  appId: "1:516834961574:web:5c53d4efce08585d726c67"
};


const app = initializeApp(firebaseConfig);
// Firestore
export const db = getFirestore(app);

// Auth with session persistence
export const auth = getAuth(app);