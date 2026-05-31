// ============================================================
// js/app.js — Firebase init, auth state, router
// ============================================================

import { initializeApp }                          from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut }   from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";
import { getFirestore, doc, getDoc }              from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

// ── FIREBASE ─────────────────────────────────────────────────
const firebaseConfig = {
  apiKey:            "AIzaSyCpXYFftiB-agrY44eGKdFyUPm-t7FXbUk",
  authDomain:        "kolamdata.firebaseapp.com",
  projectId:         "kolamdata",
  storageBucket:     "kolamdata.firebasestorage.app",
  messagingSenderId: "16403132310",
  appId:             "1:16403132310:web:464c4ad2d19812f95077b7"
};

const firebaseApp = initializeApp(firebaseConfig);
const auth        = getAuth(firebaseApp);
const db          = getFirestore(firebaseApp);

// ── GLOBAL STATE ─────────────────────────────────────────────
export const state = {
  user:    null,
  isAdmin: false,
  db,
  auth,
};

// ── ROUTES ───────────────────────────────────────────────────
const routes = {
  "/":             { loader: () => import("./pages/home.js"),         protected: false },
  "/courses":      { loader: () => import("./pages/courses.js"),      protected: false },
  "/course":       { loader: () => import("./pages/course.js"),       protected: false },
  "/dashboard":    { loader: () => import("./pages/dashboard.js"),    protected: true  },
  "/player":       { loader: () => import("./pages/player.js"),       protected: true  },
  "/payment":      { loader: () => import("./pages/payment.js"),      protected: true  },
  "/profile":      { loader: () => import("./pages/profile.js"),      protected: true  },
  "/certificates": { loader: () => import("./pages/certificates.js"), protected: true  },
  "/login":        { loader: () => import("./pages/login.js"),        protected: false },
  "/register":     { loader: () => import("./pages/register.js"),     protected: false },
};

// ── ROUTER ───────────────────────────────────────────────────
let currentPath = null;
let isFirstLoad = true;

async function route() {
  const hash   = window.location.hash.slice(1) || "/";
  const [path, qs] = hash.split("?");
  const params = new URLSearchParams(qs || "");
  const base   = "/" + (path.split("/")[1] || "");
  const match  = routes[base] || routes["/"];

  // Auth guard
  if (match.protected && !state.user) {
    window.location.hash = "/login";
    return;
  }

  // Redirect logged-in users away from login/register
  if ((base === "/login" || base === "/register") && state.user) {
    window.location.hash = "/dashboard";
    return;
  }

  if (currentPath === hash) return;
  currentPath = hash;

  updateNavActive(base);
  updateTitle(base);

  const pageRoot = document.getElementById("page-root");

  try {
    // Smooth page transition — fade out, swap, fade in
    if (!isFirstLoad) {
      pageRoot.style.transition = "opacity 0.15s ease";
      pageRoot.style.opacity    = "0";
      await new Promise(r => setTimeout(r, 150));
    }

    const mod = await match.loader();
    await mod.render(pageRoot, params, state);

    // Scroll to top on every navigation
    window.scrollTo({ top: 0, behavior: "instant" });

    if (!isFirstLoad) {
      pageRoot.style.opacity = "1";
    }

    // First load: reveal the whole body — the banking-smooth moment
    if (isFirstLoad) {
      isFirstLoad = false;
      document.body.classList.add("app-ready");
    }

  } catch (err) {
    console.error("Router error:", err);
    pageRoot.style.opacity = "1";
    pageRoot.innerHTML = `
      <div style="padding:4rem;text-align:center;">
        <h2 style="font-family:'Bebas Neue',sans-serif;font-size:2rem;color:#D72B2B;">Something went wrong</h2>
        <p style="color:#888;margin:.5rem 0 1.5rem;">${err.message}</p>
        <a href="#/" style="color:#D72B2B;font-weight:600;">← Back to home</a>
      </div>`;
    if (isFirstLoad) {
      isFirstLoad = false;
      document.body.classList.add("app-ready");
    }
  }
}

function updateNavActive(base) {
  document.querySelectorAll(".nav-link[data-route]").forEach(el => {
    el.classList.toggle("active", el.dataset.route === base);
  });
}

function updateTitle(base) {
  const titles = {
    "/":             "edu-my.web — Learn Smarter. Teach Better.",
    "/courses":      "All Courses — edu-my.web",
    "/course":       "Course — edu-my.web",
    "/dashboard":    "Dashboard — edu-my.web",
    "/player":       "Player — edu-my.web",
    "/payment":      "Payment — edu-my.web",
    "/profile":      "My Profile — edu-my.web",
    "/certificates": "Certificates — edu-my.web",
    "/login":        "Log In — edu-my.web",
    "/register":     "Get Started — edu-my.web",
  };
  document.title = titles[base] || "edu-my.web";
}

// ── NAV UI ───────────────────────────────────────────────────
function setNavUser(user, isAdmin) {
  const guestEl  = document.getElementById("nav-guest");
  const userEl   = document.getElementById("nav-user");
  const mGuestEl = document.getElementById("nav-mobile-guest");
  const mUserEl  = document.getElementById("nav-mobile-user");

  if (user) {
    guestEl?.classList.add("hidden");
    userEl?.classList.remove("hidden");
    mGuestEl?.classList.add("hidden");
    mUserEl?.classList.remove("hidden");

    const name = user.displayName || "User";
    const set  = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set("nav-avatar", name.charAt(0).toUpperCase());
    set("nav-name",   name);
    set("dd-name",    name);
    set("dd-email",   user.email || "");

    if (isAdmin) injectAdminLink();
  } else {
    guestEl?.classList.remove("hidden");
    userEl?.classList.add("hidden");
    mGuestEl?.classList.remove("hidden");
    mUserEl?.classList.add("hidden");
  }
}

function injectAdminLink() {
  if (document.getElementById("admin-nav-link")) return;
  const dropdown = document.querySelector("#nav-user .nav-dropdown");
  const logout   = dropdown?.querySelector(".danger");
  if (!dropdown || !logout) return;
  const a     = document.createElement("a");
  a.id        = "admin-nav-link";
  a.className = "nav-dropdown-item";
  a.href      = "admin/index.html";
  a.innerHTML = '<span class="item-icon">🔧</span> Admin Panel';
  a.style.borderTop = "1px solid #EEEBEB";
  dropdown.insertBefore(a, logout);
}

// ── NAV INTERACTIONS ─────────────────────────────────────────
function initNavInteractions() {
  const navUser   = document.getElementById("nav-user");
  const hamburger = document.getElementById("nav-hamburger");
  const drawer    = document.getElementById("nav-mobile-drawer");

  navUser?.addEventListener("click", e => {
    e.stopPropagation();
    navUser.classList.toggle("open");
  });
  navUser?.querySelector(".nav-dropdown")?.addEventListener("click", e => e.stopPropagation());
  document.addEventListener("click", () => navUser?.classList.remove("open"));

  hamburger?.addEventListener("click", e => {
    e.stopPropagation();
    hamburger.classList.toggle("open");
    drawer.classList.toggle("open");
  });
  drawer?.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      hamburger.classList.remove("open");
      drawer.classList.remove("open");
    });
  });

  const logout = async () => {
    await signOut(auth);
    state.user    = null;
    state.isAdmin = false;
    setNavUser(null, false);
    window.location.hash = "/";
  };
  document.getElementById("btn-logout")?.addEventListener("click", logout);
  document.getElementById("btn-logout-mobile")?.addEventListener("click", logout);

  setTimeout(() => document.getElementById("help-text")?.classList.add("visible"), 4000);
}

// ── BOOT ─────────────────────────────────────────────────────
initNavInteractions();

onAuthStateChanged(auth, async (user) => {
  if (user) {
    state.user = user;
    try {
      const snap    = await getDoc(doc(db, "users", user.uid));
      state.isAdmin = snap.exists() && snap.data().role === "admin";
    } catch (e) {
      state.isAdmin = false;
    }
  } else {
    state.user    = null;
    state.isAdmin = false;
  }

  setNavUser(state.user, state.isAdmin);
  await route();
});

window.addEventListener("hashchange", route);
window.navigate = (hash) => { window.location.hash = hash; };
