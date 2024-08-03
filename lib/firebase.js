// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {getFirestore} from 'firebase/firestore';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDgDfMacNx4V0VlfecW8pR67YKHOzKXOso",
  authDomain: "inventorymanagement-416c5.firebaseapp.com",
  projectId: "inventorymanagement-416c5",
  storageBucket: "inventorymanagement-416c5.appspot.com",
  messagingSenderId: "44774158677",
  appId: "1:44774158677:web:8e8cda7448f82913cebfdc",
  measurementId: "G-2HE8PDJ8MP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);

export { auth, firestore };