// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDlcABM5QjENxJGU6GaVGdhuFNyRZsNMp0",
  authDomain: "career-coach-aa65b.firebaseapp.com",
  projectId: "career-coach-aa65b",
  storageBucket: "career-coach-aa65b.appspot.com",
  messagingSenderId: "623569735075",
  appId: "1:623569735075:web:0e7fad3608a701c73b1e16",
  measurementId: "G-Q25QB2BZC2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);