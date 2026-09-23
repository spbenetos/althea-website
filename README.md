# Althea marketing site (althea.team)

Static site for GitHub Pages. No build step — everything runs in the browser.

## Deploy
GitHub Pages publishes from the **`main`** branch (classic "deploy from a branch"),
serving the repo root. Pushing to `main` triggers a `pages build and deployment`
run; the site is live about a minute later. Work on a branch if you like, but
nothing reaches althea.team until it lands on `main`. `CNAME` maps the domain.

## Files
- `index.html` — the whole first screen. The hero is **static HTML**: it paints with no
  React, no JSX compiler and no CDN round-trip. Below it sits the loader that pulls
  PRODUCTION React (~139 KB, not the 1.2 MB dev builds) and the app only on intent —
  a scroll toward the tour, a click on the scroll cue, a deep link, or an idle moment.
  Also holds SEO meta/OG tags, FAQ structured data and the base CSS. Keep the script
  versions and their SRI hashes pinned together; a hash that does not match the pinned
  file silently stops the app from ever booting.
- `app-bundle.js` — the five .jsx files precompiled and concatenated in `FILES` order.
  When present it is the fast path: **one** request, and the 3 MB in-browser Babel is
  never downloaded. If it is missing the page falls back to fetching the .jsx and
  compiling in the browser, caching the output in `localStorage`.
- `build-bundle.html` — open it on the deployed site and click Compile & download to
  regenerate `app-bundle.js`. It must stay deployed: it fetches the .jsx over HTTP.
- `site-kit.jsx` — shared primitives, lifted verbatim from `site-sections.jsx`:
  `TweaksContext`, `AnimContext`, `RevealOnScroll`, `useIsMobile`, `AltheaLogo`,
  `AppStoreBadge`. Loads first; the other files depend on it.
- `site-video-app.jsx` — root component for everything below the hero.
- `site-scrollstage.jsx` — the scroll-driven rotating 3D iPhone and its glass copy panels
  (`STAGE_SCENES`) plus the desktop interlude panels. Needs `vendor/phone3d.bundle.js`
  (global `Phone3D`). Dispatches `althea:stage-ready`, which adds `html.stage-ready` and
  fades `.stage-3d` up; a 9s failsafe reveals it anyway.
- `site-dark.jsx` — nav, FAQ and footer chrome.
- `tweaks-panel.jsx` — design-time tweak controls (harmless in production).
- `vendor/phone3d.bundle.js` — prebuilt 3D phone renderer from althea-phone-3d.
- `liquid-bg.js` — teal liquid field behind the phone stage: CSS radial-gradient blobs on
  transform-only keyframes, so it stays on the compositor. `window.createLiquidLayer({...})`.
- `ref-links.js` — normalizes App Store links to the real listing and appends the referral
  parameter when `?ref=` is present.
- `404.html`, `privacy-policy/`, `terms-of-use/` — extra pages; root `privacy-policy.html`
  / `terms-of-use.html` are redirect stubs.
- `screens/d/`, `screens/m/` — the six phone-screen textures at desktop (880x1914) and
  mobile (663x1442) sizes; `site-scrollstage.jsx` picks a set by viewport and `index.html`
  preloads only the matching one via `media` on each `<link>`.
- `icon-192.png`, `og-image.jpg`, `leaf-icon-hd.png`, `laurel-mark-hd.png` — favicon/logo
  mark, social card, and the leaf and award wreaths in the static hero.
- `screens/hero-d.jpg` (560x1218) / `screens/hero-m.jpg` (386x840) — the hero phone shot,
  sized for the hero rather than reusing a full 3D texture.
- `vendor/phone3d.bundle.js` + `liquid-bg.js` are **not** referenced by `index.html`. They
  are injected at runtime by `STAGE_DEPS` in `site-scrollstage.jsx` when the tour comes
  within a viewport (or after 4s idle, skipped on save-data/2G). They must stay on the
  server: without them the stage falls back to a static phone image forever.

## Editing notes
- Each .jsx file has its own scope; shared components are exported via
  `Object.assign(window, {...})` at the end of each file. Keep that pattern, and keep
  `site-kit.jsx` first in the loader's `FILES` list.
- Adding a .jsx file means adding it to `FILES` in `index.html` AND in `build-bundle.html`.
- **Editing any .jsx means rebuilding `app-bundle.js`.** The bundle is what actually runs;
  a .jsx edit alone changes nothing on the live site and silently leaves source and
  behaviour out of step.
- Typography is the system stack (SF Pro on Apple platforms). No web fonts are loaded.
- Animations respect `prefers-reduced-motion`.
- Every file in the repo is reachable from `index.html` **or from `STAGE_DEPS`**. If you add
  an asset, wire it up or drop it — dead files are how the tree got confusing before.
- Hero images are first-paint cost. Ship them at roughly 2-3x their CSS display size, not at
  master resolution: `laurel-mark-hd.png` was 450x940 for a 33x68 slot and cost 193 KB on
  every first paint; at 100x209 it costs 3.7 KB and looks identical.
- **Privacy copy is load-bearing.** It now lives in FOUR places: the hero chip and the
  FAQPage structured data in `index.html`, the FAQ answer in `site-dark.jsx`, and the
  compiled copy of that answer inside `app-bundle.js`. Section 3 of the privacy policy is
  the source of truth. Do not restore "runs with no servers" or "no analytics" — the
  onboarding record in section 3 contradicts them.
