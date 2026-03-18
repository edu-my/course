// ========================================================
// FILE: js/firebase-config.js
// PURPOSE: Central Firebase initialization
// ========================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyClSZ-Y2GjprWLSDMG0LlwNcz4fU9w89ko",
  authDomain: "icraftcourses.firebaseapp.com",
  projectId: "icraftcourses",
  storageBucket: "icraftcourses.firebasestorage.app",
  messagingSenderId: "919073015993",
  appId: "1:919073015993:web:63291f712a15c1d11eb368"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
