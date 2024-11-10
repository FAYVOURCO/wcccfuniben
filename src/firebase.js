// firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyCNBS8ZoF2wgybfDez3IuOh2RGEtDBcYS8",
    authDomain: "wcccfuniben24.firebaseapp.com",
    projectId: "wcccfuniben24",
    storageBucket: "wcccfuniben24.appspot.com",
    messagingSenderId: "493816299407",
    appId: "1:493816299407:web:1b62969c4603d1839bd5fa"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
