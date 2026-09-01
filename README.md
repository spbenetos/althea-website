# Althea marketing site (althea.team)

Static site for GitHub Pages. No build step — everything runs in the browser.

## Deploy
GitHub Pages publishes from the **`main`** branch (classic "deploy from a branch"),
serving the repo root. Pushing to `main` triggers a `pages build and deployment`
run; the site is live about a minute later. Work on a branch if you like, but
nothing reaches althea.team until it lands on `main`. `CNAME` maps the domain.

## Files
- `index.html` — page shell: SEO meta/OG tags, FAQ structured data, the drifting-cloud background, base CSS, pinned React/Babel loads. Keep the script versions + integrity hashes pinned, and keep `site-core.jsx` loading first.
- `site-video-app.jsx` — root component. Renders `DarkNavBar`, `ScrollStage`, `DarkFAQSection`, `DarkFooter`, `ScrollHint`.
- `site-scrollstage.jsx` — the scroll-driven rotating 3D iPhone and its glass copy panels (`STAGE_SCENES`). Needs `vendor/phone3d.bundle.js` (global `Phone3D`) loaded first.
- `vendor/phone3d.bundle.js` — prebuilt 3D phone renderer from althea-phone-3d.
- `liquid-bg.js` — teal liquid field behind the phone stage: CSS radial-gradient blobs on transform-only keyframes, so it stays on the compositor. `window.createLiquidLayer({...})`.
- `site-dark.jsx` — nav, FAQ and footer chrome.
- `site-scrollhint.jsx` — swipe-down nudge shown after ~6s idling at the top.
- `site-core.jsx` — shared primitives: `AnimContext`, `TweaksContext`, `RevealOnScroll`, `useIsMobile`, `AltheaLogo`, `AppStoreBadge`.
- `tweaks-panel.jsx` — design-time tweak controls (harmless in production).
- `ref-links.js` — normalizes App Store links to the real listing and appends the referral parameter when `?ref=` is present.
- `404.html`, `privacy-policy/`, `terms-of-use/` — extra pages; root `privacy-policy.html` / `terms-of-use.html` are redirect stubs.
- `screens/` — the six `screen-N.jpg` frames mapped onto the 3D phone in scroll order.
- `app-icon.png`, `og-image.png` — favicon/logo mark and social card.

## Editing notes
- Each `<script type="text/babel">` file has its own scope; shared components are exported via `Object.assign(window, {...})` at the end of each file. Keep that pattern, and keep `site-core.jsx` ahead of its consumers in `index.html`.
- Typography is the system stack (SF Pro on Apple platforms); h1/h2 pick it up through the `--display` custom property in `index.html`. No web fonts are loaded.
- Background clouds and the scroll hint respect `prefers-reduced-motion`.
- Every file in the repo is reachable from `index.html`. If you add an asset, wire it up or drop it — dead files are how the tree got confusing before.
