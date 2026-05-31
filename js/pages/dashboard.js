// ============================================================
// js/pages/dashboard.js
// ============================================================
export async function render(root, params, state) {
  // Paste your existing dashboard.html content logic here.
  // The state object gives you: state.user, state.isAdmin, state.db, state.auth
  root.innerHTML = `
  <div class="page-header dash-header">
    <div class="page-header-inner">
      <div>
        <h1>WELCOME BACK, <span id="hero-name" style="color:var(--red);">${(state.user?.displayName || "LEARNER").toUpperCase()}</span>!</h1>
        <p>Your learning progress at a glance</p>
      </div>
    </div>
  </div>
  <div id="dashboard-root" style="display:block;">
    <div class="layout-main">
      <div class="layout-content">
        <p style="color:var(--gray-500);padding:2rem 0;">Dashboard content — migrate your existing dashboard.html logic here.</p>
      </div>
    </div>
  </div>
  <footer class="footer">
    <div class="footer-bottom"><span>© 2025 edu-my.web.</span><span>Made for Malaysian learners 🇲🇾</span></div>
  </footer>`;
}
