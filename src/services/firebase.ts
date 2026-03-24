import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDvnAdcYMOd1QhEJBdAKJf6LBTiIimMZMQ",
  authDomain: "chingate-law-firm-app.firebaseapp.com",
  projectId: "chingate-law-firm-app",
  storageBucket: "chingate-law-firm-app.firebasestorage.app",
  messagingSenderId: "674936423278",
  appId: "1:674936423278:web:f130a2363724f1e33df77f"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
