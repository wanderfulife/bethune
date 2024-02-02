// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBC5bPRH9RFUjDZjapcVVX_qWmKxIQ40fA",
  authDomain: "bethune-43390.firebaseapp.com",
  projectId: "bethune-43390",
  storageBucket: "bethune-43390.appspot.com",
  messagingSenderId: "859655692148",
  appId: "1:859655692148:web:c6ddb4601a4c45efd79621",
  measurementId: "G-CLRZBQ8FN6"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);


