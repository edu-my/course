// ============================================================
// js/pages/login.js — Login page
// ============================================================

import {
  signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";
import {
  doc, setDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

export async function render(root, params, state) {
  root.innerHTML = `
  <div class="auth-page">
    <div class="auth-left">
      <div class="auth-left-content">
        <div class="auth-tagline">WELCOME<br/>BACK.</div>
        <p>Continue your learning journey.</p>
        <div class="auth-perks">
          <div class="auth-perk"><div class="perk-icon">📊</div><span>Resume where you left off</span></div>
          <div class="auth-perk"><div class="perk-icon">🏆</div><span>Download certificates</span></div>
          <div class="auth-perk"><div class="perk-icon">📚</div><span>Access enrolled courses</span></div>
        </div>
      </div>
    </div>
    <div class="auth-right">
      <div class="auth-form-header">
        <h2>Log in to your account</h2>
        <p>No account? <a href="#/register">Create one free</a></p>
      </div>
      <div class="alert" id="login-alert" style="display:none;"></div>
      <button class="btn-google" id="btn-google-login">
        <svg width="20" height="20" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.7-.1-4z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16 19 12 24 12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5l-6.2-5.2C29.4 35.5 26.9 36 24 36c-5.2 0-9.6-3-11.3-7.3l-6.5 5C9.5 39.6 16.3 44 24 44z"/><path fill="#1976D2" d="M43.6 20H24v8h11.3c-.9 2.5-2.6 4.6-4.8 6l6.2 5.2C40.3 35.7 44 30.3 44 24c0-1.3-.1-2.7-.4-4z"/></svg>
        Continue with Google
      </button>
      <div class="auth-divider">or log in with email</div>
      <div id="login-form">
        <div class="form-group">
          <label class="form-label" for="l-email">Email Address</label>
          <input type="email" id="l-email" class="form-control" placeholder="you@example.com" autocomplete="email"/>
          <span class="form-error" id="e-email">Please enter your email.</span>
        </div>
        <div class="form-group">
          <label class="form-label" for="l-pass">Password</label>
          <input type="password" id="l-pass" class="form-control" placeholder="Your password" autocomplete="current-password"/>
          <span class="form-error" id="e-pass">Please enter your password.</span>
        </div>
        <div class="forgot-link"><a href="#" id="btn-forgot">Forgot password?</a></div>
        <button class="btn btn-primary btn-block btn-lg" id="btn-login">Log In</button>
      </div>
    </div>
  </div>

  <div class="modal-overlay" id="reset-modal">
    <div class="modal-box">
      <h3>Reset Password</h3>
      <p>Enter your email and we'll send a reset link.</p>
      <div class="alert" id="reset-alert" style="display:none;margin-bottom:1rem;"></div>
      <div class="form-group">
        <label class="form-label" for="r-email">Email</label>
        <input type="email" id="r-email" class="form-control" placeholder="you@example.com"/>
        <span class="form-error" id="e-r-email">Please enter a valid email.</span>
      </div>
      <div class="modal-actions">
        <button class="btn btn-primary" id="btn-send-reset">Send Reset Link</button>
        <button class="btn btn-secondary" id="btn-close-modal">Cancel</button>
      </div>
    </div>
  </div>`;

  const auth = state.auth, db = state.db;

  function showAlert(msg, type = "error") {
    const el = document.getElementById("login-alert");
    el.className = "alert alert-" + type;
    el.textContent = msg;
    el.style.display = "flex";
  }
  function errMsg(code) {
    const m = {
      "auth/user-not-found":        "No account found with this email.",
      "auth/wrong-password":        "Incorrect password. Please try again.",
      "auth/invalid-credential":    "Incorrect email or password. Please try again.",
      "auth/too-many-requests":     "Too many attempts. Please wait a few minutes.",
      "auth/network-request-failed":"Network error. Please check your connection.",
      "auth/popup-blocked":         "Popup was blocked. Please allow popups for this site.",
      "auth/unauthorized-domain":   "Sign-in blocked by browser. Try allowing third-party cookies.",
    };
    return m[code] || "Sign-in error (" + code + "). Please try again.";
  }

  // Email login
  document.getElementById("btn-login").addEventListener("click", async () => {
    document.getElementById("login-alert").style.display = "none";
    document.querySelectorAll(".form-error").forEach(x => x.classList.remove("show"));
    const email = document.getElementById("l-email").value.trim();
    const pass  = document.getElementById("l-pass").value;
    if (!email) { document.getElementById("e-email").classList.add("show"); return; }
    if (!pass)  { document.getElementById("e-pass").classList.add("show");  return; }
    const btn = document.getElementById("btn-login");
    btn.disabled = true; btn.textContent = "Logging in...";
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      window.location.hash = "/dashboard";
    } catch (err) {
      showAlert(errMsg(err.code));
      btn.disabled = false; btn.textContent = "Log In";
    }
  });

  // Enter key on password
  document.getElementById("l-pass")?.addEventListener("keydown", e => {
    if (e.key === "Enter") document.getElementById("btn-login").click();
  });

  // Google login
  document.getElementById("btn-google-login").addEventListener("click", async () => {
    document.getElementById("login-alert").style.display = "none";
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const result = await signInWithPopup(auth, provider);
      await setDoc(doc(db, "users", result.user.uid), {
        uid: result.user.uid, displayName: result.user.displayName || "User",
        email: result.user.email, photoURL: result.user.photoURL || "",
        role: "student", isBanned: false, enrolledCourses: [],
        createdAt: serverTimestamp()
      }, { merge: true });
      window.location.hash = "/dashboard";
    } catch (err) {
      if (err.code !== "auth/popup-closed-by-user" && err.code !== "auth/cancelled-popup-request") {
        showAlert(!err.code ? "Sign-in failed. Try allowing third-party cookies." : errMsg(err.code));
      }
    }
  });

  // Password reset modal
  const modal = document.getElementById("reset-modal");
  document.getElementById("btn-forgot").addEventListener("click", e => {
    e.preventDefault();
    modal.classList.add("open");
    const em = document.getElementById("l-email").value.trim();
    if (em) document.getElementById("r-email").value = em;
  });
  document.getElementById("btn-close-modal").addEventListener("click", () => modal.classList.remove("open"));
  modal.addEventListener("click", e => { if (e.target === modal) modal.classList.remove("open"); });
  document.getElementById("btn-send-reset").addEventListener("click", async () => {
    const email = document.getElementById("r-email").value.trim();
    const ra    = document.getElementById("reset-alert");
    ra.style.display = "none";
    document.getElementById("e-r-email").classList.remove("show");
    if (!email || !email.includes("@")) { document.getElementById("e-r-email").classList.add("show"); return; }
    const btn = document.getElementById("btn-send-reset");
    btn.disabled = true; btn.textContent = "Sending...";
    try {
      await sendPasswordResetEmail(auth, email);
      ra.className = "alert alert-success"; ra.textContent = "Reset link sent!"; ra.style.display = "flex";
    } catch (e) {
      ra.className = "alert alert-error"; ra.textContent = "Could not send email."; ra.style.display = "flex";
    }
    btn.disabled = false; btn.textContent = "Send Reset Link";
  });
}
