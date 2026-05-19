import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCPOfHz5gPsEKtt-y5JzPN4waR4THcF8G0",
  authDomain: "beertierlist.firebaseapp.com",
  projectId: "beertierlist",
  storageBucket: "beertierlist.firebasestorage.app",
  messagingSenderId: "526806323873",
  appId: "1:526806323873:web:e9e6ae43d806a547f3d6e0"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const db = getFirestore(app);
const auth = getAuth(app);

// Sign in anonymously so uploads can be associated with a uid
signInAnonymously(auth).catch((e) => console.error('Anonymous sign-in failed', e));

export { app, storage, db, auth };