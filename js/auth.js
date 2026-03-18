// ========================================================
// FILE: js/auth.js
// PURPOSE: Shared auth actions for login/register/logout
// ========================================================

import { auth, db, isFirebaseConfigured } from "./firebase-config.js";

import {
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";

import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

// --------------------------------------------------------
// Helpers
// --------------------------------------------------------
function firebaseNotReady() {
  return {
    success: false,
    code: "firebase/not-configured",
    error: "Firebase is not configured yet. Add your Firebase project values first."
  };
}

function mapRegisterError(code) {
  const errors = {
    "auth/email-already-in-use": "This email is already registered. Please log in instead.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/weak-password": "Password must be at least 6 characters.",
    "auth/too-many-requests": "Too many attempts. Please wait and try again.",
    "auth/network-request-failed": "Network error. Check your internet connection."
  };
  return errors[code] || `Something went wrong: ${code}`;
}

function mapLoginError(code) {
  const errors = {
    "auth/user-not-found": "No account found with this email.",
    "auth/wrong-password": "Incorrect password. Please try again.",
    "auth/invalid-credential": "Incorrect email or password. Please try again.",
    "auth/too-many-requests": "Too many attempts. Please wait and try again.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/network-request-failed": "Network error. Check your internet connection."
  };
  return errors[code] || `Something went wrong: ${code}`;
}

// --------------------------------------------------------
// User profile upsert
// --------------------------------------------------------
async function ensureUserProfile(user, extra = {}) {
  if (!isFirebaseConfigured || !db) {
    throw new Error("Firebase is not configured.");
  }

  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  const baseProfile = {
    uid: user.uid,
    displayName: user.displayName || extra.displayName || "User",
    email: user.email || "",
    photoURL: user.photoURL || "",
    role: extra.role || "user",
    isBanned: false,
    enrolledCourses: []
  };

  if (!snap.exists()) {
    await setDoc(ref, {
      ...baseProfile,
      createdAt: serverTimestamp()
    });
    return;
  }

  await setDoc(
    ref,
    {
      ...baseProfile,
      ...extra
    },
    { merge: true }
  );
}

// --------------------------------------------------------
// Register
// --------------------------------------------------------
export async function registerUser({ name, email, password }) {
  if (!isFirebaseConfigured || !auth || !db) {
    return firebaseNotReady();
  }

  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const user = cred.user;

    await updateProfile(user, { displayName: name });

    await ensureUserProfile(user, {
      displayName: name,
      role: "user"
    });

    return { success: true, user };
  } catch (err) {
    return {
      success: false,
      code: err.code,
      error: mapRegisterError(err.code)
    };
  }
}

// --------------------------------------------------------
// Email login
// --------------------------------------------------------
export async function loginUser({ email, password }) {
  if (!isFirebaseConfigured || !auth || !db) {
    return firebaseNotReady();
  }

  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const user = cred.user;

    await ensureUserProfile(user, {
      role: "user"
    });

    return { success: true, user };
  } catch (err) {
    return {
      success: false,
      code: err.code,
      error: mapLoginError(err.code)
    };
  }
}

// --------------------------------------------------------
// Google login/register
// --------------------------------------------------------
export async function loginWithGoogle() {
  if (!isFirebaseConfigured || !auth || !db) {
    return firebaseNotReady();
  }

  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });

    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    await ensureUserProfile(user, {
      role: "user"
    });

    return { success: true, user };
  } catch (err) {
    return {
      success: false,
      code: err.code,
      error:
        err.code === "auth/popup-closed-by-user"
          ? "Google sign-in was cancelled."
          : "Google sign-in failed. Please try again."
    };
  }
}

// --------------------------------------------------------
// Password reset
// --------------------------------------------------------
export async function sendResetLink(email) {
  if (!isFirebaseConfigured || !auth) {
    return firebaseNotReady();
  }

  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (err) {
    return {
      success: false,
      code: err.code,
      error: "Could not send reset email. Please check the address."
    };
  }
}

// --------------------------------------------------------
// Logout
// --------------------------------------------------------
export async function logoutUser() {
  if (!isFirebaseConfigured || !auth) {
    return firebaseNotReady();
  }

  try {
    await signOut(auth);
    return { success: true };
  } catch (err) {
    return {
      success: false,
      code: err.code,
      error: "Logout failed."
    };
  }
}

// --------------------------------------------------------
// Current user profile
// --------------------------------------------------------
export function getCurrentAuthUser() {
  return new Promise((resolve) => {
    if (!isFirebaseConfigured || !auth) {
      resolve(null);
      return;
    }

    onAuthStateChanged(auth, (user) => resolve(user || null));
  });
}

export async function getCurrentUserProfile() {
  if (!isFirebaseConfigured || !auth || !db) {
    return null;
  }

  const user = await getCurrentAuthUser();
  if (!user) return null;

  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    return {
      uid: user.uid,
      displayName: user.displayName || "User",
      email: user.email || "",
      role: "user"
    };
  }

  return {
    uid: user.uid,
    ...snap.data()
  };
}
