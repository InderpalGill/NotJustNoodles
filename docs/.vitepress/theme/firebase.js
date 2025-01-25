import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCLWvulzj65H7RO-EFmkKYqKB-8dh7TX3g",
    authDomain: "notjustnoodles-20091.firebaseapp.com",
    projectId: "notjustnoodles-20091",
    storageBucket: "notjustnoodles-20091.firebasestorage.app",
    messagingSenderId:  "507934743425",
    appId:  "1:507934743425:web:c62f93aaf6164cbc3a6680",
    measurementId: "G-4LR8C8MHGM"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };