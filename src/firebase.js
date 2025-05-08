import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDHxjmEzEu9e0km307Q25ws_8fLunKQuT0",
  authDomain: "quiz-application-209e0.firebaseapp.com",
  projectId: "quiz-application-209e0",
  storageBucket: "quiz-application-209e0.firebasestorage.app",
  messagingSenderId: "601733078852",
  appId: "1:601733078852:web:dc30036d0c05b61ace0111",
  measurementId: "G-6KZ2J6YE5X"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };