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
  m: [1, 2, 3, 4, 5, 6].map(n => `screens/m/screen-${n}.jpg`),
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
const DWELL = 0.72;        // share of each revolution facing the viewer
const FRONT_SWING = 42;    // degrees of drift while facing you
const VH_PER_SCREEN = 115; // scroll distance per revolution
const INTRO_FADE = 0.032;

const STAGE_SCENES = [
  { n: '01', kicker: 'Today', title: 'Everything, in one place',
    body: 'Weight, doses, and progress \u2014 all in a single screen you can check in seconds.',
    chip: 'Under 60s to log a day', side: 'right', y: 21 },
  { n: '02', kicker: 'Progress', title: 'Progress you can feel',
    body: 'Smoothed trends cut through the daily noise, so one heavy Tuesday never reads as failure.',
    chip: 'Weekly \u00b7 90-day \u00b7 all-time', side: 'left', y: 28 },
  { n: '03', kicker: 'Nutrition', title: 'Calorie Tracking, without the friction',
    body: 'Scan a barcode, log the meal, and watch protein and hydration keep pace with the loss.',
    chip: 'Barcode scanning built in', side: 'right', y: 24 },
  { n: '04', kicker: 'Side effects', title: 'Side effects, in context',
    body: 'Althea charts it against your dose curve, so patterns surface early.',
    chip: 'Plotted against dose day', side: 'left', y: 22 },
  { n: '05', kicker: 'Measurements', title: 'More than the scale',
    body: 'Chest, waist, hips, arms \u2014 the inches that keep moving on the weeks the scale sits still.',
    chip: 'Guided, five sites a session', side: 'right', y: 28 },
  { n: '06', kicker: 'Reports', title: 'Ready for the appointment',
    body: 'Export your data as one clean PDF, ready for your provider.',
    chip: 'One-tap PDF export', side: 'left', y: 24 },
];

/* Desktop-only bridge panels, one per rotation gap. Each fills the stretch where the
   phone is spinning between two screens and no scene panel is up, so something is
   always readable on the way down. Each takes the side OPPOSITE the panel it follows
   and sits in the lower band (scene panels all live high, y 21-28%), so it never
   shares a position with the panel before or after it. Copy bridges the two screens
   it sits between. */
const STAGE_INTERLUDES = [
  { n: 'i1', title: '2 in 5 American adults live with obesity',
    body: 'A little over 40% \u2014 a chronic condition with genetic and hormonal drivers, not a matter of discipline.',
    side: 'left', y: 62 },
  { n: 'i2', title: 'Daily weighers lose about twice as much',
    body: 'Stepping on the scale most days is one of the strongest predictors of weight lost \u2014 and kept off.',
    side: 'right', y: 64 },
  { n: 'i3', title: 'Five percent already counts',
    body: 'A 5\u201310% loss measurably improves blood pressure, blood sugar, and cholesterol \u2014 long before you reach a goal weight.',
    side: 'left', y: 61 },
  { n: 'i4', title: 'Protein protects what you keep',
    body: 'Losing weight costs muscle too. Enough protein and a little resistance work keeps more of it on you.',
    side: 'right', y: 65 },
  { n: 'i5', title: 'Waist tells you what the scale won\u2019t',
    body: 'Visceral fat drives the health risk, and it starts moving before body weight does.',
    side: 'left', y: 63 },
];

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
  const i = Math.floor(cyc), u = cyc - i;
  if (u >= DWELL) return { i, vis: 0 };
  const f = u / DWELL;
  return { i, vis: stageSmooth(0, 0.16, f) * (1 - stageSmooth(0.84, 1, f)) };
}

/* Bridge visibility: the gap window is the tail of each revolution (u >= DWELL),
   shorter than the dwell, so it fades on a snappier curve. */
function interludeStateFor(p) {
  const cyc = Math.min(p, 0.999999) * N_SCENES;
  const i = Math.floor(cyc), u = cyc - i;
  if (u < DWELL) return { i, vis: 0 };
  const f = (u - DWELL) / (1 - DWELL);
  return { i, vis: stageSmooth(0, 0.15, f) * (1 - stageSmooth(0.86, 1, f)) };
}

const stageTitleCss = {
  fontFamily: 'var(--display)', fontWeight: 'var(--display-w)', fontSize: 25,
  letterSpacing: 'var(--display-ls)', lineHeight: 1.18, color: '#EFF4F3', textWrap: 'balance',
};
const stageBodyCss = { fontSize: 15, lineHeight: 1.6, color: 'rgba(239,244,243,0.66)', textWrap: 'pretty' };
const stageMonoCss = (accent) => ({
  fontFamily: 'var(--label)', fontSize: 11, fontWeight: 'var(--label-w)',
  letterSpacing: '0.14em', textTransform: 'uppercase', color: accent,
});
const glassShell = {
  background: 'rgba(255,255,255,0.055)',
  backdropFilter: 'blur(24px) saturate(150%)',
  WebkitBackdropFilter: 'blur(24px) saturate(150%)',
  border: '1px solid rgba(255,255,255,0.13)',
  boxShadow: '0 28px 70px -26px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.14)',
  borderRadius: 20,
};

/* App Store rating row — 5 filled stars with a soft gold glow. */
function AppStoreStars({ value = '5.0', label = 'App Store rating' }) {
  const star = 'M12 1.6l3.09 6.26 6.91 1-5 4.87 1.18 6.87L12 17.35 5.82 20.6 7 13.73l-5-4.87 6.91-1z';
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9 }}>
      <div style={{ display: 'flex', gap: 2.5, filter: 'drop-shadow(0 1px 3px rgba(255,159,10,0.35))' }}>
        {[0, 1, 2, 3, 4].map(i => (
          <svg key={i} width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
            <defs>
              <linearGradient id={`asStar${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#FFD24A" />
                <stop offset="1" stopColor="#FF9F0A" />
              </linearGradient>
            </defs>
            <path d={star} fill={`url(#asStar${i})`} />
          </svg>
        ))}
      </div>
      <span style={{
        fontSize: 12.5, fontWeight: 600, color: 'rgba(239,244,243,0.92)',
        fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.01em',
      }}>{value}</span>
      <span style={{ width: 1, height: 11, background: 'rgba(239,244,243,0.22)' }} />
      <span style={{ fontSize: 12, fontWeight: 500, color: 'rgba(239,244,243,0.58)', letterSpacing: '-0.005em' }}>{label}</span>
    </div>
  );
}

/* One scene's glass windows. Opacity/transform are written imperatively by the
   stage's rAF loop, so scrolling never re-renders React. */
function GlassPanel({ scene, mobile, accent, cardRef, chipRef }) {
  const sideStyle = mobile ? { left: 16, right: 16, bottom: 26 }
    : (scene.side === 'left'
      ? { left: 'max(24px, calc(50% - 566px))', top: `${scene.y}%` }
      : { right: 'max(24px, calc(50% - 566px))', top: `${scene.y}%` });
  return (
    <>
      <div ref={cardRef} style={{
        ...glassShell, ...sideStyle, position: 'absolute',
        width: mobile ? 'auto' : 322, padding: mobile ? '18px 20px' : '22px 24px',
        opacity: 0, pointerEvents: 'none', willChange: 'opacity, transform',
      }}>
        <h3 style={{ ...stageTitleCss, fontSize: mobile ? 21 : 25, margin: mobile ? '0 0 7px' : '0 0 9px' }}>{scene.title}</h3>
        <p style={{ ...stageBodyCss, fontSize: mobile ? 14.5 : 15 }}>{scene.body}</p>
      </div>
    </>
  );
}

/* Bridge panel — same glass, a step smaller than a scene panel so the scene panels
   stay the primary read. */
function InterludePanel({ scene, cardRef }) {
  const sideStyle = scene.side === 'left'
    ? { left: 'max(24px, calc(50% - 566px))', top: `${scene.y}%` }
    : { right: 'max(24px, calc(50% - 566px))', top: `${scene.y}%` };
  return (
    <div ref={cardRef} style={{
      ...glassShell, ...sideStyle, position: 'absolute', width: 286, padding: '18px 20px',
      /* Faint rose wash so the fact panels read as a different voice from the
         teal-accented feature panels — warm, not branded. */
      background: 'linear-gradient(150deg, rgba(255,138,168,0.10) 0%, rgba(255,138,168,0.035) 58%, rgba(255,255,255,0.045) 100%)',
      border: '1px solid rgba(255,176,196,0.17)',
      boxShadow: '0 28px 70px -26px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,214,226,0.16)',
      opacity: 0, pointerEvents: 'none', willChange: 'opacity, transform',
    }}>
      <h3 style={{ ...stageTitleCss, fontSize: 21, margin: '0 0 7px' }}>{scene.title}</h3>
      <p style={{ ...stageBodyCss, fontSize: 14.5 }}>{scene.body}</p>
    </div>
  );
}

function ScrollStage() {
  const mobile = useIsMobile(860);
  const { accentColor, headline, subline, appStoreUrl, stageGloss } = React.useContext(TweaksContext);
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
      loadStageDeps().then(() => setDeps(true)).catch(() => {
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
      if (es.some(e => e.isIntersecting)) { io.disconnect(); go(); }
    }, { rootMargin: '0px' });
    io.observe(el);
    const guard = setTimeout(() => {
      if (typeof window.Phone3D === 'undefined') {
        setFailed(true);
        window.dispatchEvent(new Event('althea:stage-ready'));
      }
    }, 25000);
    return () => { io.disconnect(); clearTimeout(guard); };
  }, [deps]);

  React.useEffect(() => {
    if (!deps) return;
    const bootDone = () => window.dispatchEvent(new Event('althea:stage-ready'));
    if (typeof window.Phone3D === 'undefined') { setFailed(true); bootDone(); return; }
    let phone, raf = 0, disposed = false;
    try {
      phone = window.Phone3D.createPhoneScene({
        container: canvasRef.current,
        screens,
        dwell: DWELL,
        frontSwing: FRONT_SWING,
        smoothing: 0.12,
        fill: mobile ? 0.56 : 0.68,
      });
    } catch (e) { setFailed(true); bootDone(); return; }
    window.__stage = phone;

    /* The module starts its OWN requestAnimationFrame loop internally and keeps it
       running for the life of the page — it has a pause() but no resume(), and its
       dispose() does not stop it. Paired with the loop below that is two render
       loops, both drawing at full pixel ratio, both still going when the tour is
       thousands of pixels offscreen. Shut the internal one down immediately and do
       the easing here instead: one loop, and one this component can actually stop.
       SMOOTHING duplicates the value passed above, which now goes unused. */
    try { phone.pause(); } catch (e) {}
    const SMOOTHING = 0.12;
    let cur = 0, snap = true;

    /* Drop clearcoat on the dark-glass materials (desktop) and keep the shell
       reflections low — see the material pass below. */
    const maxAniso = (() => {
      try { return phone.renderer.capabilities.getMaxAnisotropy(); } catch (e) { return 8; }
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
      if (!m.__glossBase) m.__glossBase = { r: m.roughness, mt: m.metalness, env: m.envMapIntensity == null ? 1 : m.envMapIntensity };
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
    let budget = 0, bgShed = false;
    const warmup = [];
    let slow = 0, quick = 0, lastFrame = performance.now();
    const governPr = () => {
      const now = performance.now();
      const dt = now - lastFrame;
      lastFrame = now;
      if (dt <= 0 || dt > 100) return;   // tab throttle or stall, not a real frame
      if (!budget) {
        warmup.push(dt);
        if (warmup.length < 90) return;
        const s = warmup.slice().sort((a, b) => a - b);
        budget = Math.min(17, Math.max(6, s[Math.floor(s.length * 0.25)]));
        return;
      }
      if (dt > budget * 1.35) { slow++; quick = 0; }
      else { slow = 0; if (dt < budget * 1.15) quick++; }
      if (slow > 12) {
        /* Shed the cheapest thing first. The liquid background is decoration —
           several large blurred layers the compositor fills every frame — while
           pixel ratio is the phone's legibility. Drop the background before
           softening the product shot, and only reduce resolution if that wasn't
           enough. Restores in reverse order once frames are healthy again. */
        if (!bgShed && liquidRef.current) {
          bgShed = true; liquidRef.current.style.display = 'none';
          slow = 0; quick = 0;
        } else if (curPr > minPr) {
          curPr = Math.max(minPr, curPr - 0.25); slow = 0; quick = 0; applyPr();
        }
      } else if (quick > 240) {
        if (curPr < maxPr) {
          curPr = Math.min(maxPr, curPr + 0.25); slow = 0; quick = 0; applyPr();
        } else if (bgShed && liquidRef.current) {
          bgShed = false; liquidRef.current.style.display = '';
          slow = 0; quick = 0;
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
        eachMaterial(m => {
          const im = m.map && m.map.image;
          if (im && (im.width || im.videoWidth)) any = true;
        });
        if (any || performance.now() - t0 > 7000) return res();
        setTimeout(poll, 80);
      };
      poll();
    });
    const handOver = () => {
      if (disposed) return;
      try { phone.renderAt(0); } catch (e) {}
      requestAnimationFrame(() => requestAnimationFrame(() => {
        if (disposed) return;
        setRevealed(true);
        bootDone();
      }));
    };
    Promise.race([
      Promise.resolve().then(() => phone.ready()).catch(() => {}),
      firstTextureUp(),
    ]).then(handOver, handOver);

    /* A WebGL context can be dropped while the tour sits offscreen — routine on
       phones under memory pressure. Nothing repainted the canvas afterwards, so
       scrolling back up landed on a dead black rectangle. Put the poster back, and
       take it down again if the browser restores the context. */
    let lost = false;
    const glCanvas = phone.renderer && phone.renderer.domElement;
    /* preventDefault is what makes the loss recoverable at all. Stop the loop while
       it is gone: every renderAt into a lost context throws, which at 60fps is its
       own problem. The poster comes back up in the meantime. */
    const onLost = ev => {
      ev.preventDefault();
      lost = true;
      stop();
      setRevealed(false);
    };
    const onRestored = () => {
      lost = false;
      try { phone.renderAt(cur); } catch (e) {}
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
          container: liquidRef.current, color: accentColor,
          rate: mobile ? 0.055 : 0.028, intensity: mobile ? 0.55 : 0.42,
        });
      } catch (e) { liquid = null; }
    }

    let frameN = 0;
    const tick = () => {
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
      try { phone.renderAt(cur); } catch (e) {}
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

      const { i, vis } = panelStateFor(p);
      const gate = vis * (1 - introVis);
      for (let k = 0; k < N_SCENES; k++) {
        const v = k === i ? gate : 0;
        const card = cardRefs.current[k], chip = chipRefs.current[k];
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

      raf = requestAnimationFrame(tick);
    };

    /* Run only while the tour is near the viewport. Before this the phone rendered
       continuously from the moment it loaded — so scrolling back up to the hero left
       a WebGL renderer and a stack of blurred liquid layers pinning the GPU for a
       page that showed neither, until the browser gave up and dropped the context:
       a black rectangle on the way back down, and a page janky throughout. One
       viewport of margin keeps it warm slightly before it is visible. */
    let running = false;
    const start = () => {
      if (running || disposed || lost) return;
      running = true; snap = true;
      raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      if (!running) return;
      running = false;
      cancelAnimationFrame(raf);
    };
    let near = false;
    const vis = new IntersectionObserver(es => {
      near = es.some(e => e.isIntersecting);
      if (near && !document.hidden) start(); else stop();
    }, { rootMargin: '100% 0px 100% 0px' });
    vis.observe(wrapRef.current);
    const onVisibility = () => {
      if (document.hidden) stop();
      else if (near) start();
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      disposed = true;
      stop();
      vis.disconnect();
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
      try { phone.pause(); } catch (e) {}
      try { phone.dispose(); } catch (e) {}
      try { if (liquid) liquid.dispose(); } catch (e) {}
    };
  }, [deps, mobile, accentColor, stageGloss]);

  const totalVh = N_SCENES * P_END * VH_PER_SCREEN + 40;

  return (
    <section ref={wrapRef} id="tour" style={{ height: `${totalVh}vh`, position: 'relative', overflow: 'visible', background: 'transparent' }}>
      <div ref={stickyRef} className="stage-vp" style={{ position: 'sticky', top: 0, overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: `radial-gradient(52% 40% at 50% 46%, ${accentColor}14 0%, rgba(0,0,0,0) 68%)`,
        }} />

        <div ref={liquidRef} aria-hidden="true" style={{
          position: 'absolute', inset: '-8%', overflow: 'hidden',
          opacity: mobile ? 0.7 : 0.5, pointerEvents: 'none',
        }} />

        <div className="stage-3d" style={{ position: 'absolute', inset: 0 }}>
          <div ref={canvasRef} style={{ position: 'absolute', inset: 0, transform: mobile ? 'translateY(-6%)' : 'none' }} />
        </div>

        {/* Always present, not only on failure: the same still the static
            placeholder in index.html paints, held over the canvas until a textured
            frame is up. So the tour is never a black void — not on a slow link, a
            lost context, or an outright failure. Same JPEG as the phone's first
            texture, so it costs no extra bytes. */}
        <div className="stage-poster" style={{ opacity: revealed && !failed ? 0 : 1 }}>
          <img src={screens[0]} alt="Althea app" decoding="async" />
        </div>

        {STAGE_SCENES.map((s, i) => (
          <GlassPanel key={s.n} scene={s} mobile={mobile} accent={accentColor}
            cardRef={el => { cardRefs.current[i] = el; }}
            chipRef={el => { chipRefs.current[i] = el; }} />
        ))}

        {!mobile && STAGE_INTERLUDES.map((s, i) => (
          <InterludePanel key={s.n} scene={s}
            cardRef={el => { interRefs.current[i] = el; }} />
        ))}

        <div ref={introRef} style={{
          position: 'absolute', inset: 0, display: 'grid',
          gridTemplateRows: 'auto 1fr auto', justifyItems: 'center',
          padding: mobile ? '14px 0 max(80px, calc(env(safe-area-inset-bottom, 0px) + 80px))' : '24px 0 6vh',
          textAlign: 'center',
        }}>
          <h2 ref={introTitleRef} style={{
            fontSize: mobile ? 'clamp(22px, 6.2vw, 29px)' : 'clamp(28px, 3.4vw, 43px)',
            lineHeight: 1.14, color: '#EFF4F3',
            margin: mobile ? '0 16px' : '0 20px',
            maxWidth: 'none',
            /* Desktop holds it on one line: the vw-based size means the line scales
               with the window, so it never overflows above the 860px breakpoint. */
            whiteSpace: mobile ? 'normal' : 'nowrap',
            textShadow: '0 2px 20px rgba(0,0,0,0.5)',
          }}>{(subline || '').split(/(GLP-1)/).map((part, i) => (
            <span key={i} style={{ fontWeight: part === 'GLP-1' ? 600 : 500 }}>{part}</span>
          ))}</h2>
          {/* Pinned to the stage viewport like the mobile scene panels, so a short
              browser window can never push it below the fold on load. */}
          <div ref={introCtaRef} style={{
            ...glassShell, borderRadius: 24, padding: mobile ? '16px 20px' : '18px 28px',
            position: 'absolute',
            /* Mobile keeps it docked low over the phone; desktop sits beside the
               phone, vertically centred on the device, clear of the render. */
            left: mobile ? 16 : 'auto',
            /* Same inset rule as the scene GlassPanels: pinned to the 1132px content
               column so it sits just off the phone, falling back to a 24px edge
               inset on narrower screens. */
            right: mobile ? 16 : 'max(16px, calc(50% - 566px))',
            marginInline: mobile ? 'auto' : 0,
            bottom: mobile
              ? 'max(26px, calc(env(safe-area-inset-bottom, 0px) + 26px))'
              : 'auto',
            top: mobile ? 'auto' : '50%',
            transform: mobile ? 'none' : 'translateY(-50%)',
            width: 'fit-content',
            maxWidth: mobile ? 'calc(100% - 32px)' : 'min(420px, calc(100% - 32px))',
            background: 'rgba(255,255,255,0.045)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}><AppStoreBadge dark={false} href={appStoreUrl} /></div>
            <div style={{ marginTop: 14, paddingTop: 13, borderTop: '1px solid rgba(255,255,255,0.10)' }}>
              <AppStoreStars />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { ScrollStage, STAGE_SCENES, GlassPanel, AppStoreStars, PHONE_SCREEN_SETS });
