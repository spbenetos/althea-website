# Althea marketing site (althea.team)

Static site for GitHub Pages. No build step — everything runs in the browser.

## Deploy
Copy the entire contents of this folder to the repo root of the GitHub Pages branch. `CNAME` maps it to althea.team.

## Files
- `index.html` — page shell: SEO meta/OG tags (medication names in title), FAQ structured data, the dark drifting-cloud background, base CSS, pinned React/Babel loads. Keep the script versions + integrity hashes pinned.
- `site-video-app.jsx` — root component; section order lives here. The hero and screenshot showcase are replaced by `<ScrollStage />`.
- `site-scrollstage.jsx` — scroll-driven rotating 3D iPhone with the glass copy panels (`STAGE_SCENES`). Needs `vendor/phone3d.bundle.js` (global `Phone3D`) loaded first.
- `vendor/phone3d.bundle.js` — prebuilt 3D phone renderer from althea-phone-3d.
- `liquid-bg.js` — WebGL teal liquid field behind the phone stage; `window.createLiquidLayer({...})`.
- `site-dark.jsx` — dark-theme chrome for this page (nav, FAQ, footer). The light components in `site-sections.jsx` are left untouched.
- `site-scrollhint.jsx` — swipe-down nudge shown after ~6s idling at the top.
- `site-sections.jsx` — component library: nav, hero, medication wall, impact band, trust bar, feature cards, deep dives + drug-level scrubber strip, journey steps, privacy band, pricing, final CTA, footer.
- `site-showcase.jsx` — screenshot gallery.
- `site-extras.jsx` — FAQ, sticky mobile CTA, QR code.
- `site-anim.jsx` — animation helpers + `DrugLevelScrub` (scroll-scrubbed pharmacokinetic curve).
- `phone-screens.jsx` — iPhone bezel; screenshot paths map in `SCREENSHOTS`.
- `tweaks-panel.jsx` — design-time tweak controls (harmless in production).
- `image-slot.js` — drag-and-drop image placeholder web component.
- `ref-links.js` — normalizes App Store links to the real listing and appends `?ref=creator` when present.
- `404.html`, `privacy-policy/`, `terms-of-use/` — extra pages; root `privacy-policy.html` / `terms-of-use.html` are redirect stubs.
- `screens/` — the six `screen-N.jpg` frames mapped onto the 3D phone in scroll order.
- `screenshots/` — hero/deep-dive phone art (`hero-center-780.webp` is the optimized hero; the original `hero-center.png` is unused but kept) and `cards/` for the feature-card gallery.

## Editing notes
- Each `<script type="text/babel">` file has its own scope; shared components are exported via `Object.assign(window, {...})` at the end of each file. Keep that pattern.
- Typography is the system stack (SF Pro on Apple platforms); h1/h2 pick it up through the `--display` custom property set in `index.html`. No web fonts are loaded.
- Background clouds and the scroll hint respect `prefers-reduced-motion`.
