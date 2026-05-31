// ================================================================
// nav.js — anti-flicker + NProgress loading bar + link prefetching
// Drop-in replacement. No changes needed to any HTML file.
// ================================================================

// ── ANTI-FLICKER — apply cached auth state instantly ─────────────
// Runs before Firebase loads. Uses sessionStorage to show correct
// nav state immediately, eliminating the guest→user swap flash.
(function () {
  try {
    var cached = sessionStorage.getItem("icraftuser");
    if (cached) {
      var u      = JSON.parse(cached);
      var guest  = document.getElementById("nav-guest");
      var user   = document.getElementById("nav-user");
      var mguest = document.getElementById("nav-mobile-guest");
      var muser  = document.getElementById("nav-mobile-user");
      if (guest)  guest.classList.add("hidden");
      if (user)   user.classList.remove("hidden");
      if (mguest) mguest.classList.add("hidden");
      if (muser)  muser.classList.remove("hidden");
      var el = function (id) { return document.getElementById(id); };
      var initial = (u.name || "U").charAt(0).toUpperCase();
      if (el("nav-avatar")) el("nav-avatar").textContent = initial;
      if (el("nav-name"))   el("nav-name").textContent   = u.name  || "User";
      if (el("dd-name"))    el("dd-name").textContent    = u.name  || "User";
      if (el("dd-email"))   el("dd-email").textContent   = u.email || "";
      if (u.isAdmin) window._cachedAdmin = true;
    }
  } catch (e) {}
})();
// ── END ANTI-FLICKER ─────────────────────────────────────────────

// ── NPROGRESS — minimal inline implementation ─────────────────────
// No external library needed. This is a lightweight version that
// produces the exact same red loading bar effect.
var NProgress = (function () {
  var bar, trickleTimer, started = false;

  function getBar() {
    if (!bar) {
      bar = document.createElement("div");
      bar.id = "nprogress";
      bar.innerHTML = '<div class="bar"><div class="peg"></div></div>';
      document.body.appendChild(bar);
    }
    return bar.querySelector(".bar");
  }

  function set(n) {
    var b = getBar();
    n = Math.min(Math.max(n, 0.08), 1);
    b.style.transition = n === 1 ? "width 0.1s ease" : "width 0.2s ease";
    b.style.width = (n * 100) + "%";
    b.style.opacity = "1";
  }

  function start() {
    if (started) return;
    started = true;
    set(0.08);
    trickleTimer = setInterval(function () {
      var b = getBar();
      var current = parseFloat(b.style.width) / 100 || 0;
      var add = 0.05 * Math.pow(1 - current, 2);
      set(Math.min(current + add, 0.94));
    }, 200);
  }

  function done() {
    clearInterval(trickleTimer);
    set(1);
    setTimeout(function () {
      var b = getBar();
      if (b) {
        b.style.transition = "opacity 0.3s ease";
        b.style.opacity = "0";
        setTimeout(function () { started = false; }, 350);
      }
    }, 100);
  }

  return { start: start, done: done };
})();
// ── END NPROGRESS ─────────────────────────────────────────────────

// ── LOADING BAR ON EVERY PAGE NAVIGATION ─────────────────────────
// Intercept all internal link clicks. Start the bar immediately
// so the user sees instant feedback before the new page loads.
document.addEventListener("click", function (e) {
  var link = e.target.closest("a[href]");
  if (!link) return;

  var href = link.getAttribute("href");
  if (!href) return;

  // Skip: external links, anchors, javascript:, mailto:, tel:
  if (
    href.startsWith("http") ||
    href.startsWith("//")   ||
    href.startsWith("#")    ||
    href.startsWith("javascript") ||
    href.startsWith("mailto") ||
    href.startsWith("tel") ||
    link.target === "_blank"
  ) return;

  // Start the loading bar immediately on click
  NProgress.start();
});

// Complete the bar when the new page finishes loading
window.addEventListener("pageshow", function () {
  NProgress.done();
});
// ── END LOADING BAR ───────────────────────────────────────────────

// ── LINK PREFETCHING — hover to preload ──────────────────────────
// When a user hovers a nav link, the browser starts downloading
// that page in the background. By the time they click, it's cached.
// Result: navigation feels instant.
var prefetched = {};

function prefetchLink(href) {
  if (!href || prefetched[href]) return;
  if (href.startsWith("http") || href.startsWith("#") || href.startsWith("javascript")) return;
  prefetched[href] = true;
  try {
    var link = document.createElement("link");
    link.rel  = "prefetch";
    link.href = href;
    link.as   = "document";
    document.head.appendChild(link);
  } catch (e) {}
}

// Attach prefetch to nav links and drawer links on hover
setTimeout(function () {
  var links = document.querySelectorAll(".nav-link, .nav-dropdown-item, .admin-nav-item");
  links.forEach(function (el) {
    el.addEventListener("mouseenter", function () {
      var href = el.getAttribute("href");
      if (href) prefetchLink(href);
    }, { passive: true });
  });
}, 500);
// ── END PREFETCHING ───────────────────────────────────────────────

// ── AUTH CACHE HELPERS ────────────────────────────────────────────
window.cacheAuthUser = function (user, isAdmin) {
  try {
    if (user) {
      sessionStorage.setItem("icraftuser", JSON.stringify({
        name:    user.displayName || "User",
        email:   user.email       || "",
        uid:     user.uid,
        isAdmin: !!isAdmin
      }));
    } else {
      sessionStorage.removeItem("icraftuser");
    }
  } catch (e) {}
};

window.clearAuthCache = function () {
  try { sessionStorage.removeItem("icraftuser"); } catch (e) {}
};
// ── END AUTH CACHE HELPERS ────────────────────────────────────────

// ── NAV INTERACTIONS — dropdown + hamburger ───────────────────────
setTimeout(function () {
  // Dropdown
  var navUser = document.getElementById("nav-user");
  if (navUser) {
    navUser.addEventListener("click", function (e) {
      e.stopPropagation();
      navUser.classList.toggle("open");
    });
    var dropdown = navUser.querySelector(".nav-dropdown");
    if (dropdown) dropdown.addEventListener("click", function (e) { e.stopPropagation(); });
  }
  document.addEventListener("click", function () {
    if (navUser) navUser.classList.remove("open");
  });

  // Hamburger
  var hamburger = document.getElementById("nav-hamburger");
  var drawer    = document.getElementById("nav-mobile-drawer");
  if (hamburger && drawer) {
    hamburger.addEventListener("click", function (e) {
      e.stopPropagation();
      hamburger.classList.toggle("open");
      drawer.classList.toggle("open");
    });
    drawer.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        hamburger.classList.remove("open");
        drawer.classList.remove("open");
      });
    });
  }

  // Admin link injection from cache
  if (window._cachedAdmin) window.setAdminNav && window.setAdminNav(true);

  // WhatsApp float bubble
  setTimeout(function () {
    var ht = document.getElementById("help-text");
    if (ht) ht.classList.add("visible");
  }, 4000);
}, 100);
// ── END NAV INTERACTIONS ──────────────────────────────────────────

// ── ADMIN LINK INJECTION ──────────────────────────────────────────
window.setAdminNav = function (isAdmin) {
  if (!isAdmin) return;
  if (window.location.pathname.indexOf("/admin/") !== -1) return;
  var navUser  = document.getElementById("nav-user");
  var dropdown = navUser ? navUser.querySelector(".nav-dropdown") : null;
  var logout   = dropdown ? dropdown.querySelector(".danger") : null;
  if (dropdown && logout && !document.getElementById("admin-nav-link")) {
    var a       = document.createElement("a");
    a.id        = "admin-nav-link";
    a.className = "nav-dropdown-item";
    a.innerHTML = '<span class="item-icon">🔧</span> Admin Panel';
    a.style.borderTop = "1px solid #EEEBEB";
    a.href = "admin/index.html";
    dropdown.insertBefore(a, logout);
  }
};
// ── END ADMIN LINK INJECTION ──────────────────────────────────────
