/* Althea app bundle — precompiled from site-kit.jsx, tweaks-panel.jsx, site-dark.jsx, site-scrollstage.jsx, site-video-app.jsx.
   GENERATED. Edit the .jsx sources, then rebuild this file — see README-bundle.md.
   Built: 2026-09-24T20:48:20.663Z */
/* site-kit.jsx */
(function(){
// ⚠ COMPILED FILE. index.html runs app-bundle.js in production, not this source.
//   Editing here alone changes nothing on the live site — rebuild app-bundle.js
//   (see README-bundle.md). Open the page on localhost or with ?src to bypass the
//   bundle and run these sources directly.
// site-kit.jsx — the four shared pieces the home page actually uses.
// Lifted verbatim from site-sections.jsx (1,344 lines) so the page stops shipping
// — and Babel stops compiling — the ~90% of that file that never renders here.

const TweaksContext = React.createContext({
  accentColor: '#2AB5A2',
  headline: 'Track every dose.\nSee every result.',
  subline: 'The companion app for your GLP-1 medication journey.',
  appStoreUrl: '#',
  trialDays: 7
});
window.TweaksContext = TweaksContext;
const AnimContext = React.createContext({
  animChartDraw: true,
  animCountUp: true,
  animProgressRail: true,
  animHeroParallax: true
});
function RevealOnScroll({
  children,
  delay = 0,
  from = 'bottom'
}) {
  const ref = React.useRef(null);
  const [vis, setVis] = React.useState(false);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight + 40) {
      setVis(true);
      return;
    }
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setVis(true);
        obs.disconnect();
      }
    }, {
      threshold: 0.08,
      rootMargin: '0px 0px -32px 0px'
    });
    obs.observe(el);
    const t = setTimeout(() => {
      setVis(true);
      obs.disconnect();
    }, 800);
    return () => {
      obs.disconnect();
      clearTimeout(t);
    };
  }, []);
  const hidden = from === 'bottom' ? 'translateY(28px)' : from === 'left' ? 'translateX(-28px)' : 'translateX(28px)';
  return /*#__PURE__*/React.createElement("div", {
    ref: ref,
    style: {
      opacity: vis ? 1 : 0,
      transform: vis ? 'none' : hidden,
      transition: `opacity 0.7s cubic-bezier(.22,1,.36,1) ${delay}s, transform 0.7s cubic-bezier(.22,1,.36,1) ${delay}s`
    }
  }, children);
}
function useIsMobile(bp = 768) {
  const [m, setM] = React.useState(window.innerWidth < bp);
  React.useEffect(() => {
    const fn = () => setM(window.innerWidth < bp);
    window.addEventListener('resize', fn, {
      passive: true
    });
    return () => window.removeEventListener('resize', fn);
  }, [bp]);
  return m;
}

/* 192px source: the mark never renders above 34px, so the 1024px master was ~800KB
   of bytes for 34 device-independent pixels. */
function AltheaLogo({
  size = 32
}) {
  return /*#__PURE__*/React.createElement("img", {
    src: "icon-192.png",
    alt: "Althea",
    width: size,
    height: size,
    style: {
      borderRadius: Math.round(size * 0.22),
      display: 'block',
      flexShrink: 0
    }
  });
}
function AppStoreBadge({
  dark = true,
  size = 'md',
  compact = false
}) {
  const {
    appStoreUrl
  } = React.useContext(TweaksContext);
  const bg = dark ? '#000' : '#fff';
  const fg = dark ? '#fff' : '#000';
  const border = dark ? 'none' : '1.5px solid rgba(0,0,0,0.12)';
  if (compact) {
    return /*#__PURE__*/React.createElement("a", {
      href: appStoreUrl,
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 7,
        background: bg,
        color: fg,
        border,
        borderRadius: 11,
        padding: '8px 15px 8px 13px',
        textDecoration: 'none',
        flexShrink: 0
      }
    }, /*#__PURE__*/React.createElement("svg", {
      width: "15",
      height: "18",
      viewBox: "0 0 22 26",
      fill: fg
    }, /*#__PURE__*/React.createElement("path", {
      d: "M18.07 13.62c-.03-3.1 2.53-4.6 2.65-4.67-1.44-2.11-3.69-2.4-4.49-2.43-1.91-.2-3.73 1.12-4.7 1.12-.97 0-2.47-1.1-4.06-1.07-2.09.03-4.01 1.21-5.09 3.08-2.17 3.77-.56 9.36 1.56 12.42 1.03 1.5 2.27 3.18 3.89 3.12 1.56-.06 2.15-1.01 4.04-1.01 1.89 0 2.42 1.01 4.07.98 1.68-.03 2.74-1.53 3.76-3.03 1.19-1.74 1.68-3.42 1.71-3.51-.04-.02-3.28-1.26-3.34-5z"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M14.95 4.27c.86-1.04 1.44-2.48 1.28-3.92-1.24.05-2.74.82-3.63 1.86-.79.92-1.49 2.38-1.3 3.79 1.38.11 2.79-.7 3.65-1.73z"
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 14,
        fontWeight: 650,
        letterSpacing: '-0.01em'
      }
    }, "Get"));
  }
  const pad = size === 'lg' ? '12px 24px 12px 20px' : '10px 20px 10px 16px';
  const iconSz = size === 'lg' ? 26 : 22;
  const titleSz = size === 'lg' ? 19 : 17;
  return /*#__PURE__*/React.createElement("a", {
    href: appStoreUrl,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 10,
      background: bg,
      color: fg,
      border,
      borderRadius: 14,
      padding: pad,
      textDecoration: 'none',
      transition: 'transform 0.18s ease, box-shadow 0.18s ease'
    },
    onMouseEnter: e => {
      e.currentTarget.style.transform = 'scale(1.03)';
      e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.14)';
    },
    onMouseLeave: e => {
      e.currentTarget.style.transform = 'scale(1)';
      e.currentTarget.style.boxShadow = 'none';
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: iconSz,
    height: iconSz * 1.18,
    viewBox: "0 0 22 26",
    fill: fg
  }, /*#__PURE__*/React.createElement("path", {
    d: "M18.07 13.62c-.03-3.1 2.53-4.6 2.65-4.67-1.44-2.11-3.69-2.4-4.49-2.43-1.91-.2-3.73 1.12-4.7 1.12-.97 0-2.47-1.1-4.06-1.07-2.09.03-4.01 1.21-5.09 3.08-2.17 3.77-.56 9.36 1.56 12.42 1.03 1.5 2.27 3.18 3.89 3.12 1.56-.06 2.15-1.01 4.04-1.01 1.89 0 2.42 1.01 4.07.98 1.68-.03 2.74-1.53 3.76-3.03 1.19-1.74 1.68-3.42 1.71-3.51-.04-.02-3.28-1.26-3.34-5z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M14.95 4.27c.86-1.04 1.44-2.48 1.28-3.92-1.24.05-2.74.82-3.63 1.86-.79.92-1.49 2.38-1.3 3.79 1.38.11 2.79-.7 3.65-1.73z"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      lineHeight: 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      fontWeight: 400,
      opacity: 0.8
    }
  }, "Download on the"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: titleSz,
      fontWeight: 650,
      letterSpacing: '-0.01em',
      marginTop: 2
    }
  }, "App Store")));
}
Object.assign(window, {
  TweaksContext,
  AnimContext,
  RevealOnScroll,
  useIsMobile,
  AltheaLogo,
  AppStoreBadge
});
})();
/* tweaks-panel.jsx */
(function(){
// ⚠ COMPILED FILE. index.html runs app-bundle.js in production, not this source.
//   Editing here alone changes nothing on the live site — rebuild app-bundle.js
//   (see README-bundle.md). Open the page on localhost or with ?src to bypass the
//   bundle and run these sources directly.
// @ds-adherence-ignore -- omelette starter scaffold (raw elements/hex/px by design)

/* BEGIN USAGE */
// tweaks-panel.jsx
// Reusable Tweaks shell + form-control helpers.
// Exports (to window): useTweaks, TweaksPanel, TweakSection, TweakRow, TweakSlider,
//   TweakToggle, TweakRadio, TweakSelect, TweakText, TweakNumber, TweakColor, TweakButton.
//
// Owns the host protocol (listens for __activate_edit_mode / __deactivate_edit_mode,
// posts __edit_mode_available / __edit_mode_set_keys / __edit_mode_dismissed) so
// individual prototypes don't re-roll it. Ships a consistent set of controls so you
// don't hand-draw <input type="range">, segmented radios, steppers, etc.
//
// Usage (in an HTML file that loads React + Babel):
//
//   const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
//     "primaryColor": "#D97757",
//     "palette": ["#D97757", "#29261b", "#f6f4ef"],
//     "fontSize": 16,
//     "density": "regular",
//     "dark": false
//   }/*EDITMODE-END*/;
//
//   function App() {
//     const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
//     return (
//       <div style={{ fontSize: t.fontSize, color: t.primaryColor }}>
//         Hello
//         <TweaksPanel>
//           <TweakSection label="Typography" />
//           <TweakSlider label="Font size" value={t.fontSize} min={10} max={32} unit="px"
//                        onChange={(v) => setTweak('fontSize', v)} />
//           <TweakRadio  label="Density" value={t.density}
//                        options={['compact', 'regular', 'comfy']}
//                        onChange={(v) => setTweak('density', v)} />
//           <TweakSection label="Theme" />
//           <TweakColor  label="Primary" value={t.primaryColor}
//                        options={['#D97757', '#2A6FDB', '#1F8A5B', '#7A5AE0']}
//                        onChange={(v) => setTweak('primaryColor', v)} />
//           <TweakColor  label="Palette" value={t.palette}
//                        options={[['#D97757', '#29261b', '#f6f4ef'],
//                                  ['#475569', '#0f172a', '#f1f5f9']]}
//                        onChange={(v) => setTweak('palette', v)} />
//           <TweakToggle label="Dark mode" value={t.dark}
//                        onChange={(v) => setTweak('dark', v)} />
//         </TweaksPanel>
//       </div>
//     );
//   }
//
// TweakRadio is the segmented control for 2–3 short options (auto-falls-back to
// TweakSelect past ~16/~10 chars per label); reach for TweakSelect directly when
// options are many or long. For color tweaks always curate 3-4 options rather than
// a free picker; an option can also be a whole 2–5 color palette (the stored value
// is the array). The Tweak* controls are a floor, not a ceiling — build custom
// controls inside the panel if a tweak calls for UI they don't cover.
/* END USAGE */
// ─────────────────────────────────────────────────────────────────────────────

const __TWEAKS_STYLE = `
  .twk-panel{position:fixed;right:16px;bottom:16px;z-index:2147483646;width:280px;
    max-height:calc(100vh - 32px);display:flex;flex-direction:column;
    transform:scale(var(--dc-inv-zoom,1));transform-origin:bottom right;
    background:rgba(250,249,247,.78);color:#29261b;
    -webkit-backdrop-filter:blur(24px) saturate(160%);backdrop-filter:blur(24px) saturate(160%);
    border:.5px solid rgba(255,255,255,.6);border-radius:14px;
    box-shadow:0 1px 0 rgba(255,255,255,.5) inset,0 12px 40px rgba(0,0,0,.18);
    font:11.5px/1.4 ui-sans-serif,system-ui,-apple-system,sans-serif;overflow:hidden}
  .twk-hd{display:flex;align-items:center;justify-content:space-between;
    padding:10px 8px 10px 14px;cursor:move;user-select:none}
  .twk-hd b{font-size:12px;font-weight:600;letter-spacing:.01em}
  .twk-x{appearance:none;border:0;background:transparent;color:rgba(41,38,27,.55);
    width:22px;height:22px;border-radius:6px;cursor:default;font-size:13px;line-height:1}
  .twk-x:hover{background:rgba(0,0,0,.06);color:#29261b}
  .twk-body{padding:2px 14px 14px;display:flex;flex-direction:column;gap:10px;
    overflow-y:auto;overflow-x:hidden;min-height:0;
    scrollbar-width:thin;scrollbar-color:rgba(0,0,0,.15) transparent}
  .twk-body::-webkit-scrollbar{width:8px}
  .twk-body::-webkit-scrollbar-track{background:transparent;margin:2px}
  .twk-body::-webkit-scrollbar-thumb{background:rgba(0,0,0,.15);border-radius:4px;
    border:2px solid transparent;background-clip:content-box}
  .twk-body::-webkit-scrollbar-thumb:hover{background:rgba(0,0,0,.25);
    border:2px solid transparent;background-clip:content-box}
  .twk-row{display:flex;flex-direction:column;gap:5px}
  .twk-row-h{flex-direction:row;align-items:center;justify-content:space-between;gap:10px}
  .twk-lbl{display:flex;justify-content:space-between;align-items:baseline;
    color:rgba(41,38,27,.72)}
  .twk-lbl>span:first-child{font-weight:500}
  .twk-val{color:rgba(41,38,27,.5);font-variant-numeric:tabular-nums}

  .twk-sect{font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;
    color:rgba(41,38,27,.45);padding:10px 0 0}
  .twk-sect:first-child{padding-top:0}

  .twk-field{appearance:none;box-sizing:border-box;width:100%;min-width:0;height:26px;padding:0 8px;
    border:.5px solid rgba(0,0,0,.1);border-radius:7px;
    background:rgba(255,255,255,.6);color:inherit;font:inherit;outline:none}
  .twk-field:focus{border-color:rgba(0,0,0,.25);background:rgba(255,255,255,.85)}
  select.twk-field{padding-right:22px;
    background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'><path fill='rgba(0,0,0,.5)' d='M0 0h10L5 6z'/></svg>");
    background-repeat:no-repeat;background-position:right 8px center}

  .twk-slider{appearance:none;-webkit-appearance:none;width:100%;height:4px;margin:6px 0;
    border-radius:999px;background:rgba(0,0,0,.12);outline:none}
  .twk-slider::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;
    width:14px;height:14px;border-radius:50%;background:#fff;
    border:.5px solid rgba(0,0,0,.12);box-shadow:0 1px 3px rgba(0,0,0,.2);cursor:default}
  .twk-slider::-moz-range-thumb{width:14px;height:14px;border-radius:50%;
    background:#fff;border:.5px solid rgba(0,0,0,.12);box-shadow:0 1px 3px rgba(0,0,0,.2);cursor:default}

  .twk-seg{position:relative;display:flex;padding:2px;border-radius:8px;
    background:rgba(0,0,0,.06);user-select:none}
  .twk-seg-thumb{position:absolute;top:2px;bottom:2px;border-radius:6px;
    background:rgba(255,255,255,.9);box-shadow:0 1px 2px rgba(0,0,0,.12);
    transition:left .15s cubic-bezier(.3,.7,.4,1),width .15s}
  .twk-seg.dragging .twk-seg-thumb{transition:none}
  .twk-seg button{appearance:none;position:relative;z-index:1;flex:1;border:0;
    background:transparent;color:inherit;font:inherit;font-weight:500;min-height:22px;
    border-radius:6px;cursor:default;padding:4px 6px;line-height:1.2;
    overflow-wrap:anywhere}

  .twk-toggle{position:relative;width:32px;height:18px;border:0;border-radius:999px;
    background:rgba(0,0,0,.15);transition:background .15s;cursor:default;padding:0}
  .twk-toggle[data-on="1"]{background:#34c759}
  .twk-toggle i{position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:50%;
    background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.25);transition:transform .15s}
  .twk-toggle[data-on="1"] i{transform:translateX(14px)}

  .twk-num{display:flex;align-items:center;box-sizing:border-box;min-width:0;height:26px;padding:0 0 0 8px;
    border:.5px solid rgba(0,0,0,.1);border-radius:7px;background:rgba(255,255,255,.6)}
  .twk-num-lbl{font-weight:500;color:rgba(41,38,27,.6);cursor:ew-resize;
    user-select:none;padding-right:8px}
  .twk-num input{flex:1;min-width:0;height:100%;border:0;background:transparent;
    font:inherit;font-variant-numeric:tabular-nums;text-align:right;padding:0 8px 0 0;
    outline:none;color:inherit;-moz-appearance:textfield}
  .twk-num input::-webkit-inner-spin-button,.twk-num input::-webkit-outer-spin-button{
    -webkit-appearance:none;margin:0}
  .twk-num-unit{padding-right:8px;color:rgba(41,38,27,.45)}

  .twk-btn{appearance:none;height:26px;padding:0 12px;border:0;border-radius:7px;
    background:rgba(0,0,0,.78);color:#fff;font:inherit;font-weight:500;cursor:default}
  .twk-btn:hover{background:rgba(0,0,0,.88)}
  .twk-btn.secondary{background:rgba(0,0,0,.06);color:inherit}
  .twk-btn.secondary:hover{background:rgba(0,0,0,.1)}

  .twk-swatch{appearance:none;-webkit-appearance:none;width:56px;height:22px;
    border:.5px solid rgba(0,0,0,.1);border-radius:6px;padding:0;cursor:default;
    background:transparent;flex-shrink:0}
  .twk-swatch::-webkit-color-swatch-wrapper{padding:0}
  .twk-swatch::-webkit-color-swatch{border:0;border-radius:5.5px}
  .twk-swatch::-moz-color-swatch{border:0;border-radius:5.5px}

  .twk-chips{display:flex;gap:6px}
  .twk-chip{position:relative;appearance:none;flex:1;min-width:0;height:46px;
    padding:0;border:0;border-radius:6px;overflow:hidden;cursor:default;
    box-shadow:0 0 0 .5px rgba(0,0,0,.12),0 1px 2px rgba(0,0,0,.06);
    transition:transform .12s cubic-bezier(.3,.7,.4,1),box-shadow .12s}
  .twk-chip:hover{transform:translateY(-1px);
    box-shadow:0 0 0 .5px rgba(0,0,0,.18),0 4px 10px rgba(0,0,0,.12)}
  .twk-chip[data-on="1"]{box-shadow:0 0 0 1.5px rgba(0,0,0,.85),
    0 2px 6px rgba(0,0,0,.15)}
  .twk-chip>span{position:absolute;top:0;bottom:0;right:0;width:34%;
    display:flex;flex-direction:column;box-shadow:-1px 0 0 rgba(0,0,0,.1)}
  .twk-chip>span>i{flex:1;box-shadow:0 -1px 0 rgba(0,0,0,.1)}
  .twk-chip>span>i:first-child{box-shadow:none}
  .twk-chip svg{position:absolute;top:6px;left:6px;width:13px;height:13px;
    filter:drop-shadow(0 1px 1px rgba(0,0,0,.3))}
`;

// ── useTweaks ───────────────────────────────────────────────────────────────
// Single source of truth for tweak values. setTweak persists via the host
// (__edit_mode_set_keys → host rewrites the EDITMODE block on disk).
function useTweaks(defaults) {
  const [values, setValues] = React.useState(defaults);
  // Accepts either setTweak('key', value) or setTweak({ key: value, ... }) so a
  // useState-style call doesn't write a "[object Object]" key into the persisted
  // JSON block.
  const setTweak = React.useCallback((keyOrEdits, val) => {
    const edits = typeof keyOrEdits === 'object' && keyOrEdits !== null ? keyOrEdits : {
      [keyOrEdits]: val
    };
    setValues(prev => ({
      ...prev,
      ...edits
    }));
    window.parent.postMessage({
      type: '__edit_mode_set_keys',
      edits
    }, '*');
    // Same-window signal so in-page listeners (deck-stage rail thumbnails)
    // can react — the parent message only reaches the host, not peers.
    window.dispatchEvent(new CustomEvent('tweakchange', {
      detail: edits
    }));
  }, []);
  return [values, setTweak];
}

// ── TweaksPanel ─────────────────────────────────────────────────────────────
// Floating shell. Registers the protocol listener BEFORE announcing
// availability — if the announce ran first, the host's activate could land
// before our handler exists and the toolbar toggle would silently no-op.
// The close button posts __edit_mode_dismissed so the host's toolbar toggle
// flips off in lockstep; the host echoes __deactivate_edit_mode back which
// is what actually hides the panel.
function TweaksPanel({
  title = 'Tweaks',
  children
}) {
  const [open, setOpen] = React.useState(false);
  const dragRef = React.useRef(null);
  const offsetRef = React.useRef({
    x: 16,
    y: 16
  });
  const PAD = 16;
  const clampToViewport = React.useCallback(() => {
    const panel = dragRef.current;
    if (!panel) return;
    const w = panel.offsetWidth,
      h = panel.offsetHeight;
    const maxRight = Math.max(PAD, window.innerWidth - w - PAD);
    const maxBottom = Math.max(PAD, window.innerHeight - h - PAD);
    offsetRef.current = {
      x: Math.min(maxRight, Math.max(PAD, offsetRef.current.x)),
      y: Math.min(maxBottom, Math.max(PAD, offsetRef.current.y))
    };
    panel.style.right = offsetRef.current.x + 'px';
    panel.style.bottom = offsetRef.current.y + 'px';
  }, []);
  React.useEffect(() => {
    if (!open) return;
    clampToViewport();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', clampToViewport);
      return () => window.removeEventListener('resize', clampToViewport);
    }
    const ro = new ResizeObserver(clampToViewport);
    ro.observe(document.documentElement);
    return () => ro.disconnect();
  }, [open, clampToViewport]);
  React.useEffect(() => {
    const onMsg = e => {
      const t = e?.data?.type;
      if (t === '__activate_edit_mode') setOpen(true);else if (t === '__deactivate_edit_mode') setOpen(false);
    };
    window.addEventListener('message', onMsg);
    window.parent.postMessage({
      type: '__edit_mode_available'
    }, '*');
    return () => window.removeEventListener('message', onMsg);
  }, []);
  const dismiss = () => {
    setOpen(false);
    window.parent.postMessage({
      type: '__edit_mode_dismissed'
    }, '*');
  };
  const onDragStart = e => {
    const panel = dragRef.current;
    if (!panel) return;
    const r = panel.getBoundingClientRect();
    const sx = e.clientX,
      sy = e.clientY;
    const startRight = window.innerWidth - r.right;
    const startBottom = window.innerHeight - r.bottom;
    const move = ev => {
      offsetRef.current = {
        x: startRight - (ev.clientX - sx),
        y: startBottom - (ev.clientY - sy)
      };
      clampToViewport();
    };
    const up = () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  };
  if (!open) return null;
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("style", null, __TWEAKS_STYLE), /*#__PURE__*/React.createElement("div", {
    ref: dragRef,
    className: "twk-panel",
    "data-omelette-chrome": "",
    style: {
      right: offsetRef.current.x,
      bottom: offsetRef.current.y
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-hd",
    onMouseDown: onDragStart
  }, /*#__PURE__*/React.createElement("b", null, title), /*#__PURE__*/React.createElement("button", {
    className: "twk-x",
    "aria-label": "Close tweaks",
    onMouseDown: e => e.stopPropagation(),
    onClick: dismiss
  }, "\u2715")), /*#__PURE__*/React.createElement("div", {
    className: "twk-body"
  }, children)));
}

// ── Layout helpers ──────────────────────────────────────────────────────────

function TweakSection({
  label,
  children
}) {
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "twk-sect"
  }, label), children);
}
function TweakRow({
  label,
  value,
  children,
  inline = false
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: inline ? 'twk-row twk-row-h' : 'twk-row'
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-lbl"
  }, /*#__PURE__*/React.createElement("span", null, label), value != null && /*#__PURE__*/React.createElement("span", {
    className: "twk-val"
  }, value)), children);
}

// ── Controls ────────────────────────────────────────────────────────────────

function TweakSlider({
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  unit = '',
  onChange
}) {
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label,
    value: `${value}${unit}`
  }, /*#__PURE__*/React.createElement("input", {
    type: "range",
    className: "twk-slider",
    min: min,
    max: max,
    step: step,
    value: value,
    onChange: e => onChange(Number(e.target.value))
  }));
}
function TweakToggle({
  label,
  value,
  onChange
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "twk-row twk-row-h"
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-lbl"
  }, /*#__PURE__*/React.createElement("span", null, label)), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "twk-toggle",
    "data-on": value ? '1' : '0',
    role: "switch",
    "aria-checked": !!value,
    onClick: () => onChange(!value)
  }, /*#__PURE__*/React.createElement("i", null)));
}
function TweakRadio({
  label,
  value,
  options,
  onChange
}) {
  const trackRef = React.useRef(null);
  const [dragging, setDragging] = React.useState(false);
  // The active value is read by pointer-move handlers attached for the lifetime
  // of a drag — ref it so a stale closure doesn't fire onChange for every move.
  const valueRef = React.useRef(value);
  valueRef.current = value;

  // Segments wrap mid-word once per-segment width runs out. The track is
  // ~248px (280 panel − 28 body pad − 4 seg pad), each button loses 12px
  // to its own padding, and 11.5px system-ui averages ~6.3px/char — so 2
  // options fit ~16 chars each, 3 fit ~10. Past that (or >3 options), fall
  // back to a dropdown rather than wrap.
  const labelLen = o => String(typeof o === 'object' ? o.label : o).length;
  const maxLen = options.reduce((m, o) => Math.max(m, labelLen(o)), 0);
  const fitsAsSegments = maxLen <= ({
    2: 16,
    3: 10
  }[options.length] ?? 0);
  if (!fitsAsSegments) {
    // <select> emits strings — map back to the original option value so the
    // fallback stays type-preserving (numbers, booleans) like the segment path.
    const resolve = s => {
      const m = options.find(o => String(typeof o === 'object' ? o.value : o) === s);
      return m === undefined ? s : typeof m === 'object' ? m.value : m;
    };
    return /*#__PURE__*/React.createElement(TweakSelect, {
      label: label,
      value: value,
      options: options,
      onChange: s => onChange(resolve(s))
    });
  }
  const opts = options.map(o => typeof o === 'object' ? o : {
    value: o,
    label: o
  });
  const idx = Math.max(0, opts.findIndex(o => o.value === value));
  const n = opts.length;
  const segAt = clientX => {
    const r = trackRef.current.getBoundingClientRect();
    const inner = r.width - 4;
    const i = Math.floor((clientX - r.left - 2) / inner * n);
    return opts[Math.max(0, Math.min(n - 1, i))].value;
  };
  const onPointerDown = e => {
    setDragging(true);
    const v0 = segAt(e.clientX);
    if (v0 !== valueRef.current) onChange(v0);
    const move = ev => {
      if (!trackRef.current) return;
      const v = segAt(ev.clientX);
      if (v !== valueRef.current) onChange(v);
    };
    const up = () => {
      setDragging(false);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label
  }, /*#__PURE__*/React.createElement("div", {
    ref: trackRef,
    role: "radiogroup",
    onPointerDown: onPointerDown,
    className: dragging ? 'twk-seg dragging' : 'twk-seg'
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-seg-thumb",
    style: {
      left: `calc(2px + ${idx} * (100% - 4px) / ${n})`,
      width: `calc((100% - 4px) / ${n})`
    }
  }), opts.map(o => /*#__PURE__*/React.createElement("button", {
    key: o.value,
    type: "button",
    role: "radio",
    "aria-checked": o.value === value
  }, o.label))));
}
function TweakSelect({
  label,
  value,
  options,
  onChange
}) {
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label
  }, /*#__PURE__*/React.createElement("select", {
    className: "twk-field",
    value: value,
    onChange: e => onChange(e.target.value)
  }, options.map(o => {
    const v = typeof o === 'object' ? o.value : o;
    const l = typeof o === 'object' ? o.label : o;
    return /*#__PURE__*/React.createElement("option", {
      key: v,
      value: v
    }, l);
  })));
}
function TweakText({
  label,
  value,
  placeholder,
  onChange
}) {
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label
  }, /*#__PURE__*/React.createElement("input", {
    className: "twk-field",
    type: "text",
    value: value,
    placeholder: placeholder,
    onChange: e => onChange(e.target.value)
  }));
}
function TweakNumber({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange
}) {
  const clamp = n => {
    if (min != null && n < min) return min;
    if (max != null && n > max) return max;
    return n;
  };
  const startRef = React.useRef({
    x: 0,
    val: 0
  });
  const onScrubStart = e => {
    e.preventDefault();
    startRef.current = {
      x: e.clientX,
      val: value
    };
    const decimals = (String(step).split('.')[1] || '').length;
    const move = ev => {
      const dx = ev.clientX - startRef.current.x;
      const raw = startRef.current.val + dx * step;
      const snapped = Math.round(raw / step) * step;
      onChange(clamp(Number(snapped.toFixed(decimals))));
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "twk-num"
  }, /*#__PURE__*/React.createElement("span", {
    className: "twk-num-lbl",
    onPointerDown: onScrubStart
  }, label), /*#__PURE__*/React.createElement("input", {
    type: "number",
    value: value,
    min: min,
    max: max,
    step: step,
    onChange: e => onChange(clamp(Number(e.target.value)))
  }), unit && /*#__PURE__*/React.createElement("span", {
    className: "twk-num-unit"
  }, unit));
}

// Relative-luminance contrast pick — checkmarks drawn over a swatch need to
// read on both #111 and #fafafa without per-option configuration. Hex input
// only (#rgb / #rrggbb); named or rgb()/hsl() colors fall through to "light".
function __twkIsLight(hex) {
  const h = String(hex).replace('#', '');
  const x = h.length === 3 ? h.replace(/./g, c => c + c) : h.padEnd(6, '0');
  const n = parseInt(x.slice(0, 6), 16);
  if (Number.isNaN(n)) return true;
  const r = n >> 16 & 255,
    g = n >> 8 & 255,
    b = n & 255;
  return r * 299 + g * 587 + b * 114 > 148000;
}
const __TwkCheck = ({
  light
}) => /*#__PURE__*/React.createElement("svg", {
  viewBox: "0 0 14 14",
  "aria-hidden": "true"
}, /*#__PURE__*/React.createElement("path", {
  d: "M3 7.2 5.8 10 11 4.2",
  fill: "none",
  strokeWidth: "2.2",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  stroke: light ? 'rgba(0,0,0,.78)' : '#fff'
}));

// TweakColor — curated color/palette picker. Each option is either a single
// hex string or an array of 1-5 hex strings; the card adapts — a lone color
// renders solid, a palette renders colors[0] as the hero (left ~2/3) with the
// rest stacked in a sharp column on the right. onChange emits the
// option in the shape it was passed (string stays string, array stays array).
// Without options it falls back to the native color input for back-compat.
function TweakColor({
  label,
  value,
  options,
  onChange
}) {
  if (!options || !options.length) {
    return /*#__PURE__*/React.createElement("div", {
      className: "twk-row twk-row-h"
    }, /*#__PURE__*/React.createElement("div", {
      className: "twk-lbl"
    }, /*#__PURE__*/React.createElement("span", null, label)), /*#__PURE__*/React.createElement("input", {
      type: "color",
      className: "twk-swatch",
      value: value,
      onChange: e => onChange(e.target.value)
    }));
  }
  // Native <input type=color> emits lowercase hex per the HTML spec, so
  // compare case-insensitively. String() guards JSON.stringify(undefined),
  // which returns the primitive undefined (no .toLowerCase).
  const key = o => String(JSON.stringify(o)).toLowerCase();
  const cur = key(value);
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-chips",
    role: "radiogroup"
  }, options.map((o, i) => {
    const colors = Array.isArray(o) ? o : [o];
    const [hero, ...rest] = colors;
    const sup = rest.slice(0, 4);
    const on = key(o) === cur;
    return /*#__PURE__*/React.createElement("button", {
      key: i,
      type: "button",
      className: "twk-chip",
      role: "radio",
      "aria-checked": on,
      "data-on": on ? '1' : '0',
      "aria-label": colors.join(', '),
      title: colors.join(' · '),
      style: {
        background: hero
      },
      onClick: () => onChange(o)
    }, sup.length > 0 && /*#__PURE__*/React.createElement("span", null, sup.map((c, j) => /*#__PURE__*/React.createElement("i", {
      key: j,
      style: {
        background: c
      }
    }))), on && /*#__PURE__*/React.createElement(__TwkCheck, {
      light: __twkIsLight(hero)
    }));
  })));
}
function TweakButton({
  label,
  onClick,
  secondary = false
}) {
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: secondary ? 'twk-btn secondary' : 'twk-btn',
    onClick: onClick
  }, label);
}
Object.assign(window, {
  useTweaks,
  TweaksPanel,
  TweakSection,
  TweakRow,
  TweakSlider,
  TweakToggle,
  TweakRadio,
  TweakSelect,
  TweakText,
  TweakNumber,
  TweakColor,
  TweakButton
});
})();
/* site-dark.jsx */
(function(){
// ⚠ COMPILED FILE. index.html runs app-bundle.js in production, not this source.
//   Editing here alone changes nothing on the live site — rebuild app-bundle.js
//   (see README-bundle.md). Open the page on localhost or with ?src to bypass the
//   bundle and run these sources directly.
// site-dark.jsx — dark-theme chrome for the video/tour landing page.
// Only this page uses these; index.html keeps its light components untouched.

const D = {
  ink: '#EFF4F3',
  mid: 'rgba(239,244,243,0.66)',
  faint: 'rgba(239,244,243,0.42)',
  rule: 'rgba(239,244,243,0.10)',
  glass: 'rgba(255,255,255,0.055)',
  glassLine: 'rgba(255,255,255,0.13)'
};
const darkGlass = {
  background: D.glass,
  backdropFilter: 'blur(24px) saturate(150%)',
  WebkitBackdropFilter: 'blur(24px) saturate(150%)',
  border: `1px solid ${D.glassLine}`,
  boxShadow: '0 28px 70px -26px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.14)',
  borderRadius: 20
};
function DarkNavBar() {
  const [scrolled, setScrolled] = React.useState(false);
  const mobile = useIsMobile(640);
  React.useEffect(() => {
    // Stays hidden across the paper hero — the dark bar only belongs over the dark tour.
    const fn = () => {
      const hero = document.getElementById('hero');
      setScrolled(window.scrollY > (hero ? hero.offsetHeight * 0.72 : 32));
    };
    window.addEventListener('scroll', fn, {
      passive: true
    });
    fn();
    return () => window.removeEventListener('scroll', fn);
  }, []);
  const link = {
    fontSize: 14,
    fontWeight: 500,
    color: D.mid,
    textDecoration: 'none'
  };
  return /*#__PURE__*/React.createElement("nav", {
    style: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      opacity: scrolled ? 1 : 0,
      pointerEvents: scrolled ? 'auto' : 'none',
      background: scrolled ? 'rgba(0,1,2,0.32)' : 'transparent',
      backdropFilter: scrolled ? 'saturate(160%) blur(18px)' : 'none',
      WebkitBackdropFilter: scrolled ? 'saturate(160%) blur(18px)' : 'none',
      borderBottom: `1px solid ${scrolled ? D.rule : 'transparent'}`,
      transition: 'opacity 0.3s ease, background 0.3s ease, border-color 0.3s ease, backdrop-filter 0.3s ease'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1160,
      margin: '0 auto',
      padding: '0 24px',
      height: 64,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "index.html",
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      textDecoration: 'none'
    }
  }, /*#__PURE__*/React.createElement(AltheaLogo, {
    size: 34
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif",
      fontSize: 22,
      fontWeight: 600,
      letterSpacing: '-0.03em',
      color: D.ink
    }
  }, "Althea")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: mobile ? 12 : 32
    }
  }, !mobile && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("a", {
    href: "#tour",
    style: link
  }, "Tour"), /*#__PURE__*/React.createElement("a", {
    href: "#faq",
    style: link
  }, "FAQ")), /*#__PURE__*/React.createElement(AppStoreBadge, {
    dark: false,
    size: "sm",
    compact: mobile
  }))));
}
function DarkFAQItem({
  q,
  a,
  open,
  onToggle
}) {
  const {
    accentColor
  } = React.useContext(TweaksContext);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      borderBottom: `1px solid ${D.rule}`
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onToggle,
    style: {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 16,
      padding: '20px 4px',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      textAlign: 'left',
      color: 'inherit'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 16.5,
      fontWeight: 600,
      color: D.ink,
      letterSpacing: '-0.015em'
    }
  }, q), /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "18",
    viewBox: "0 0 20 20",
    fill: "none",
    style: {
      flexShrink: 0,
      transform: open ? 'rotate(45deg)' : 'none',
      transition: 'transform 0.25s ease'
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M10 3v14M3 10h14",
    stroke: accentColor,
    strokeWidth: "2",
    strokeLinecap: "round"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      maxHeight: open ? 320 : 0,
      overflow: 'hidden',
      transition: 'max-height 0.35s cubic-bezier(.4,0,.2,1)'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 15,
      lineHeight: 1.68,
      color: D.mid,
      margin: 0,
      padding: '0 4px 22px',
      textWrap: 'pretty'
    }
  }, a)));
}
function DarkFAQSection() {
  const [open, setOpen] = React.useState(0);
  const faqs = [{
    q: 'Is my health data private?',
    a: 'Your health data — weight, doses, side effects — stays on your device and in your own private iCloud. We never see it, and it is never sold or shared. The one exception: when you first set up the app we record which setup screens you saw, so we can fix the confusing ones. That record holds no health data and no name or email, just a random code. No third-party trackers, no ads. Read our Privacy Policy for the full details.'
  }, {
    q: 'Which medications does Althea support?',
    a: 'All the major GLP-1 medications — Ozempic®, Wegovy®, Mounjaro®, Zepbound®, Rybelsus®, Saxenda®, Trulicity®, Victoza®, Retatrutide and more. 16+ drugs with dosing schedules, titration steps, and pharmacokinetic curves, in injectable and oral forms.'
  }, {
    q: 'Does Althea support compounded GLP-1s?',
    a: 'Yes. Alongside brand-name drugs, Althea supports compounded semaglutide and tirzepatide with custom strengths and schedules — you set the dose, Althea handles the rest.'
  }, {
    q: 'What makes Althea different from other GLP-1 trackers?',
    a: 'Three things: your data never leaves your device, it models the actual drug level in your body between doses, and its reports are designed with clinicians for real appointments.'
  }, {
    q: 'Does Althea replace my doctor?',
    a: 'No. Althea is a tracking companion, not a medical device. It helps you arrive at appointments with clear data, but every medication decision belongs with your prescribing healthcare provider.'
  }, {
    q: 'How does the free trial work?',
    a: 'The annual plan starts with 7 days completely free — no charge until the trial ends, and you can cancel any time before it does. Billing is handled securely by Apple.'
  }, {
    q: 'How do I cancel my subscription?',
    a: 'Any time via Settings › your Apple ID › Subscriptions on your iPhone. You keep full access until the end of the current billing period.'
  }, {
    q: 'Does it work with Apple Health?',
    a: 'Yes — optionally. Althea can sync your weight with Apple Health and read metrics like steps, sleep, and heart rate to show alongside your journey. You choose exactly what to share.'
  }];
  return /*#__PURE__*/React.createElement("section", {
    id: "faq",
    style: {
      padding: '92px 0',
      background: 'transparent',
      position: 'relative',
      zIndex: 2
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 720,
      margin: '0 auto',
      padding: '0 24px'
    }
  }, /*#__PURE__*/React.createElement(RevealOnScroll, null, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      marginBottom: 38
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: 'clamp(24px, 3.1vw, 36px)',
      color: D.ink,
      marginBottom: 12,
      lineHeight: 1.14
    }
  }, "Your questions, answered"))), /*#__PURE__*/React.createElement(RevealOnScroll, {
    delay: 0.08
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...darkGlass,
      borderRadius: 22,
      padding: '6px 22px'
    }
  }, faqs.map((f, i) => /*#__PURE__*/React.createElement(DarkFAQItem, {
    key: i,
    q: f.q,
    a: f.a,
    open: open === i,
    onToggle: () => setOpen(open === i ? -1 : i)
  }))))));
}
function DarkFooter() {
  const mobile = useIsMobile(640);
  const link = {
    fontSize: 14,
    color: D.mid,
    textDecoration: 'none'
  };
  return /*#__PURE__*/React.createElement("footer", {
    style: {
      background: 'transparent',
      borderTop: `1px solid ${D.rule}`,
      position: 'relative',
      zIndex: 2,
      padding: mobile ? '34px 24px 40px' : '40px 24px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1160,
      margin: '0 auto',
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(AltheaLogo, {
    size: 28
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif",
      fontSize: 20,
      fontWeight: 600,
      letterSpacing: '-0.03em',
      color: D.ink
    }
  }, "Althea")), /*#__PURE__*/React.createElement("nav", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 24
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "privacy-policy/index.html",
    style: link
  }, "Privacy Policy"), /*#__PURE__*/React.createElement("a", {
    href: "terms-of-use/index.html",
    style: link
  }, "Terms of Use"), /*#__PURE__*/React.createElement("a", {
    href: "mailto:support@althea.team",
    style: link
  }, "Support")), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12.5,
      color: D.faint
    }
  }, "\xA9 2026 Althea. All rights reserved.")));
}
Object.assign(window, {
  D,
  darkGlass,
  DarkNavBar,
  DarkFAQSection,
  DarkFAQItem,
  DarkFooter
});
})();
/* site-scrollstage.jsx */
(function(){
// ⚠ COMPILED FILE. index.html runs app-bundle.js in production, not this source.
//   Editing here alone changes nothing on the live site — rebuild app-bundle.js
//   (see README-bundle.md). Open the page on localhost or with ?src to bypass the
//   bundle and run these sources directly.
// site-scrollstage.jsx — scroll-driven rotating iPhone (real 3D, from althea-phone-3d)
// Requires vendor/phone3d.bundle.js (global Phone3D) loaded before this file.

/* Screenshot textures, pre-downscaled to roughly the size the phone screen actually
   occupies on each device class (desktop ~1914px tall, mobile ~1442px). The masters
   are 2622px, which was WORSE, not better: at that size the GPU blends in its own
   half-resolution mip level, built with a non-gamma-correct box filter. Sizing the
   texture just above its display size means mip 0 is the level in use — sharper AND
   about 40% fewer bytes than the masters. Originals kept in screens/ as the source. */
/* The 3D bundle (534KB) and the liquid layer are the heaviest assets on the page
   and both live below the fold, so the document no longer references them: this
   injects them when the tour comes within a viewport, leaving the first screen's
   bandwidth to the hero. */
const STAGE_DEPS = ['vendor/phone3d.bundle.js', 'liquid-bg.js'];
let stageDepsPromise = null;
/* index.html starts these in parallel with React and parks the promise on the
   window, so the usual path finds them already in flight and this never issues a
   second request. The local path stays for a direct .jsx load. */
function loadStageDeps() {
  if (window.__altheaStageDeps) return window.__altheaStageDeps;
  if (stageDepsPromise) return stageDepsPromise;
  window.dispatchEvent(new Event('althea:stage-loading'));
  stageDepsPromise = Promise.all(STAGE_DEPS.map(src => new Promise((res, rej) => {
    const el = document.createElement('script');
    el.src = src;
    el.async = false;
    el.onload = res;
    el.onerror = () => rej(new Error('failed: ' + src));
    document.head.appendChild(el);
  })));
  window.__altheaStageDeps = stageDepsPromise;
  return stageDepsPromise;
}
const PHONE_SCREEN_SETS = {
  // 880×1914 — desktop, where the phone renders largest
  d: [1, 2, 3, 4, 5, 6].map(n => `screens/d/screen-${n}.jpg`),
  // 663×1442 — mobile; two-step downscale so the 1px UI rules survive
  m: [1, 2, 3, 4, 5, 6].map(n => `screens/m/screen-${n}.jpg`)
};

/* Which set to use. Texture weight IS the tour's payload — six desktop shots are
   ~1.5 MB and the phone module waits on all of them — so a metered or slow link
   gets the mobile set (~126 KB each) even on a wide screen. index.html picks the
   same key before first paint for its static poster, so the poster and the phone's
   first texture are one file and only one of them is ever fetched. */
function stageScreenKey(mobile) {
  if (mobile) return 'm';
  if (window.__altheaScreenKey) return window.__altheaScreenKey;
  const c = navigator.connection || {};
  const thin = c.saveData === true || /(^(slow-)?2g$)|(^3g$)/.test(c.effectiveType || '');
  return thin ? 'm' : 'd';
}

// Must match the phone module's motion so panels land with the front of the phone.
const DWELL = 0.72; // share of each revolution facing the viewer
const FRONT_SWING = 42; // degrees of drift while facing you
const VH_PER_SCREEN = 115; // scroll distance per revolution
const INTRO_FADE = 0.032;
const STAGE_SCENES = [{
  n: '01',
  kicker: 'Today',
  title: 'Everything, in one place',
  body: 'Weight, doses, and progress \u2014 all in a single screen you can check in seconds.',
  chip: 'Under 60s to log a day',
  side: 'right',
  y: 21
}, {
  n: '02',
  kicker: 'Progress',
  title: 'Progress you can feel',
  body: 'Smoothed trends cut through the daily noise, so one heavy Tuesday never reads as failure.',
  chip: 'Weekly \u00b7 90-day \u00b7 all-time',
  side: 'left',
  y: 28
}, {
  n: '03',
  kicker: 'Nutrition',
  title: 'Calorie Tracking, without the friction',
  body: 'Scan a barcode, log the meal, and watch protein and hydration keep pace with the loss.',
  chip: 'Barcode scanning built in',
  side: 'right',
  y: 24
}, {
  n: '04',
  kicker: 'Side effects',
  title: 'Side effects, in context',
  body: 'Althea charts it against your dose curve, so patterns surface early.',
  chip: 'Plotted against dose day',
  side: 'left',
  y: 22
}, {
  n: '05',
  kicker: 'Measurements',
  title: 'More than the scale',
  body: 'Chest, waist, hips, arms \u2014 the inches that keep moving on the weeks the scale sits still.',
  chip: 'Guided, five sites a session',
  side: 'right',
  y: 28
}, {
  n: '06',
  kicker: 'Reports',
  title: 'Ready for the appointment',
  body: 'Export your data as one clean PDF, ready for your provider.',
  chip: 'One-tap PDF export',
  side: 'left',
  y: 24
}];

/* Desktop-only bridge panels, one per rotation gap. Each fills the stretch where the
   phone is spinning between two screens and no scene panel is up, so something is
   always readable on the way down. Each takes the side OPPOSITE the panel it follows
   and sits in the lower band (scene panels all live high, y 21-28%), so it never
   shares a position with the panel before or after it. Copy bridges the two screens
   it sits between. */
const STAGE_INTERLUDES = [{
  n: 'i1',
  title: '2 in 5 American adults live with obesity',
  body: 'A little over 40% \u2014 a chronic condition with genetic and hormonal drivers, not a matter of discipline.',
  side: 'left',
  y: 62
}, {
  n: 'i2',
  title: 'Daily weighers lose about twice as much',
  body: 'Stepping on the scale most days is one of the strongest predictors of weight lost \u2014 and kept off.',
  side: 'right',
  y: 64
}, {
  n: 'i3',
  title: 'Five percent already counts',
  body: 'A 5\u201310% loss measurably improves blood pressure, blood sugar, and cholesterol \u2014 long before you reach a goal weight.',
  side: 'left',
  y: 61
}, {
  n: 'i4',
  title: 'Protein protects what you keep',
  body: 'Losing weight costs muscle too. Enough protein and a little resistance work keeps more of it on you.',
  side: 'right',
  y: 65
}, {
  n: 'i5',
  title: 'Waist tells you what the scale won\u2019t',
  body: 'Visceral fat drives the health risk, and it starts moving before body weight does.',
  side: 'left',
  y: 63
}];
const N_SCENES = STAGE_SCENES.length;
// Stop the phone the moment the last panel has fully faded — no return to screen 01.
const P_END = (N_SCENES - 1 + DWELL) / N_SCENES;
const stageSmooth = (a, b, x) => {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a || 1)));
  return t * t * (3 - 2 * t);
};

/* Panel visibility from scroll progress — mirrors the phone's dwell window. */
function panelStateFor(p) {
  const cyc = Math.min(p, 0.999999) * N_SCENES;
  const i = Math.floor(cyc),
    u = cyc - i;
  if (u >= DWELL) return {
    i,
    vis: 0
  };
  const f = u / DWELL;
  return {
    i,
    vis: stageSmooth(0, 0.16, f) * (1 - stageSmooth(0.84, 1, f))
  };
}

/* Bridge visibility: the gap window is the tail of each revolution (u >= DWELL),
   shorter than the dwell, so it fades on a snappier curve. */
function interludeStateFor(p) {
  const cyc = Math.min(p, 0.999999) * N_SCENES;
  const i = Math.floor(cyc),
    u = cyc - i;
  if (u < DWELL) return {
    i,
    vis: 0
  };
  const f = (u - DWELL) / (1 - DWELL);
  return {
    i,
    vis: stageSmooth(0, 0.15, f) * (1 - stageSmooth(0.86, 1, f))
  };
}
const stageTitleCss = {
  fontFamily: 'var(--display)',
  fontWeight: 'var(--display-w)',
  fontSize: 25,
  letterSpacing: 'var(--display-ls)',
  lineHeight: 1.18,
  color: '#EFF4F3',
  textWrap: 'balance'
};
const stageBodyCss = {
  fontSize: 15,
  lineHeight: 1.6,
  color: 'rgba(239,244,243,0.66)',
  textWrap: 'pretty'
};
const stageMonoCss = accent => ({
  fontFamily: 'var(--label)',
  fontSize: 11,
  fontWeight: 'var(--label-w)',
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: accent
});
const glassShell = {
  background: 'rgba(255,255,255,0.055)',
  backdropFilter: 'blur(24px) saturate(150%)',
  WebkitBackdropFilter: 'blur(24px) saturate(150%)',
  border: '1px solid rgba(255,255,255,0.13)',
  boxShadow: '0 28px 70px -26px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.14)',
  borderRadius: 20
};

/* App Store rating row — 5 filled stars with a soft gold glow. */
function AppStoreStars({
  value = '5.0',
  label = 'App Store rating'
}) {
  const star = 'M12 1.6l3.09 6.26 6.91 1-5 4.87 1.18 6.87L12 17.35 5.82 20.6 7 13.73l-5-4.87 6.91-1z';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 9
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 2.5,
      filter: 'drop-shadow(0 1px 3px rgba(255,159,10,0.35))'
    }
  }, [0, 1, 2, 3, 4].map(i => /*#__PURE__*/React.createElement("svg", {
    key: i,
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("linearGradient", {
    id: `asStar${i}`,
    x1: "0",
    y1: "0",
    x2: "0",
    y2: "1"
  }, /*#__PURE__*/React.createElement("stop", {
    offset: "0",
    stopColor: "#FFD24A"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "1",
    stopColor: "#FF9F0A"
  }))), /*#__PURE__*/React.createElement("path", {
    d: star,
    fill: `url(#asStar${i})`
  })))), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12.5,
      fontWeight: 600,
      color: 'rgba(239,244,243,0.92)',
      fontVariantNumeric: 'tabular-nums',
      letterSpacing: '-0.01em'
    }
  }, value), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 1,
      height: 11,
      background: 'rgba(239,244,243,0.22)'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 500,
      color: 'rgba(239,244,243,0.58)',
      letterSpacing: '-0.005em'
    }
  }, label));
}

/* One scene's glass windows. Opacity/transform are written imperatively by the
   stage's rAF loop, so scrolling never re-renders React. */
function GlassPanel({
  scene,
  mobile,
  accent,
  cardRef,
  chipRef
}) {
  const sideStyle = mobile ? {
    left: 16,
    right: 16,
    bottom: 26
  } : scene.side === 'left' ? {
    left: 'max(24px, calc(50% - 566px))',
    top: `${scene.y}%`
  } : {
    right: 'max(24px, calc(50% - 566px))',
    top: `${scene.y}%`
  };
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    ref: cardRef,
    style: {
      ...glassShell,
      ...sideStyle,
      position: 'absolute',
      width: mobile ? 'auto' : 322,
      padding: mobile ? '18px 20px' : '22px 24px',
      opacity: 0,
      pointerEvents: 'none',
      willChange: 'opacity, transform'
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      ...stageTitleCss,
      fontSize: mobile ? 21 : 25,
      margin: mobile ? '0 0 7px' : '0 0 9px'
    }
  }, scene.title), /*#__PURE__*/React.createElement("p", {
    style: {
      ...stageBodyCss,
      fontSize: mobile ? 14.5 : 15
    }
  }, scene.body)));
}

/* Bridge panel — same glass, a step smaller than a scene panel so the scene panels
   stay the primary read. */
function InterludePanel({
  scene,
  cardRef
}) {
  const sideStyle = scene.side === 'left' ? {
    left: 'max(24px, calc(50% - 566px))',
    top: `${scene.y}%`
  } : {
    right: 'max(24px, calc(50% - 566px))',
    top: `${scene.y}%`
  };
  return /*#__PURE__*/React.createElement("div", {
    ref: cardRef,
    style: {
      ...glassShell,
      ...sideStyle,
      position: 'absolute',
      width: 286,
      padding: '18px 20px',
      /* Faint rose wash so the fact panels read as a different voice from the
         teal-accented feature panels — warm, not branded. */
      background: 'linear-gradient(150deg, rgba(255,138,168,0.10) 0%, rgba(255,138,168,0.035) 58%, rgba(255,255,255,0.045) 100%)',
      border: '1px solid rgba(255,176,196,0.17)',
      boxShadow: '0 28px 70px -26px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,214,226,0.16)',
      opacity: 0,
      pointerEvents: 'none',
      willChange: 'opacity, transform'
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      ...stageTitleCss,
      fontSize: 21,
      margin: '0 0 7px'
    }
  }, scene.title), /*#__PURE__*/React.createElement("p", {
    style: {
      ...stageBodyCss,
      fontSize: 14.5
    }
  }, scene.body));
}
function ScrollStage() {
  const mobile = useIsMobile(860);
  const {
    accentColor,
    headline,
    subline,
    appStoreUrl,
    stageGloss
  } = React.useContext(TweaksContext);
  const wrapRef = React.useRef(null);
  const stickyRef = React.useRef(null);
  const canvasRef = React.useRef(null);
  const liquidRef = React.useRef(null);
  const introRef = React.useRef(null);
  const introTitleRef = React.useRef(null);
  const introCtaRef = React.useRef(null);
  const cardRefs = React.useRef([]);
  const interRefs = React.useRef([]);
  const chipRefs = React.useRef([]);
  const [failed, setFailed] = React.useState(false);
  /* The poster still covers the canvas until a real textured frame is up. */
  const [revealed, setRevealed] = React.useState(false);
  /* Bumping this re-runs the stage effect from scratch — the recovery path for a
     context the browser never restores on its own. */
  const [gen, setGen] = React.useState(0);
  const screens = PHONE_SCREEN_SETS[stageScreenKey(mobile)];
  const [deps, setDeps] = React.useState(() => typeof window.Phone3D !== 'undefined');
  React.useEffect(() => {
    if (deps) return;
    const el = wrapRef.current;
    if (!el) return;
    let fired = false;
    const go = () => {
      if (fired) return;
      fired = true;
      loadStageDeps().then(() => {
        setFailed(false);
        setDeps(true);
      }).catch(() => {
        setFailed(true);
        window.dispatchEvent(new Event('althea:stage-ready'));
      });
    };
    /* Backstop only, at a zero margin. index.html starts these on the first real
       scroll intent, which is both earlier and better judged. The old one-viewport
       margin was useless as a gate anyway: the tour begins ~176px below the fold,
       so any margin larger than that intersected at page load — which is why a
       mobile visitor who had not scrolled was served the whole 3D tour. */
    const io = new IntersectionObserver(es => {
      if (es.some(e => e.isIntersecting)) {
        io.disconnect();
        go();
      }
    }, {
      rootMargin: '0px'
    });
    io.observe(el);
    const guard = setTimeout(() => {
      if (typeof window.Phone3D === 'undefined') {
        setFailed(true);
        window.dispatchEvent(new Event('althea:stage-ready'));
      }
    }, 25000);
    return () => {
      io.disconnect();
      clearTimeout(guard);
    };
  }, [deps]);
  React.useEffect(() => {
    if (!deps) return;
    const bootDone = () => window.dispatchEvent(new Event('althea:stage-ready'));
    if (typeof window.Phone3D === 'undefined') {
      setFailed(true);
      bootDone();
      return;
    }
    let phone,
      raf = 0,
      disposed = false;
    try {
      phone = window.Phone3D.createPhoneScene({
        container: canvasRef.current,
        screens,
        dwell: DWELL,
        frontSwing: FRONT_SWING,
        smoothing: 0.12,
        fill: mobile ? 0.56 : 0.68
      });
    } catch (e) {
      setFailed(true);
      bootDone();
      return;
    }
    /* The scene exists and is about to render: whatever failed earlier is moot. */
    setFailed(false);
    window.__stage = phone;

    /* The module starts its OWN requestAnimationFrame loop internally and keeps it
       running for the life of the page — it has a pause() but no resume(), and its
       dispose() does not stop it. Paired with the loop below that is two render
       loops, both drawing at full pixel ratio, both still going when the tour is
       thousands of pixels offscreen. Shut the internal one down immediately and do
       the easing here instead: one loop, and one this component can actually stop.
       SMOOTHING duplicates the value passed above, which now goes unused. */
    try {
      phone.pause();
    } catch (e) {}
    const SMOOTHING = 0.12;
    let cur = 0,
      snap = true;

    /* Drop clearcoat on the dark-glass materials (desktop) and keep the shell
       reflections low — see the material pass below. */
    const maxAniso = (() => {
      try {
        return phone.renderer.capabilities.getMaxAnisotropy();
      } catch (e) {
        return 8;
      }
    })();
    const eachMaterial = fn => {
      phone.phone.traverse(o => {
        if (!o.material) return;
        (Array.isArray(o.material) ? o.material : [o.material]).forEach(fn);
      });
    };
    /* Tame the shell's gloss. The back panel was catching the whole environment map
       and flashing bright against the dark page on every revolution, so every shell
       material — anything that isn't the screen — gets rougher and reflects far
       less. `stageGloss` (0–1, Tweaks) scales how much reflection is left.
       Desktop also drops clearcoat: the only physical-only feature in use, so
       killing it removes those shader chunks and roughly halves fragment cost. */
    /* A material carrying a colour map IS the screen — nothing else on the model is
       textured. Test the map slot, not its pixels: with the screenshots now loading
       lazily the image can still be in flight here, and the gloss pass runs once. */
    const isScreen = m => !!m.map || !!(m.name && /screen|display/i.test(m.name));
    const gloss = Math.max(0, Math.min(1, stageGloss == null ? 0.38 : stageGloss));
    /* Materials are shared across meshes, so this pass must be idempotent: cache the
       authored values on first touch and always derive from that base, never from the
       current (already-reduced) value. */
    eachMaterial(m => {
      if (!mobile && m.clearcoat > 0) m.clearcoat = 0;
      if (isScreen(m)) return;
      if (!m.__glossBase) m.__glossBase = {
        r: m.roughness,
        mt: m.metalness,
        env: m.envMapIntensity == null ? 1 : m.envMapIntensity
      };
      if (m.__glossAt === gloss) return;
      const b = m.__glossBase;
      if (typeof b.r === 'number') m.roughness = Math.min(0.92, Math.max(b.r, 0.3) * (1 + (1 - gloss) * 0.7));
      if (typeof b.mt === 'number') m.metalness = Math.min(b.mt, 0.45 + gloss * 0.4);
      m.envMapIntensity = Math.min(b.env, 1) * gloss;
      m.__glossAt = gloss;
      m.needsUpdate = true;
    });

    /* The stage swaps the screenshot texture per scene, so sampling has to be
       re-applied as maps change. Two levers, both nearly free:
       · anisotropy — the phone is almost always tilted, so the screen is sampled
         obliquely; max anisotropy is the single biggest sharpness win.
       · no mipmaps — the textures are now display-matched, so every mip level is
         smaller than what's on screen and can only blur. minFilter is set from
         magFilter (LinearFilter) rather than a hard-coded constant, so it stays
         correct across three.js versions. Safe against shimmer because anisotropic
         filtering is doing the minification work instead. */
    const sharpenMaps = () => eachMaterial(m => {
      const t = m.map;
      /* Skip textures whose bitmap has not arrived yet — flagging one for upload with
         no image data makes three.js warn on every frame. Left unstamped so the pass
         picks it up once decoded. */
      const img = t && t.image;
      if (!img || !(img.width || img.videoWidth)) return;
      if (!t || t.__altheaSharp === maxAniso) return;
      t.anisotropy = maxAniso;
      if (t.generateMipmaps !== false) {
        t.generateMipmaps = false;
        t.minFilter = t.magFilter;
        if (t.mipmaps && t.mipmaps.length) t.mipmaps.length = 0;
      }
      t.__altheaSharp = maxAniso;
      t.needsUpdate = true;
    });
    sharpenMaps();

    /* Adaptive resolution. A fixed guess can't work: the screenshot is 2622px tall
       but the on-screen phone is only ~600-800px, so more pixel ratio keeps adding
       real detail well past 2× — while the ceiling that holds 60fps depends on the
       GPU. So start high and let measured frame time settle it. */
    const maxPr = Math.min(window.devicePixelRatio || 1, mobile ? 2.5 : 3);
    const minPr = Math.min(maxPr, 1.6);
    let curPr = maxPr;
    const applyPr = () => {
      const el = canvasRef.current;
      if (!el || !el.clientWidth) return;
      try {
        phone.renderer.setPixelRatio(curPr);
        phone.renderer.setSize(el.clientWidth, el.clientHeight, false);
      } catch (e) {}
    };
    const fitPixelRatio = applyPr;

    /* Frame-time governor. The healthy interval is the DISPLAY's, not a constant:
       16.7ms is perfect on 60Hz and terrible on 144Hz. Learn it from the fastest
       quartile of early frames (capped at 17ms so a GPU that is already pegged
       can't normalise its own slowness), then judge frames against that. */
    let budget = 0,
      bgShed = false;
    const warmup = [];
    let slow = 0,
      quick = 0,
      lastFrame = performance.now();
    const governPr = () => {
      const now = performance.now();
      const dt = now - lastFrame;
      lastFrame = now;
      if (dt <= 0 || dt > 100) return; // tab throttle or stall, not a real frame
      if (!budget) {
        warmup.push(dt);
        if (warmup.length < 90) return;
        const s = warmup.slice().sort((a, b) => a - b);
        budget = Math.min(17, Math.max(6, s[Math.floor(s.length * 0.25)]));
        return;
      }
      if (dt > budget * 1.35) {
        slow++;
        quick = 0;
      } else {
        slow = 0;
        if (dt < budget * 1.15) quick++;
      }
      if (slow > 12) {
        /* Shed the cheapest thing first. The liquid background is decoration —
           several large blurred layers the compositor fills every frame — while
           pixel ratio is the phone's legibility. Drop the background before
           softening the product shot, and only reduce resolution if that wasn't
           enough. Restores in reverse order once frames are healthy again. */
        if (!bgShed && liquidRef.current) {
          bgShed = true;
          liquidRef.current.style.display = 'none';
          slow = 0;
          quick = 0;
        } else if (curPr > minPr) {
          curPr = Math.max(minPr, curPr - 0.25);
          slow = 0;
          quick = 0;
          applyPr();
        }
      } else if (quick > 240) {
        if (curPr < maxPr) {
          curPr = Math.min(maxPr, curPr + 0.25);
          slow = 0;
          quick = 0;
          applyPr();
        } else if (bgShed && liquidRef.current) {
          bgShed = false;
          liquidRef.current.style.display = '';
          slow = 0;
          quick = 0;
        }
      }
    };
    applyPr();
    window.addEventListener('resize', fitPixelRatio);

    /* Handover. phone.ready() resolves on ALL SIX screenshots, and on a slow link
       that held the poster up (or, before the poster existed, left the section
       black) for tens of seconds. Only screen 01 is on the front face at the start
       of the tour, so race the full set against the FIRST decoded texture: the
       phone takes over as soon as it can be shown correctly and 02-06 stream in
       during the first revolution. The cap keeps one stalled image from pinning it. */
    const firstTextureUp = () => new Promise(res => {
      const t0 = performance.now();
      const poll = () => {
        if (disposed) return res();
        let any = false;
        try {
          eachMaterial(m => {
            const im = m.map && m.map.image;
            if (im && (im.width || im.videoWidth)) any = true;
          });
        } catch (e) {
          any = true;
        }
        if (any || performance.now() - t0 > 7000) return res();
        setTimeout(poll, 80);
      };
      poll();
    });
    const handOver = () => {
      if (disposed) return;
      try {
        phone.renderAt(0);
      } catch (e) {}
      requestAnimationFrame(() => requestAnimationFrame(() => {
        if (disposed) return;
        setRevealed(true);
        bootDone();
      }));
    };
    Promise.race([Promise.resolve().then(() => phone.ready()).catch(() => {}), firstTextureUp()]).then(handOver, handOver);
    /* Last resort: if the handover has not happened by now and the context is
       alive, reveal regardless. */
    const revealFailsafe = setTimeout(() => {
      if (!disposed && !lost) handOver();
    }, 9000);

    /* A WebGL context can be dropped while the tour sits offscreen — routine on
       phones under memory pressure. Nothing repainted the canvas afterwards, so
       scrolling back up landed on a dead black rectangle. Put the poster back, and
       take it down again if the browser restores the context. */
    let lost = false;
    const glCanvas = phone.renderer && phone.renderer.domElement;
    /* preventDefault is what makes the loss recoverable at all. Stop the loop while
       it is gone: every renderAt into a lost context throws, which at 60fps is its
       own problem. The poster comes back up in the meantime. */
    let relost = 0;
    const onLost = ev => {
      ev.preventDefault();
      lost = true;
      stop();
      setRevealed(false);
      /* webglcontextrestored is not guaranteed to fire — frequently it never does.
         Waiting on it left `lost` true for the life of the page and the tour dead
         behind the poster. If the browser has not come back on its own, rebuild the
         whole scene: the cleanup disposes the old renderer and the re-run gets a
         fresh context. */
      clearTimeout(relost);
      relost = setTimeout(() => {
        if (lost && !disposed) setGen(g => g + 1);
      }, 2500);
    };
    const onRestored = () => {
      lost = false;
      clearTimeout(relost);
      try {
        phone.renderAt(cur);
      } catch (e) {}
      setRevealed(true);
      start();
    };
    if (glCanvas) {
      glCanvas.addEventListener('webglcontextlost', onLost);
      glCanvas.addEventListener('webglcontextrestored', onRestored);
    }
    let liquid = null;
    if (typeof window.createLiquidLayer === 'function' && liquidRef.current) {
      try {
        liquid = window.createLiquidLayer({
          container: liquidRef.current,
          color: accentColor,
          rate: mobile ? 0.055 : 0.028,
          intensity: mobile ? 0.55 : 0.42
        });
      } catch (e) {
        liquid = null;
      }
    }
    let frameN = 0;
    const frame = () => {
      const el = wrapRef.current;
      if (!el || disposed || !running) return;
      if ((++frameN & 15) === 0) sharpenMaps();
      governPr();
      const r = el.getBoundingClientRect();
      /* Measure against the sticky viewport box, not window.innerHeight: on iOS
         those differ (innerHeight includes the area behind the toolbars), which
         skews progress and drifts the panels out of step with the phone. */
      const vpH = stickyRef.current ? stickyRef.current.offsetHeight : window.innerHeight;
      const span = r.height - vpH;
      const raw = span > 0 ? Math.max(0, Math.min(1, -r.top / span)) : 0;
      const p = raw * P_END;
      /* Snap on the first frame after a resume: easing up from wherever the phone
         was parked would read as an unexplained spin when the tour comes back. */
      cur = snap ? p : cur + (p - cur) * SMOOTHING;
      snap = false;
      try {
        phone.renderAt(cur);
      } catch (e) {}
      if (liquid) liquid.setProgress(raw);
      const introVis = 1 - stageSmooth(0, INTRO_FADE, p);
      /* Mobile: the CTA panel sits low over the phone, so a slide-up reads as drift.
         It fades on its own slightly shorter window and stays put; the headline keeps
         the lift. Desktop is unchanged (whole intro fades and lifts together). */
      const ctaVis = mobile ? 1 - stageSmooth(0, INTRO_FADE * 0.66, p) : 1;
      if (introRef.current) {
        introRef.current.style.opacity = mobile ? 1 : introVis;
        introRef.current.style.transform = mobile ? 'none' : `translateY(${(1 - introVis) * -22}px)`;
        introRef.current.style.pointerEvents = introVis > 0.4 ? 'auto' : 'none';
      }
      if (introTitleRef.current) {
        introTitleRef.current.style.opacity = mobile ? introVis : 1;
        introTitleRef.current.style.transform = mobile ? `translateY(${(1 - introVis) * -22}px)` : 'none';
      }
      if (introCtaRef.current) {
        introCtaRef.current.style.opacity = ctaVis;
        introCtaRef.current.style.pointerEvents = ctaVis > 0.4 ? 'auto' : 'none';
      }
      const {
        i,
        vis
      } = panelStateFor(p);
      const gate = vis * (1 - introVis);
      for (let k = 0; k < N_SCENES; k++) {
        const v = k === i ? gate : 0;
        const card = cardRefs.current[k],
          chip = chipRefs.current[k];
        const dir = STAGE_SCENES[k].side === 'left' ? -1 : 1;
        if (card) {
          card.style.opacity = v;
          card.style.transform = `translate3d(${(1 - v) * 18 * dir}px, ${(1 - v) * 26}px, 0)`;
        }
        if (chip) {
          chip.style.opacity = v * 0.98;
          chip.style.transform = `translate3d(${(1 - v) * -11 * dir}px, ${(1 - v) * 39}px, 0)`;
        }
      }
      const gap = interludeStateFor(p);
      for (let k = 0; k < STAGE_INTERLUDES.length; k++) {
        const el = interRefs.current[k];
        if (!el) continue;
        const v = (k === gap.i ? gap.vis : 0) * (1 - introVis);
        const dir = STAGE_INTERLUDES[k].side === 'left' ? -1 : 1;
        el.style.opacity = v;
        el.style.transform = `translate3d(${(1 - v) * 16 * dir}px, ${(1 - v) * 22}px, 0)`;
      }
    };
    const tick = () => {
      if (disposed || !running) return;
      raf = requestAnimationFrame(tick);
      try {
        frame();
      } catch (e) {}
    };

    /* Run only while the tour is on screen — or about to be.
    
       An IntersectionObserver cannot express that here, which is why the previous
       attempt at this gate silently never fired. The observed wrapper is seven
       viewports tall and its top sits EXACTLY at the fold, so the gap between it and
       the viewport is zero: any positive rootMargin — the one viewport of warm-up
       that was wanted — makes the box intersect at scrollY 0 and the loop never
       idles. Zero margin would idle correctly but drops the warm-up. Proximity is
       simply the wrong signal when the thing is already touching the fold.
    
       Direction is the right signal. Strict overlap decides when to STOP; scrolling
       downward anywhere within half a viewport of the tour decides when to START. So
       sitting on the hero renders nothing at all, a scroll toward the tour warms the
       phone before it is visible, and scrolling back up stops it — which is the case
       that was pinning the GPU until the browser dropped the context. */
    const WARM = 0.6;
    let running = false;
    const start = () => {
      if (running || disposed) return;
      if (lost) {
        let alive = false;
        try {
          const gl = phone.renderer.getContext();
          alive = gl && !gl.isContextLost();
        } catch (e) {}
        if (!alive) return;
        lost = false;
      }
      running = true;
      snap = true;
      raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      if (!running) return;
      running = false;
      cancelAnimationFrame(raf);
    };
    let near = false,
      lastY = window.scrollY,
      settle = 0;
    /* strict = the stage is actually on screen. Also the resting test: once scrolling
       stops, a page parked just above the tour must not keep rendering, so the settle
       timer re-evaluates without the directional allowance. */
    const evaluate = down => {
      const el = wrapRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const strict = r.top < vh && r.bottom > 0;
      near = strict || down && r.top < vh * (1 + WARM) && r.bottom > 0;
      if (near && !document.hidden) start();else stop();
    };
    const onScroll = () => {
      const y = window.scrollY;
      const down = y > lastY;
      lastY = y;
      evaluate(down);
      clearTimeout(settle);
      settle = setTimeout(() => evaluate(false), 400);
    };
    window.addEventListener('scroll', onScroll, {
      passive: true
    });
    window.addEventListener('resize', onScroll);
    evaluate(false);
    const onVisibility = () => {
      if (document.hidden) stop();else if (near) start();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      disposed = true;
      stop();
      clearTimeout(settle);
      clearTimeout(relost);
      clearTimeout(revealFailsafe);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      document.removeEventListener('visibilitychange', onVisibility);
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', fitPixelRatio);
      if (glCanvas) {
        glCanvas.removeEventListener('webglcontextlost', onLost);
        glCanvas.removeEventListener('webglcontextrestored', onRestored);
      }
      /* pause() before dispose(): the module's dispose does not stop its internal
         loop, so without this a re-run (breakpoint cross, tweak change) would leave
         an orphan loop rendering into a disposed renderer for the rest of the page. */
      try {
        phone.pause();
      } catch (e) {}
      try {
        phone.dispose();
      } catch (e) {}
      try {
        if (liquid) liquid.dispose();
      } catch (e) {}
    };
  }, [deps, mobile, accentColor, stageGloss, gen]);
  const totalVh = N_SCENES * P_END * VH_PER_SCREEN + 40;
  return /*#__PURE__*/React.createElement("section", {
    ref: wrapRef,
    id: "tour",
    style: {
      height: `${totalVh}vh`,
      position: 'relative',
      overflow: 'visible',
      background: 'transparent'
    }
  }, /*#__PURE__*/React.createElement("div", {
    ref: stickyRef,
    className: "stage-vp",
    style: {
      position: 'sticky',
      top: 0,
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: `radial-gradient(52% 40% at 50% 46%, ${accentColor}14 0%, rgba(0,0,0,0) 68%)`
    }
  }), /*#__PURE__*/React.createElement("div", {
    ref: liquidRef,
    "aria-hidden": "true",
    style: {
      position: 'absolute',
      inset: '-8%',
      overflow: 'hidden',
      opacity: mobile ? 0.7 : 0.5,
      pointerEvents: 'none'
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "stage-3d",
    style: {
      position: 'absolute',
      inset: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    ref: canvasRef,
    style: {
      position: 'absolute',
      inset: 0,
      transform: mobile ? 'translateY(-6%)' : 'none'
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "stage-poster",
    style: {
      opacity: revealed ? 0 : 1
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: screens[0],
    alt: "Althea app",
    decoding: "async"
  })), STAGE_SCENES.map((s, i) => /*#__PURE__*/React.createElement(GlassPanel, {
    key: s.n,
    scene: s,
    mobile: mobile,
    accent: accentColor,
    cardRef: el => {
      cardRefs.current[i] = el;
    },
    chipRef: el => {
      chipRefs.current[i] = el;
    }
  })), !mobile && STAGE_INTERLUDES.map((s, i) => /*#__PURE__*/React.createElement(InterludePanel, {
    key: s.n,
    scene: s,
    cardRef: el => {
      interRefs.current[i] = el;
    }
  })), /*#__PURE__*/React.createElement("div", {
    ref: introRef,
    style: {
      position: 'absolute',
      inset: 0,
      display: 'grid',
      gridTemplateRows: 'auto 1fr auto',
      justifyItems: 'center',
      padding: mobile ? '14px 0 max(80px, calc(env(safe-area-inset-bottom, 0px) + 80px))' : '24px 0 6vh',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("h2", {
    ref: introTitleRef,
    style: {
      fontSize: mobile ? 'clamp(22px, 6.2vw, 29px)' : 'clamp(28px, 3.4vw, 43px)',
      lineHeight: 1.14,
      color: '#EFF4F3',
      margin: mobile ? '0 16px' : '0 20px',
      maxWidth: 'none',
      /* Desktop holds it on one line: the vw-based size means the line scales
         with the window, so it never overflows above the 860px breakpoint. */
      whiteSpace: mobile ? 'normal' : 'nowrap',
      textShadow: '0 2px 20px rgba(0,0,0,0.5)'
    }
  }, (subline || '').split(/(GLP-1)/).map((part, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      fontWeight: part === 'GLP-1' ? 600 : 500
    }
  }, part))), /*#__PURE__*/React.createElement("div", {
    ref: introCtaRef,
    style: {
      ...glassShell,
      borderRadius: 24,
      padding: mobile ? '16px 20px' : '18px 28px',
      position: 'absolute',
      /* Mobile keeps it docked low over the phone; desktop sits beside the
         phone, vertically centred on the device, clear of the render. */
      left: mobile ? 16 : 'auto',
      /* Same inset rule as the scene GlassPanels: pinned to the 1132px content
         column so it sits just off the phone, falling back to a 24px edge
         inset on narrower screens. */
      right: mobile ? 16 : 'max(16px, calc(50% - 566px))',
      marginInline: mobile ? 'auto' : 0,
      bottom: mobile ? 'max(26px, calc(env(safe-area-inset-bottom, 0px) + 26px))' : 'auto',
      top: mobile ? 'auto' : '50%',
      transform: mobile ? 'none' : 'translateY(-50%)',
      width: 'fit-content',
      maxWidth: mobile ? 'calc(100% - 32px)' : 'min(420px, calc(100% - 32px))',
      background: 'rgba(255,255,255,0.045)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(AppStoreBadge, {
    dark: false,
    href: appStoreUrl
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14,
      paddingTop: 13,
      borderTop: '1px solid rgba(255,255,255,0.10)'
    }
  }, /*#__PURE__*/React.createElement(AppStoreStars, null))))));
}
Object.assign(window, {
  ScrollStage,
  STAGE_SCENES,
  GlassPanel,
  AppStoreStars,
  PHONE_SCREEN_SETS
});
})();
/* site-video-app.jsx */
(function(){
// ⚠ COMPILED FILE. index.html runs app-bundle.js in production, not this source.
//   Editing here alone changes nothing on the live site — rebuild app-bundle.js
//   (see README-bundle.md). Open the page on localhost or with ?src to bypass the
//   bundle and run these sources directly.
// site-video-app.jsx — root for the scroll-video landing page
// Same section library as index.html; the hero + showcase are replaced by <ScrollStage />.

const VIDEO_TWEAK_DEFAULTS = {
  accentColor: '#2AB5A2',
  headline: 'Track every dose.\nSee every result.',
  subline: 'The #1 companion app for your GLP-1 medication journey.',
  appStoreUrl: 'https://apps.apple.com/gr/app/althea-glp-1-tracker/id6792283773',
  trialDays: 7,
  stageGloss: 0.3,
  animChartDraw: true,
  animCountUp: true,
  animProgressRail: true,
  animHeroParallax: true
};
function VideoApp() {
  const [t, setTweak] = useTweaks(VIDEO_TWEAK_DEFAULTS);
  const anim = {
    animChartDraw: t.animChartDraw,
    animCountUp: t.animCountUp,
    animProgressRail: t.animProgressRail,
    animHeroParallax: t.animHeroParallax
  };
  return /*#__PURE__*/React.createElement(TweaksContext.Provider, {
    value: t
  }, /*#__PURE__*/React.createElement(AnimContext.Provider, {
    value: anim
  }, /*#__PURE__*/React.createElement(DarkNavBar, null), /*#__PURE__*/React.createElement(ScrollStage, null), /*#__PURE__*/React.createElement(DarkFAQSection, null), /*#__PURE__*/React.createElement(DarkFooter, null), /*#__PURE__*/React.createElement(TweaksPanel, null, /*#__PURE__*/React.createElement(TweakSection, {
    label: "Brand"
  }), /*#__PURE__*/React.createElement(TweakColor, {
    label: "Accent colour",
    value: t.accentColor,
    options: ['#2AB5A2', '#1E9E8C', '#0A84FF', '#64748B'],
    onChange: v => setTweak('accentColor', v)
  }), /*#__PURE__*/React.createElement(TweakSection, {
    label: "Tour copy"
  }), /*#__PURE__*/React.createElement(TweakText, {
    label: "Headline",
    value: t.headline,
    onChange: v => setTweak('headline', v)
  }), /*#__PURE__*/React.createElement(TweakText, {
    label: "Subline",
    value: t.subline,
    onChange: v => setTweak('subline', v)
  }), /*#__PURE__*/React.createElement(TweakSection, {
    label: "Animations"
  }), /*#__PURE__*/React.createElement(TweakSlider, {
    label: "Phone back gloss",
    value: t.stageGloss,
    min: 0,
    max: 1,
    step: 0.05,
    onChange: v => setTweak('stageGloss', v)
  }), /*#__PURE__*/React.createElement(TweakToggle, {
    label: "Self-drawing charts",
    value: t.animChartDraw,
    onChange: v => setTweak('animChartDraw', v)
  }), /*#__PURE__*/React.createElement(TweakToggle, {
    label: "Count-up stats",
    value: t.animCountUp,
    onChange: v => setTweak('animCountUp', v)
  }), /*#__PURE__*/React.createElement(TweakSection, {
    label: "App Store"
  }), /*#__PURE__*/React.createElement(TweakText, {
    label: "App Store URL",
    value: t.appStoreUrl,
    onChange: v => setTweak('appStoreUrl', v)
  }), /*#__PURE__*/React.createElement(TweakNumber, {
    label: "Free trial days",
    value: t.trialDays,
    min: 1,
    max: 30,
    step: 1,
    onChange: v => setTweak('trialDays', v)
  }))));
}
ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/React.createElement(VideoApp, null));
})();