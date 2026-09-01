// ref-links.js — creator referral links (no backend)
// Share links like https://althea.team/?ref=creatorname
// The ref code is remembered for the session and appended to every App Store
// link as an Apple campaign token (ct), so installs show up per-creator in
// App Store Connect → Analytics → Campaigns.
// ALTHEA_PT: your Apple provider ID from App Store Connect (needed for campaign
// reporting). Leave '' until you have it — links still get ct + ref.
(function () {
  var ALTHEA_PT = '';
  var APP_STORE = 'https://apps.apple.com/gr/app/althea-glp-1-tracker/id6792283773';
  // Any placeholder or bare store link resolves to the real listing.
  function normalizeStore(url) {
    if (!url) return url;
    try {
      var u = new URL(url, location.href);
      if (u.hostname.indexOf('apple.com') === -1) return url;
      if (/\/id\d+/.test(u.pathname)) return url;   // already a real listing
      var t = new URL(APP_STORE);
      u.searchParams.forEach(function (v, k) { t.searchParams.set(k, v); });
      return t.href;
    } catch (e) { return url; }
  }
  window.altheaAppStore = APP_STORE;
  window.altheaNormalizeStore = normalizeStore;
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    var h = a.getAttribute('href'), n = normalizeStore(h);
    if (n !== h) a.setAttribute('href', n);
  }, true);

  var ref = null;
  try {
    var q = new URLSearchParams(location.search).get('ref');
    if (q) { q = q.replace(/[^\w.-]/g, '').slice(0, 40); if (q) sessionStorage.setItem('althea-ref', q); }
    ref = sessionStorage.getItem('althea-ref');
  } catch (e) {}
  if (!ref) return;
  window.altheaRef = ref;
  function withRef(url) {
    if (!url || url.charAt(0) === '#') return url;
    try {
      var u = new URL(url, location.href);
      if (u.hostname.indexOf('apple.com') !== -1) {
        u.searchParams.set('ct', ref);
        u.searchParams.set('mt', '8');
        if (ALTHEA_PT) u.searchParams.set('pt', ALTHEA_PT);
      } else if (u.hostname === location.hostname) {
        u.searchParams.set('ref', ref);
      } else return url;
      return u.href;
    } catch (e) { return url; }
  }
  window.altheaWithRef = withRef;
  // Rewrite links at click time so it works with React-rendered anchors.
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    var h = a.getAttribute('href');
    var w = withRef(normalizeStore(h));
    if (w !== h) a.setAttribute('href', w);
  }, true);
})();
