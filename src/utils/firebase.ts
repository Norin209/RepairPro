import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBphZ89XRmnJTt2b58n42cR50OuRV7NLms",
  authDomain: "repairprodatabase.firebaseapp.com",
  projectId: "repairprodatabase",
  storageBucket: "repairprodatabase.firebasestorage.app",
  messagingSenderId: "139649930430",
  appId: "1:139649930430:web:e41aeb3a7c37ffac61baef",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
