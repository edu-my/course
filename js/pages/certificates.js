// Migrate your PAGE.html content and logic into this file.
// params.get("id") reads ?id=xxx from the URL
// state.user, state.isAdmin, state.db, state.auth
export async function render(root, params, state) {
  root.innerHTML = `
    <div style="padding:4rem var(--page-padding);text-align:center;">
      <h2 style="font-family:'Bebas Neue',sans-serif;font-size:2.5rem;letter-spacing:1px;">Coming Soon</h2>
      <p style="color:var(--gray-500);margin-top:.5rem;">Migrate your existing HTML and logic into js/pages/certificates.js</p>
      <a href="#/" style="display:inline-block;margin-top:1.5rem;color:var(--red);font-weight:600;">Back to Home</a>
    </div>`;
}
