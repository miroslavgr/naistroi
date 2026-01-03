import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
// TODO: Replace with your actual Firebase project config
// Go to Firebase Console -> Project Settings -> General -> "Your apps"
  const firebaseConfig = {
    apiKey: "AIzaSyCYyjXo3dbTJVdO8J3Jvg2sM4Ot2WwCx0U",
    authDomain: "naistroi.firebaseapp.com",
    projectId: "naistroi",
    storageBucket: "naistroi.firebasestorage.app",
    messagingSenderId: "793047931592",
    appId: "1:793047931592:web:88f934c2c20079f62ba3fd",
    measurementId: "G-QM3DSCZMBN"
  };

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export const auth = getAuth(app);
export const storage = getStorage(app);