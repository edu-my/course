// ========================================================
// nav.js — Dropdown, hamburger, admin link, anti-flicker
// sessionStorage cache: instant navbar on every page load
// ========================================================

// #### ANTI-FLICKER — apply cached auth state instantly ####
(function() {
  try {
    var cached = sessionStorage.getItem("icraftuser");
    if (cached) {
      var u = JSON.parse(cached);
      // Hide guest nav immediately — before Firebase loads
      var guest = document.getElementById("nav-guest");
      var user  = document.getElementById("nav-user");
      var mguest = document.getElementById("nav-mobile-guest");
      var muser  = document.getElementById("nav-mobile-user");
      if (guest) guest.classList.add("hidden");
      if (user)  user.classList.remove("hidden");
      if (mguest) mguest.classList.add("hidden");
      if (muser)  muser.classList.remove("hidden");
      // Fill in user details instantly
      var el = function(id) { return document.getElementById(id); };
      var initial = (u.name || "U").charAt(0).toUpperCase();
      if (el("nav-avatar")) el("nav-avatar").textContent = initial;
      if (el("nav-name"))   el("nav-name").textContent   = u.name || "User";
      if (el("dd-name"))    el("dd-name").textContent    = u.name || "User";
      if (el("dd-email"))   el("dd-email").textContent   = u.email || "";
      // Inject admin link if admin
      if (u.isAdmin) {
        window._cachedAdmin = true;
      }
    }
  } catch(e) {}
})();
// #### END ANTI-FLICKER ####

// #### SAVE TO CACHE — called by each page after Firebase confirms user ####
window.cacheAuthUser = function(user, isAdmin) {
  try {
    if (user) {
      sessionStorage.setItem("icraftuser", JSON.stringify({
        name: user.displayName || "User",
        email: user.email || "",
        uid: user.uid,
        isAdmin: !!isAdmin
      }));
    } else {
      sessionStorage.removeItem("icraftuser");
    }
  } catch(e) {}
};
// #### END SAVE TO CACHE ####

// #### CLEAR CACHE ON LOGOUT ####
window.clearAuthCache = function() {
  try { sessionStorage.removeItem("icraftuser"); } catch(e) {}
};
// #### END CLEAR CACHE ####

// #### NAV INTERACTIONS — dropdown + hamburger ####
setTimeout(function() {
  // Dropdown toggle
  var navUser = document.getElementById("nav-user");
  if (navUser) {
    navUser.addEventListener("click", function(e) {
      e.stopPropagation();
      navUser.classList.toggle("open");
    });
    var dropdown = navUser.querySelector(".nav-dropdown");
    if (dropdown) {
      dropdown.addEventListener("click", function(e) { e.stopPropagation(); });
    }
  }
  document.addEventListener("click", function() {
    if (navUser) navUser.classList.remove("open");
  });

  // Hamburger toggle
  var hamburger = document.getElementById("nav-hamburger");
  var drawer    = document.getElementById("nav-mobile-drawer");
  if (hamburger && drawer) {
    hamburger.addEventListener("click", function(e) {
      e.stopPropagation();
      hamburger.classList.toggle("open");
      drawer.classList.toggle("open");
    });
    drawer.querySelectorAll("a").forEach(function(link) {
      link.addEventListener("click", function() {
        hamburger.classList.remove("open");
        drawer.classList.remove("open");
      });
    });
  }

  // Inject admin link from cache if needed
  if (window._cachedAdmin) {
    window.setAdminNav(true);
  }
}, 100);
// #### END NAV INTERACTIONS ####

// #### ADMIN LINK INJECTION ####
window.setAdminNav = function(isAdmin) {
  if (!isAdmin) return;
  var navUser  = document.getElementById("nav-user");
  var dropdown = navUser ? navUser.querySelector(".nav-dropdown") : null;
  var logout   = dropdown ? dropdown.querySelector(".danger") : null;
  if (dropdown && logout && !document.getElementById("admin-nav-link")) {
    var a       = document.createElement("a");
    a.id        = "admin-nav-link";
    a.className = "nav-dropdown-item";
    a.innerHTML = '<span class="item-icon">&#128295;</span> Admin Panel';
    a.style.borderTop = "1px solid #EEEBEB";
    var inAdmin = window.location.pathname.indexOf("/admin/") !== -1;
    a.href = inAdmin ? "index.html" : "admin/index.html";
    dropdown.insertBefore(a, logout);
  }
};
// #### END ADMIN LINK INJECTION ####
