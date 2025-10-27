import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database"; 
// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBMaRlpVYFFzH0JmHOsg5GuMAJWThXyHRI",
  authDomain: "scps-firebase.firebaseapp.com",
  databaseURL: "https://scps-firebase-default-rtdb.europe-west1.firebasedatabase.app/",
  projectId: "scps-firebase",
  storageBucket: "scps-firebase.firebasestorage.app",
  messagingSenderId: "871120039553",
  appId: "1:871120039553:web:fad60a14bf92ca06b2a780"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
const database = getDatabase(app);
export { app, auth, database };





// Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: "AIzaSyBMaRlpVYFFzH0JmHOsg5GuMAJWThXyHRI",
//   authDomain: "scps-firebase.firebaseapp.com",
//   projectId: "scps-firebase",
//   storageBucket: "scps-firebase.firebasestorage.app",
//   messagingSenderId: "871120039553",
//   appId: "1:871120039553:web:fad60a14bf92ca06b2a780",
//   measurementId: "G-BTTGYV5F3Q"
// };

// Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);


// npm install firebase
// npm install -g firebase-tools
// firebase login
// firebase init
// firebase deploy