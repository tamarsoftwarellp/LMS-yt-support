// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAkN2kBSkNl0AsudUrAwRZHLxHw3GHZNA4",
  authDomain: "lms-tamar-software-751cf.firebaseapp.com",
  projectId: "lms-tamar-software-751cf",
  storageBucket: "lms-tamar-software-751cf.firebasestorage.app",
  messagingSenderId: "248176638251",
  appId: "1:248176638251:web:9e7a7786be38e1169aad6e",
  measurementId: "G-77SDFETT2D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
export const auth = getAuth(app);