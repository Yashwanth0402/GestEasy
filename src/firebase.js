// firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyDNvEBOfnokafvyirNzwwk6zBlD2SHHddI",
    authDomain: "gesteasy-d5ea7.firebaseapp.com",
    projectId: "gesteasy-d5ea7",
    storageBucket: "gesteasy-d5ea7.appspot.com",
    messagingSenderId: "1028217869556",
    appId: "1:1028217869556:web:33a8e18e9cdf6578233aa1",
    measurementId: "G-7BQ6STG6KK"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
