// liquid-bg.js — teal liquid field behind the phone stage.
// Pure CSS: soft radial-gradient blobs drifting on transform-only keyframes, so the
// whole layer lives on the compositor — no per-frame raster, no canvas, no flicker.
// window.createLiquidLayer({ container, color, rate, intensity }) -> { setProgress, dispose }
(function () {
  const STYLE_ID = '__liquid_bg_keys';

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const s = document.createElement('style');
    s.id = STYLE_ID;
    // each blob drifts a different way, so the mass reads as liquid moving in
    // several directions at once rather than one sliding sheet
    s.textContent = `
@keyframes liqA{0%{transform:translate3d(-18%,-6%,0) scale(1)}50%{transform:translate3d(16%,8%,0) scale(1.18)}100%{transform:translate3d(-18%,-6%,0) scale(1)}}
@keyframes liqB{0%{transform:translate3d(14%,10%,0) scale(1.1)}50%{transform:translate3d(-12%,-9%,0) scale(.9)}100%{transform:translate3d(14%,10%,0) scale(1.1)}}
@keyframes liqC{0%{transform:translate3d(-8%,12%,0) scale(.95)}50%{transform:translate3d(20%,-11%,0) scale(1.22)}100%{transform:translate3d(-8%,12%,0) scale(.95)}}
@keyframes liqD{0%{transform:translate3d(10%,-14%,0) scale(1.15)}50%{transform:translate3d(-16%,6%,0) scale(.94)}100%{transform:translate3d(10%,-14%,0) scale(1.15)}}
@keyframes liqE{0%{transform:translate3d(-4%,4%,0) scale(1.05)}50%{transform:translate3d(8%,-8%,0) scale(1.3)}100%{transform:translate3d(-4%,4%,0) scale(1.05)}}
@media (prefers-reduced-motion: reduce){.liq-blob{animation:none!important}}`;
    document.head.appendChild(s);
  }

  function hex2rgb(hex) {
    const s = String(hex).replace('#', '');
    const n = parseInt(s.length === 3 ? s.split('').map(c => c + c).join('') : s, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  const mix = (a, b, k) => a.map((v, i) => Math.round(v + (b[i] - v) * k));
  const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

  window.createLiquidLayer = function ({ container, color = '#2AB5A2', rate = 0.028, intensity = 1 }) {
    ensureStyles();
    const base = hex2rgb(color);
    const deep = mix(base, [4, 24, 27], 0.55);      // deep water
    const crest = mix(base, [228, 255, 250], 0.5);  // lit crest

    const root = document.createElement('div');
    Object.assign(root.style, {
      position: 'absolute', inset: '0', overflow: 'hidden',
      pointerEvents: 'none', opacity: '1', transition: 'opacity .6s linear',
    });

    // one cycle of the slowest blob ≈ 1/rate seconds, matching the old clock
    const cycle = Math.max(8, 1 / Math.max(rate, 0.001));
    const blobs = [
      { anim: 'liqA', dur: cycle * 1.00, w: 78, h: 62, x: 18, y: 30, col: base, a: 0.50 },
      { anim: 'liqB', dur: cycle * 1.42, w: 66, h: 74, x: 74, y: 56, col: crest, a: 0.34 },
      { anim: 'liqC', dur: cycle * 1.18, w: 90, h: 58, x: 52, y: 78, col: deep, a: 0.62 },
      { anim: 'liqD', dur: cycle * 1.66, w: 58, h: 66, x: 30, y: 74, col: crest, a: 0.26 },
      { anim: 'liqE', dur: cycle * 0.86, w: 84, h: 70, x: 68, y: 22, col: base, a: 0.40 },
    ];

    blobs.forEach((b, i) => {
      const el = document.createElement('div');
      el.className = 'liq-blob';
      Object.assign(el.style, {
        position: 'absolute', width: b.w + '%', height: b.h + '%',
        left: b.x + '%', top: b.y + '%', marginLeft: -b.w / 2 + '%', marginTop: -b.h / 2 + '%',
        // soft multi-stop falloff gives the blur look with no filter to rasterize
        background: `radial-gradient(closest-side, ${rgba(b.col, b.a * intensity)} 0%, ${rgba(b.col, b.a * intensity * 0.62)} 34%, ${rgba(b.col, b.a * intensity * 0.24)} 62%, ${rgba(b.col, 0)} 100%)`,
        animation: `${b.anim} ${b.dur.toFixed(1)}s ease-in-out ${(-b.dur * (i * 0.17)).toFixed(1)}s infinite`,
        willChange: 'transform',
      });
      root.appendChild(el);
    });

    container.appendChild(root);

    let lastAmp = -1;
    return {
      setProgress(v) {
        // scroll only fades the layer out as the stage section ends
        const p = Math.max(0, Math.min(1, v));
        const amp = 1 - Math.max(0, (p - 0.94) / 0.06);
        const q = Math.round(Math.max(0, amp) * 20) / 20;
        if (q !== lastAmp) { lastAmp = q; root.style.opacity = String(q); }
      },
      dispose() { root.remove(); },
    };
  };
})();
