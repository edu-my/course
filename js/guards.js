// ========================================================
// FILE: js/guards.js
// PURPOSE: Shared route guards
// ========================================================

import { auth, db, isFirebaseConfigured } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

// --------------------------------------------------------
// Require guest
// For login/register pages
// --------------------------------------------------------
export function requireGuest(redirectTo = "./dashboard.html") {
  if (!isFirebaseConfigured || !auth) {
    return;
  }

  onAuthStateChanged(auth, (user) => {
    if (user) {
      window.location.href = redirectTo;
    }
  });
}

// --------------------------------------------------------
// Require auth
// For dashboard and protected pages
// --------------------------------------------------------
export function requireAuth(redirectTo = "./login.html") {
  if (!isFirebaseConfigured || !auth) {
    window.location.href = redirectTo;
    return;
  }

  onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.href = redirectTo;
    }
  });
}

// --------------------------------------------------------
// Require admin
// For admin page
// --------------------------------------------------------
export function requireAdmin(redirectTo = "./dashboard.html") {
  if (!isFirebaseConfigured || !auth || !db) {
    window.location.href = "./login.html";
    return;
  }

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = "./login.html";
      return;
    }

    try {
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        window.location.href = redirectTo;
        return;
      }

      const profile = snap.data();

      if (profile.role !== "admin") {
        window.location.href = redirectTo;
      }
    } catch (err) {
      console.error("Admin guard failed:", err);
      window.location.href = redirectTo;
    }
  });
}
