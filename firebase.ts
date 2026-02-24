import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAs5N4-_iA8PL8XmcaDu2VJxU9wjrbywdY",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "lead-form-4213b.firebaseapp.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "lead-form-4213b",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "lead-form-4213b.firebasestorage.app",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "111852027687",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:111852027687:web:115b5acfabdd4ce5693302"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;
