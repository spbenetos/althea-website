# Althea marketing site (althea.team)

Static site for GitHub Pages. No build step — everything runs in the browser.

## Deploy
Copy the entire contents of this folder to the repo root of the GitHub Pages branch. `CNAME` maps it to althea.team.

## Files
- `index.html` — page shell: SEO meta/OG tags (medication names in title), FAQ structured data, base CSS (incl. the Newsreader serif headline override + focus rings), pinned React/Babel loads. Keep the script versions + integrity hashes pinned.
- `site-app.jsx` — root component; section order lives here.
- `site-sections.jsx` — nav (blur on scroll), hero, medication wall, impact band, trust bar, feature cards, deep dives + drug-level scrubber strip, journey steps, privacy band, pricing, final CTA, footer.
- `site-showcase.jsx` — screenshot gallery.
- `site-extras.jsx` — FAQ, sticky mobile CTA, QR code.
- `site-anim.jsx` — animation helpers + `DrugLevelScrub` (scroll-scrubbed pharmacokinetic curve).
- `phone-screens.jsx` — iPhone bezel; screenshot paths map in `SCREENSHOTS`.
- `tweaks-panel.jsx` — design-time tweak controls (harmless in production).
- `image-slot.js` — drag-and-drop image placeholder web component.
- `ref-links.js` — rewrites App Store links when `?ref=creator` is present.
- `404.html`, `privacy-policy/`, `terms-of-use/` — extra pages; root `privacy-policy.html` / `terms-of-use.html` are redirect stubs.
- `screenshots/` — hero/deep-dive phone art (`hero-center-780.webp` is the optimized hero; the original `hero-center.png` is unused but kept) and `cards/` for the feature-card gallery.

## Editing notes
- Each `<script type="text/babel">` file has its own scope; shared components are exported via `Object.assign(window, {...})` at the end of each file. Keep that pattern.
- Headline font: h1/h2 are globally set to Newsreader via an `!important` override in `index.html`; mono labels use JetBrains Mono inline.
- Fonts load from Google Fonts (Newsreader + JetBrains Mono).
