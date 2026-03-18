import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// =========================
// REQUIRE LOGIN
// Use on dashboard pages
// =========================
export function requireAuth(redirectTo = "./login.html") {
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.href = redirectTo;
    }
  });
}

// =========================
// REQUIRE GUEST
// Use on login/register pages
// =========================
export function requireGuest(redirectTo = "./dashboard.html") {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      window.location.href = redirectTo;
    }
  });
}

// =========================
// REQUIRE ADMIN
// Use on admin page
// =========================
export function requireAdmin(redirectTo = "./dashboard.html") {
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
    } catch (error) {
      console.error("Admin guard error:", error);
      window.location.href = redirectTo;
    }
  });
}
