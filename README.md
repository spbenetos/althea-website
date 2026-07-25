# Althea marketing site (althea.team)

Static site for GitHub Pages. No build step — everything runs in the browser.

## Deploy
Copy the entire contents of this folder to the repo root of the GitHub Pages branch. `CNAME` maps it to althea.team.

## Files
- `index.html` — the page shell: meta/OG tags, JSON-LD, base CSS vars, script loads. React 18 + Babel standalone are loaded from unpkg with pinned versions + integrity hashes — keep them pinned.
- `site-app.jsx` — root component, assembles the sections in order.
- `site-sections.jsx` — hero, feature card stack, most page sections (largest file).
- `site-showcase.jsx` — screenshot showcase section.
- `site-extras.jsx` — footer, FAQ, smaller sections.
- `site-anim.jsx` — scroll/reveal animation helpers.
- `phone-screens.jsx` — phone frame + screen art wrapper.
- `tweaks-panel.jsx` — design-time tweak controls (harmless in production).
- `image-slot.js` — drag-and-drop image placeholder web component.
- `ref-links.js` — rewrites App Store links when `?ref=creator` is present (campaign token).
- `404.html`, `privacy-policy/index.html`, `terms-of-use/index.html` — extra pages. `privacy-policy.html` / `terms-of-use.html` are redirect stubs to the folder URLs.
- `app-icon.png`, `leaf.png`, `og-image.png` — brand/meta art.
- `screenshots/` — hero phone art (hero-left/center/right), feature images (feat-1..3), and `screenshots/cards/*.png` for the feature card stack.

## Editing notes
- Each `<script type="text/babel">` file has its own scope; shared components are exported via `Object.assign(window, {...})` at the end of each file. Keep that pattern when adding components.
- Card screenshot paths are mapped in `CARD_SHOTS` in `site-sections.jsx`.
- Adding a new .jsx file means adding a matching `<script type="text/babel" src="...">` tag in `index.html`, before `site-app.jsx`.
