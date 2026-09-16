import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCsL7d__FMh99UZBpcG6j9o7oxX504UtJg",
  authDomain: "taskflow-4e5e0.firebaseapp.com",
  projectId: "taskflow-4e5e0",
  storageBucket: "taskflow-4e5e0.firebasestorage.app",
  messagingSenderId: "435674669345",
  appId: "1:435674669345:web:f8813354dd3edb2bac9e60",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

export default app;