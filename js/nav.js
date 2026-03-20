// nav.js - Dropdown toggle + hamburger + admin link injection
setTimeout(function() {
  // Dropdown
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

  // Hamburger
  var hamburger = document.getElementById("nav-hamburger");
  var drawer    = document.getElementById("nav-mobile-drawer");
  if (hamburger && drawer) {
    hamburger.addEventListener("click", function(e) {
      e.stopPropagation();
      hamburger.classList.toggle("open");
      drawer.classList.toggle("open");
    });
    var links = drawer.querySelectorAll("a");
    links.forEach(function(link) {
      link.addEventListener("click", function() {
        hamburger.classList.remove("open");
        drawer.classList.remove("open");
      });
    });
  }
}, 200);

// Called by pages when user is confirmed admin
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
