// ========================================================
// FILE: js/nav.js
// PURPOSE: Shared navbar — dropdown toggle + hamburger.
//          Loaded on every page via <script src>
// ========================================================

// #### NAV INIT ####
setTimeout(() => {

  // #### NAV DROPDOWN TOGGLE ####
  const navUser     = document.getElementById("nav-user");
  const navDropdown = navUser?.querySelector(".nav-dropdown");

  navUser?.addEventListener("click", (e) => {
    e.stopPropagation();
    navUser.classList.toggle("open");
  });

  navDropdown?.addEventListener("click", (e) => {
    e.stopPropagation();
  });

  document.addEventListener("click", () => {
    navUser?.classList.remove("open");
  });
  // #### END NAV DROPDOWN TOGGLE ####


  // #### HAMBURGER MENU TOGGLE ####
  const hamburger = document.getElementById("nav-hamburger");
  const drawer    = document.getElementById("nav-mobile-drawer");

  if (hamburger) {
    const newHamburger = hamburger.cloneNode(true);
    hamburger.parentNode.replaceChild(newHamburger, hamburger);
    newHamburger.addEventListener("click", (e) => {
      e.stopPropagation();
      newHamburger.classList.toggle("open");
      drawer?.classList.toggle("open");
    });
  }

  drawer?.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      document.getElementById("nav-hamburger")?.classList.remove("open");
      drawer.classList.remove("open");
    });
  });
  // #### END HAMBURGER MENU TOGGLE ####

}, 300);
// #### END NAV INIT ####
