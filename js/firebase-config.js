// ========================================================
// FILE: js/firebase-config.js
// PURPOSE: Firebase initialisation — all API keys live
//          ONLY in this file. Never paste keys elsewhere.
// PROJECT: kolamdata (iCraftCourse)
// HOSTING: GitHub Pages — edu-my.github.io/course/
// ========================================================

// #### FIREBASE SDK IMPORTS ####
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { getAuth }       from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";
import { getFirestore }  from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";
// #### END FIREBASE SDK IMPORTS ####


// #### FIREBASE CONFIG ####
const firebaseConfig = {
  apiKey:            "AIzaSyCpXYFftiB-agrY44eGKdFyUPm-t7FXbUk",
  authDomain:        "kolamdata.firebaseapp.com",
  projectId:         "kolamdata",
  storageBucket:     "kolamdata.firebasestorage.app",
  messagingSenderId: "16403132310",
  appId:             "1:16403132310:web:464c4ad2d19812f95077b7"
};
// #### END FIREBASE CONFIG ####


// #### FIREBASE INIT ####
const app  = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db   = getFirestore(app);
// #### END FIREBASE INIT ####
