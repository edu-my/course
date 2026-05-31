// ============================================================
// js/pages/home.js — Home page
// Maintains exact design from original index.html
// ============================================================

import {
  collection, getDocs, query, where, doc, getDoc
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

export async function render(root, params, state) {
  root.innerHTML = `

  <!-- ── HERO ────────────────────────────────────────────── -->
  <section class="hero">
    <div>
      <div class="hero-eyebrow"><div class="hero-dot"></div> CPD Accredited Courses</div>
      <h1>LEARN SMARTER.<br/><em>TEACH</em> BETTER.</h1>
      <p class="hero-sub">Professional education in soft skills, personal development, and AI — built for Malaysian educators.</p>
      <div class="hero-btns">
        <a href="#/courses" class="btn-w">Browse Courses</a>
        <a href="#/courses?filter=free" class="btn-ow">Free Courses →</a>
      </div>
      <div class="hero-trust">
        <div class="trust-avs">
          <div class="trust-av" style="background:#A81F1F">K</div>
          <div class="trust-av" style="background:#1E8A4C">A</div>
          <div class="trust-av" style="background:#1A5FAB">R</div>
          <div class="trust-av" style="background:#B36200">N</div>
        </div>
        <div class="trust-txt">Trusted by <strong>100+ Malaysian educators</strong></div>
      </div>
    </div>
    <div class="hero-visual">
      <div class="book-wrap">
        <div class="book-latest">✦ Latest Release</div>
        <div class="book-shadow"></div>
        <div class="book-card">
          <div class="book-cover">
            <div class="book-spine"></div>
            <div class="book-pages">
              <div class="bp l"></div><div class="bp m"></div><div class="bp l"></div>
              <div class="bp s"></div><div class="bp m"></div>
            </div>
            <div class="book-new-tag">NEW</div>
          </div>
          <div class="book-title" id="hero-course-title">&nbsp;</div>
          <div class="book-meta"  id="hero-course-meta">&nbsp;</div>
          <div class="book-stats">
            <div><div class="bs-n" id="hcs-enrolled">—</div><div class="bs-l">Enrolled</div></div>
            <div><div class="bs-n">4.9★</div><div class="bs-l">Rating</div></div>
            <div><div class="bs-n" id="hcs-price">—</div><div class="bs-l">Price</div></div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ── TICKER ───────────────────────────────────────────── -->
  <div class="ticker-wrap">
    <div class="ticker-track" id="ticker-track"></div>
  </div>

  <!-- ── STATS ────────────────────────────────────────────── -->
  <div class="stats-strip">
    <div class="stat-item"><strong>100+</strong><span>Students Enrolled</span></div>
    <div class="stat-item"><strong id="stat-courses">—</strong><span>Courses Available</span></div>
    <div class="stat-item"><strong>4.9★</strong><span>Average Rating</span></div>
    <div class="stat-item"><strong>CPD</strong><span>Accredited Content</span></div>
  </div>

  <!-- ── INTERACTIVE PREVIEW ──────────────────────────────── -->
  <section class="preview-section">
    <div class="preview-sidebar">
      <div class="preview-sidebar-title">Course Previews</div>
      <div class="preview-items-row" id="preview-list"></div>
    </div>
    <div class="preview-panel" id="preview-panel">
      <div style="margin:auto;text-align:center;color:rgba(255,255,255,.3);font-size:.85rem;">Loading previews...</div>
    </div>
  </section>

  <!-- ── HOW IT WORKS ─────────────────────────────────────── -->
  <section class="hiw-section">
    <div class="hiw-eyebrow">How it works</div>
    <div class="hiw-title">SIMPLE. FAST. YOURS.</div>
    <p class="hiw-sub">Four steps to your next CPD certificate.</p>
    <div class="hiw-grid">
      <div class="hiw-step"><div class="hiw-n">1</div><h4>Browse &amp; Choose</h4><p>Explore free and paid courses built for Malaysian educators.</p></div>
      <div class="hiw-step"><div class="hiw-n">2</div><h4>Register &amp; Enroll</h4><p>Create a free account in under a minute. No credit card.</p></div>
      <div class="hiw-step"><div class="hiw-n">3</div><h4>Pay via DuitNow</h4><p>Scan QR, send receipt via WhatsApp. Instant access.</p></div>
      <div class="hiw-step"><div class="hiw-n">4</div><h4>Learn &amp; Certify</h4><p>Complete modules. Download your CPD certificate.</p></div>
    </div>
  </section>

  <!-- ── CTA ──────────────────────────────────────────────── -->
  <section class="cta-section">
    <h2>START LEARNING.<br/><span>GROW FASTER.</span></h2>
    <p>Join 100+ Malaysian educators already learning with edu-my.web</p>
    <div class="cta-btns">
      <a href="#/courses" class="btn-cta-r">Browse All Courses</a>
      <a href="#/courses?filter=free" class="btn-cta-o">View Free Courses</a>
    </div>
  </section>

  <!-- ── FOOTER ────────────────────────────────────────────── -->
  <footer class="footer">
    <div class="footer-grid">
      <div class="footer-brand">
        <a href="#/" class="nav-logo">edu-my.web</a>
        <p>CPD-accredited online learning in soft skills, personal development, education, and AI.</p>
      </div>
      <div class="footer-col"><h5>Courses</h5><ul>
        <li><a href="#/courses">All Courses</a></li>
        <li><a href="#/courses?filter=free">Free Courses</a></li>
      </ul></div>
      <div class="footer-col"><h5>Account</h5><ul>
        <li><a href="#/dashboard">My Dashboard</a></li>
        <li><a href="#/profile">My Profile</a></li>
      </ul></div>
      <div class="footer-col"><h5>Support</h5><ul>
        <li><a href="https://wa.me/60108402462" target="_blank">WhatsApp Us</a></li>
      </ul></div>
    </div>
    <div class="footer-bottom">
      <span>© 2025 edu-my.web. All rights reserved.</span>
      <span>Made for Malaysian learners 🇲🇾</span>
    </div>
  </footer>`;

  // ── DATA LOADING ───────────────────────────────────────────
  loadTicker(state.db);
  loadCourses(state.db);
}

// ── TICKER ────────────────────────────────────────────────────
const TICKER_FALLBACK = [
  { text: "🎓 New Course: MUET Writing Masterclass — Enroll Now",       url: "#/courses" },
  { text: "📢 CPD-accredited certificates now available for all courses", url: "#/courses" },
  { text: "🆓 AI for Educators is FREE — Start learning today",          url: "#/courses" },
  { text: "📱 Access all courses on any device, anytime",                url: "#/courses" },
  { text: "🇲🇾 Built for Malaysian educators — content in Malaysian context", url: "#/courses" },
];

async function loadTicker(db) {
  let items = TICKER_FALLBACK;
  try {
    const snap = await getDocs(query(collection(db, "announcements"), where("active", "==", true)));
    if (!snap.empty) { items = []; snap.forEach(d => items.push(d.data())); }
  } catch (e) {}

  try {
    const td = await getDoc(doc(db, "settings", "ticker"));
    if (td.exists() && td.data().bgColor) {
      const tw = document.querySelector(".ticker-wrap");
      if (tw) {
        tw.style.background = td.data().bgColor;
        tw.style.setProperty("--ticker-bg", td.data().bgColor);
      }
    }
  } catch (e) {}

  const track = document.getElementById("ticker-track");
  if (!track) return;
  const all = [...items, ...items];
  track.innerHTML = all.map(i =>
    `<a class="ticker-item" href="${i.url || "#/courses'}"}"><span class="ticker-dot"></span>${i.text}</a>`
  ).join("");
  track.style.animationDuration = (items.length * 6) + "s";
}

// ── COURSES + HERO CARD ───────────────────────────────────────
let PREVIEWS = [], activePreview = 0;

async function loadCourses(db) {
  try {
    const snap = await getDocs(query(collection(db, "courses"), where("isPublished", "==", true)));
    const courses = [];
    snap.forEach(d => courses.push({ id: d.id, ...d.data() }));
    courses.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

    // Stats
    const statEl = document.getElementById("stat-courses");
    if (statEl) statEl.textContent = courses.length;

    // Hero card — latest course
    if (courses.length) {
      const c       = courses[0];
      const isFree  = c.isFree === true;
      const mods    = (c.modules || []).length;
      const lessons = (c.modules || []).reduce((s, m) => s + (m.lessons || []).length, 0);
      const set     = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
      set("hero-course-title", c.title);
      set("hero-course-meta",
        (mods ? mods + " module" + (mods !== 1 ? "s" : "") : "") +
        (lessons ? " · " + lessons + " lesson" + (lessons !== 1 ? "s" : "") : "") +
        (c.totalDuration ? " · " + c.totalDuration : "")
      );
      set("hcs-enrolled", c.enrollmentCount || "0");
      set("hcs-price", isFree ? "Free" : "RM " + parseFloat(c.price || 0).toFixed(2));
    }

    // Interactive preview
    const nums = ["01", "02", "03", "04"];
    PREVIEWS = courses.slice(0, 4).map((c, i) => {
      const mods = (c.modules || []).length;
      return {
        num:     nums[i],
        title:   c.title,
        sub:     c.category || "Course",
        module:  (c.modules && c.modules[0]) ? c.modules[0].title : "Module 1",
        quote:   `"${c.description ? (c.description.substring(0, 80) + (c.description.length > 80 ? "..." : "")) : c.title}"`,
        content: c.description || c.title,
        tags:    [c.category || "Course", c.isFree ? "FREE" : "RM " + parseFloat(c.price || 0).toFixed(2), mods + " MODULE" + (mods !== 1 ? "S" : "")],
        url:     `#/course?id=${c.id}`,
      };
    });

    if (PREVIEWS.length) {
      renderPreviewList();
      renderPreviewPanel();
    }

    window.addEventListener("resize", () => { if (PREVIEWS.length) renderPreviewList(); });

  } catch (e) { console.error(e); }
}

function renderPreviewList() {
  const isMobile = window.innerWidth <= 900;
  const el = document.getElementById("preview-list");
  if (!el) return;
  el.innerHTML = PREVIEWS.map((p, i) => `
    <div class="preview-item ${i === activePreview ? "active" : ""}" data-idx="${i}">
      <div class="preview-num">${p.num}</div>
      <div>
        <div class="preview-item-title">${p.title}</div>
        ${!isMobile ? `<div class="preview-item-sub">${p.sub}</div>` : ""}
      </div>
    </div>`).join("");

  el.querySelectorAll(".preview-item").forEach(item => {
    item.addEventListener("click", () => {
      activePreview = parseInt(item.dataset.idx);
      renderPreviewList();
      renderPreviewPanel();
    });
  });
}

function renderPreviewPanel() {
  const el = document.getElementById("preview-panel");
  if (!el || !PREVIEWS.length) return;
  const p = PREVIEWS[activePreview];
  el.innerHTML = `
    <div class="preview-panel-bar">
      <div class="preview-breadcrumb">${p.module}</div>
      <div class="preview-live"><div class="preview-live-dot"></div> Live Preview</div>
    </div>
    <div class="preview-quote">${p.quote}</div>
    <div class="preview-box">${p.content}</div>
    <div class="preview-tags">${p.tags.map(t => `<span class="preview-tag">${t}</span>`).join("")}</div>
    <div class="preview-cta">
      <a class="btn-prev-r" href="${p.url}">View This Course</a>
      <a href="#/courses" class="btn-prev-g">All Courses</a>
    </div>`;
}
