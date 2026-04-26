// admin-badge.js — sync pending payment badge across admin pages
// Include this script on every admin page BEFORE the module script.
//
// On load: reads cached count from sessionStorage → sets badge instantly.
// When a page fetches payments, call: cachePendingCount(n) to update cache.

(function(){
  // Apply cached count immediately (no Firestore call needed)
  try {
    var count = sessionStorage.getItem('adminPendingCount');
    if (count !== null) {
      var badge = document.getElementById('pending-badge');
      if (badge) badge.textContent = count;
    }
  } catch(e) {}
})();

// Call this after fetching/updating payments to keep all pages in sync
window.cachePendingCount = function(n) {
  try {
    sessionStorage.setItem('adminPendingCount', n);
    var badge = document.getElementById('pending-badge');
    if (badge) badge.textContent = n;
  } catch(e) {}
};
