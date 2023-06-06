// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from 'firebase/database'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD7PBw6BcZ2kJEFt4SVxserCrIW4OZApr0",
  authDomain: "aligroup-40bd6.firebaseapp.com",
  databaseURL: "https://aligroup-40bd6-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "aligroup-40bd6",
  storageBucket: "aligroup-40bd6.appspot.com",
  messagingSenderId: "628456624922",
  appId: "1:628456624922:web:04bc1e2f453f4dd52852a3"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);