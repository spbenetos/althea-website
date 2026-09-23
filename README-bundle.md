# app-bundle.js — what it is and when to rebuild it

`index.html` does **not** load the `.jsx` files in production. It loads
**`app-bundle.js`**: the five sources below, Babel-transformed and concatenated in
this exact order, each wrapped in its own IIFE (they run as separate `<script>`s
otherwise, so the wrapper preserves their scoping):

1. `site-kit.jsx`
2. `tweaks-panel.jsx`
3. `site-dark.jsx`
4. `site-scrollstage.jsx`
5. `site-video-app.jsx`

## Why

The fallback path compiles the JSX in the browser, which costs a **3 MB** download of
`@babel/standalone` on every first visit. The bundle is 77 KB and removes that
entirely.

## The trap

**Editing a `.jsx` has no effect on the live site until the bundle is rebuilt.** Any
copy change — a privacy claim, a price, an FAQ answer — exists twice: in the source
and compiled inside `app-bundle.js`. The bundle is what executes. Fix both.

Two guards exist:

- Every `.jsx` opens with a banner comment saying so.
- On `localhost`, or with `?src` in the URL, `index.html` skips the bundle and
  compiles the sources, so local editing always shows the truth.

## Rebuilding

Transform each file with Babel's `react` preset, wrap, concatenate in the order
above, write to `app-bundle.js`. Equivalent to:

```js
const parts = FILES.map(f => '/* ' + f + ' */\n(function(){\n'
  + Babel.transform(read(f), { presets: ['react'], filename: f }).code + '\n})();');
write('app-bundle.js', header + parts.join('\n'));
```

## If in doubt

**Delete `app-bundle.js`.** The loader falls back to compiling the `.jsx` in the
browser — correct output, just slow. A wrong-but-fast bundle is worse than no bundle.

## Also required in a deploy

`vendor/phone3d.bundle.js` and `liquid-bg.js` are injected at runtime by
`index.html` and are **not** referenced by any `<script src>` a crawler would see.
They are easy to miss when assembling an export; without them the scroll tour never
appears.
