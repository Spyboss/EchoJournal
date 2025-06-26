import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDq9vhgtsS_Tg_O6aKJyuyxPm3VhmJVdGo",
  authDomain: "echo-journal-hnzep.firebaseapp.com",
  projectId: "echo-journal-hnzep",
  storageBucket: "echo-journal-hnzep.firebasestorage.app",
  messagingSenderId: "1043477246116",
  appId: "1:1043477246116:web:5cbe19365e957682c07631"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };