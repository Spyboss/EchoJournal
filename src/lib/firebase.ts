import { initializeApp, getApps } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDq9vhgtsS_Tg_O6aKJyuyxPm3VhmJVdGo",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "echo-journal-hnzep.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "echo-journal-hnzep",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "echo-journal-hnzep.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1043477246116",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:1043477246116:web:5cbe19365e957682c07631"
};

// Initialize Firebase only if it hasn't been initialized already
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Auth
const auth = getAuth(app);

// Initialize Firestore
const db = getFirestore(app);

// Connect to emulators in development (optional)
// Uncomment the code below if you want to use Firebase emulators
// Note: Requires Java installation and Firebase CLI authentication
/*
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  // Only connect to emulators if they haven't been connected already
  try {
    // Check if emulator is already connected by attempting connection
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
  } catch (error) {
    // Emulator connection failed or already connected
    console.log('Auth emulator connection skipped:', error);
  }
  
  try {
    connectFirestoreEmulator(db, 'localhost', 8080);
  } catch (error) {
    // Emulator connection failed or already connected
    console.log('Firestore emulator connection skipped:', error);
  }
}
*/

export { app, auth, db };