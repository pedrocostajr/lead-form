import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyAs5N4-_iA8PL8XmcaDu2VJxU9wjrbywdY",
    authDomain: "lead-form-4213b.firebaseapp.com",
    projectId: "lead-form-4213b",
    storageBucket: "lead-form-4213b.firebasestorage.app",
    messagingSenderId: "111852027687",
    appId: "1:111852027687:web:115b5acfabdd4ce5693302"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;
