// ========================================================
// FILE: js/app-config.js
// PURPOSE: Central config for paths and Firebase.
//          Change BASE_PATH here if repo name changes.
// ========================================================

// #### APP CONFIG ####
// GitHub Pages base path — matches repository name
// If your repo is "course" → base path is "/course"
const BASE_PATH = "/course";

// Helper to build correct URLs for GitHub Pages
function url(path) {
  return BASE_PATH + path;
}

// Firebase config
const firebaseConfig = {
  apiKey:            "AIzaSyCpXYFftiB-agrY44eGKdFyUPm-t7FXbUk",
  authDomain:        "kolamdata.firebaseapp.com",
  projectId:         "kolamdata",
  storageBucket:     "kolamdata.firebasestorage.app",
  messagingSenderId: "16403132310",
  appId:             "1:16403132310:web:464c4ad2d19812f95077b7"
};
// #### END APP CONFIG ####

export { BASE_PATH, url, firebaseConfig };
