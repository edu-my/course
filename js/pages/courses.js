// ============================================================
// js/pages/courses.js — Courses browse page
// ============================================================

import {
  collection, getDocs, query, where, doc, getDoc
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

export async function render(root, params, state) {
  root.innerHTML = `
  <div class="page-header">
    <div class="page-header-inner">
      <div>
        <h1>ALL COURSES</h1>
        <p>Free and paid courses available</p>
      </div>
      <span class="page-header-count" id="header-count"></span>
    </div>
  </div>

  <div class="filter-bar">
    <div class="filter-bar-inner">
      <div class="filter-pills">
        <button class="filter-pill active" data-filter="all">All</button>
        <button class="filter-pill" data-filter="free">🆓 Free</button>
        <button class="filter-pill" data-filter="paid">💳 Paid</button>
        <button class="filter-pill" data-filter="AI">🤖 AI</button>
        <button class="filter-pill" data-filter="Soft Skills">💬 Soft Skills</button>
        <button class="filter-pill" data-filter="Personal Development">🌱 Personal Dev</button>
        <button class="filter-pill" data-filter="Education">📚 Education</button>
      </div>
      <div class="search-wrap">
        <span class="search-icon">🔍</span>
        <input type="text" class="search-input" id="search-input" placeholder="Search courses..."/>
      </div>
      <div class="view-toggle">
        <button class="view-toggle-btn" id="view-list" title="List view">☰</button>
        <button class="view-toggle-btn active" id="view-grid" title="Grid view">▦</button>
      </div>
    </div>
  </div>

  <div class="layout-single">
    <div class="results-bar" id="results-bar"></div>
    <div class="courses-grid" id="courses-container">
      <div class="empty-state">Loading courses...</div>
    </div>
    <div class="pagination" id="pagination"></div>
  </div>

  <footer class="footer">
    <div class="footer-grid">
      <div class="footer-brand">
        <a href="#/" class="nav-logo">edu-my.web</a>
        <p>CPD-accredited online learning in soft skills, personal development, education, and AI.</p>
      </div>
      <div class="footer-col"><h5>Courses</h5><ul><li><a href="#/courses">All Courses</a></li><li><a href="#/courses?filter=free">Free Courses</a></li></ul></div>
      <div class="footer-col"><h5>Account</h5><ul><li><a href="#/dashboard">My Dashboard</a></li><li><a href="#/profile">My Profile</a></li></ul></div>
      <div class="footer-col"><h5>Support</h5><ul><li><a href="https://wa.me/60108402462" target="_blank">WhatsApp Us</a></li></ul></div>
    </div>
    <div class="footer-bottom"><span>© 2025 edu-my.web. All rights reserved.</span><span>Made for Malaysian learners 🇲🇾</span></div>
  </footer>`;

  // ── STATE ──────────────────────────────────────────────────
  let allCourses = [], activeFilter = "all", searchTerm = "", currentView = "grid", currentPage = 1;
  const PER_PAGE = 6;
  let userStatus = {}, isAdmin = state.isAdmin;
  const db = state.db, user = state.user;

  // Apply URL filter param
  const filterParam = params.get("filter");
  const catParam    = params.get("cat");
  if (filterParam === "free") { activeFilter = "free"; setActivePill("free"); }
  if (catParam) { activeFilter = catParam; setActivePill(catParam); }

  function setActivePill(val) {
    document.querySelectorAll(".filter-pill").forEach(p =>
      p.classList.toggle("active", p.dataset.filter === val)
    );
  }

  // ── LOAD USER STATUS ───────────────────────────────────────
  if (user) {
    try {
      const [es, ps] = await Promise.all([
        getDocs(query(collection(db, "enrollments"), where("userId", "==", user.uid))),
        getDocs(query(collection(db, "payments"),    where("userId", "==", user.uid))),
      ]);
      es.forEach(d => { userStatus[d.data().courseId] = "enrolled"; });
      ps.forEach(d => { const p = d.data(); if (!userStatus[p.courseId]) userStatus[p.courseId] = p.status; });
    } catch (e) {}
  }

  // ── LOAD COURSES ───────────────────────────────────────────
  try {
    const snap = await getDocs(query(collection(db, "courses"), where("isPublished", "==", true)));
    allCourses = [];
    snap.forEach(d => allCourses.push({ id: d.id, ...d.data() }));
    const hc = document.getElementById("header-count");
    if (hc) hc.textContent = allCourses.length + " course" + (allCourses.length !== 1 ? "s" : "");
    renderCourses();
  } catch (e) {
    document.getElementById("courses-container").innerHTML =
      `<div class="empty-state">Could not load courses: ${e.message}</div>`;
  }

  // ── COURSE BUTTON LOGIC ────────────────────────────────────
  function getCourseBtn(c) {
    const isFree = c.isFree === true, st = userStatus[c.id];
    if (isAdmin)          return { cls: "ghost", label: "View Course", href: `#/player?id=${c.id}` };
    if (st === "enrolled") return { cls: "green", label: "▶ Continue",  href: `#/player?id=${c.id}` };
    if (st === "approved") return { cls: "green", label: "✓ Start Now", href: `#/player?id=${c.id}` };
    if (st === "pending")  return { cls: "amber", label: "⏳ Pending",  href: `#/payment?course=${c.id}` };
    if (isFree)            return { cls: "green", label: "Start Free",  href: `#/course?id=${c.id}` };
    return { cls: "red", label: "Enroll Now", href: `#/course?id=${c.id}` };
  }

  function renderGridCard(c) {
    const isFree = c.isFree === true, price = isFree ? "FREE" : "RM " + parseFloat(c.price || 0).toFixed(2);
    const btn    = getCourseBtn(c), emoji = c.thumbnailEmoji || "📚";
    const cat    = c.category || "General", dur = c.totalDuration || "";
    const mods   = (c.modules || []).length;
    return `<div class="course-card-grid" onclick="location.hash='${btn.href}'">
      <div class="course-thumb thumb-dark">${emoji}
        <span class="course-badge ${isFree ? "badge-free-dark" : "badge-paid-dark"}">${price}</span>
        <span class="course-cat-label">${cat}</span>
      </div>
      <div class="course-body">
        <div class="course-cat">${cat}</div>
        <div class="course-title">${c.title}</div>
        <div class="course-desc">${c.description || ""}</div>
        <div class="course-duration">${dur ? "⏱ " + dur : ""}${dur && mods ? " · " : ""}${mods} module${mods !== 1 ? "s" : ""}</div>
        <div class="course-footer">
          <div class="course-price ${isFree ? "free" : ""}">${price}</div>
          <button class="course-btn ${btn.cls}" onclick="event.stopPropagation();location.hash='${btn.href}'">${btn.label}</button>
        </div>
      </div>
    </div>`;
  }

  function renderListRow(c) {
    const isFree = c.isFree === true, price = isFree ? "FREE" : "RM " + parseFloat(c.price || 0).toFixed(2);
    const btn = getCourseBtn(c), emoji = c.thumbnailEmoji || "📚";
    const mods = (c.modules || []).length, dur = c.totalDuration || "";
    return `<div class="course-card-row" onclick="location.hash='${btn.href}'">
      <div class="course-emoji">${emoji}</div>
      <div class="course-info">
        <h3>${c.title}</h3>
        <div class="course-meta">
          <span class="badge ${isFree ? "badge-free" : "badge-paid"}">${isFree ? "Free" : "Paid"}</span>
          <span>${c.category || "General"}</span><span>·</span>
          <span>${mods} module${mods !== 1 ? "s" : ""}</span>
          ${dur ? `<span>·</span><span>⏱ ${dur}</span>` : ""}
        </div>
      </div>
      <div class="course-price ${isFree ? "free" : ""}">${price}</div>
      <button class="course-btn ${btn.cls}" onclick="event.stopPropagation();location.hash='${btn.href}'">${btn.label}</button>
    </div>`;
  }

  function renderCourses() {
    const container = document.getElementById("courses-container");
    const bar       = document.getElementById("results-bar");
    const filtered  = allCourses.filter(c => {
      const mf = activeFilter === "all"
        || (activeFilter === "free" && c.isFree === true)
        || (activeFilter === "paid" && c.isFree !== true)
        || c.category === activeFilter;
      const ms = !searchTerm
        || c.title.toLowerCase().includes(searchTerm)
        || (c.description || "").toLowerCase().includes(searchTerm);
      return mf && ms;
    });
    const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
    if (currentPage > totalPages) currentPage = totalPages;
    const start = (currentPage - 1) * PER_PAGE;
    const paged = filtered.slice(start, start + PER_PAGE);

    bar.innerHTML = filtered.length
      ? `Showing <strong>${start + 1}–${Math.min(start + PER_PAGE, filtered.length)}</strong> of <strong>${filtered.length}</strong> courses`
      : `Showing <strong>0</strong> of <strong>${allCourses.length}</strong> courses`;

    container.className = currentView === "grid" ? "courses-grid" : "courses-list";

    if (!filtered.length) {
      container.innerHTML = `<div class="empty-state"><div class="empty-icon">🔍</div><h3>No courses found</h3><p>Try adjusting your filters or search term.</p></div>`;
      renderPagination(0);
      return;
    }
    container.innerHTML = paged.map(c => currentView === "grid" ? renderGridCard(c) : renderListRow(c)).join("");
    renderPagination(totalPages);
  }

  function renderPagination(totalPages) {
    const el = document.getElementById("pagination");
    if (totalPages <= 1) { el.innerHTML = ""; return; }
    let html = `<button class="pagination-btn" ${currentPage === 1 ? "disabled" : ""} data-page="${currentPage - 1}">‹ Prev</button>`;
    const maxV = 5;
    let startP = Math.max(1, currentPage - Math.floor(maxV / 2));
    let endP   = Math.min(totalPages, startP + maxV - 1);
    if (endP - startP < maxV - 1) startP = Math.max(1, endP - maxV + 1);
    if (startP > 1) { html += `<button class="pagination-btn" data-page="1">1</button>`; if (startP > 2) html += `<span class="pagination-info">…</span>`; }
    for (let i = startP; i <= endP; i++) html += `<button class="pagination-btn ${i === currentPage ? "active" : ""}" data-page="${i}">${i}</button>`;
    if (endP < totalPages) { if (endP < totalPages - 1) html += `<span class="pagination-info">…</span>`; html += `<button class="pagination-btn" data-page="${totalPages}">${totalPages}</button>`; }
    html += `<button class="pagination-btn" ${currentPage === totalPages ? "disabled" : ""} data-page="${currentPage + 1}">Next ›</button>`;
    el.innerHTML = html;
    el.querySelectorAll(".pagination-btn:not(:disabled)").forEach(btn => {
      btn.addEventListener("click", () => {
        currentPage = parseInt(btn.dataset.page);
        renderCourses();
        document.querySelector(".filter-bar")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  // ── EVENTS ────────────────────────────────────────────────
  document.querySelectorAll(".filter-pill").forEach(p => p.addEventListener("click", () => {
    document.querySelectorAll(".filter-pill").forEach(x => x.classList.remove("active"));
    p.classList.add("active");
    activeFilter = p.dataset.filter;
    currentPage  = 1;
    renderCourses();
  }));

  document.getElementById("search-input")?.addEventListener("input", e => {
    searchTerm  = e.target.value.toLowerCase().trim();
    currentPage = 1;
    renderCourses();
  });

  document.getElementById("view-list")?.addEventListener("click", () => {
    currentView = "list";
    document.getElementById("view-list").classList.add("active");
    document.getElementById("view-grid").classList.remove("active");
    currentPage = 1; renderCourses();
  });
  document.getElementById("view-grid")?.addEventListener("click", () => {
    currentView = "grid";
    document.getElementById("view-grid").classList.add("active");
    document.getElementById("view-list").classList.remove("active");
    currentPage = 1; renderCourses();
  });
}
