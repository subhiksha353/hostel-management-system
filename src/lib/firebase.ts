import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyBgDJa-KutRCEx11oAd33oBv-1MkmktIAg',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'campus-voice-b3bbc.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'campus-voice-b3bbc',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'campus-voice-b3bbc.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '396151446502',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:396151446502:web:46e7772411535131d51427',
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.apiKey !== 'your-firebase-api-key' &&
  !firebaseConfig.projectId.includes('your-project-id')
);

// Initialize Firebase App safely without crashing if already initialized or credentials missing
let app: FirebaseApp | null = null;
let db: Firestore | null = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app);
    console.log('🔥 Connected to Firebase Firestore:', firebaseConfig.projectId);
  } catch (error) {
    console.warn('Firebase initialization error:', error);
  }
}

export { app, db, firebaseConfig };
