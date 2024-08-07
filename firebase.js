// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import {getFirestore} from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: "inventory-management-1e624.firebaseapp.com",
  projectId: "inventory-management-1e624",
  storageBucket: "inventory-management-1e624.appspot.com",
  messagingSenderId: "172269333957",
  appId: "1:172269333957:web:c5f5642d67589904756fac",
  measurementId: "G-K9CVP1LTQB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const firestore = getFirestore(app);

export {firestore};