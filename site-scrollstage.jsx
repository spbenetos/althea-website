// site-scrollstage.jsx — scroll-driven rotating iPhone (real 3D, from althea-phone-3d)
// Requires vendor/phone3d.bundle.js (global Phone3D) loaded before this file.

const PHONE_SCREENS = [
  'screens/screen-1.jpg',  // home — weight + medication level graphs
  'screens/screen-2.jpg',  // progress / insights
  'screens/screen-3.jpg',  // nutrition
  'screens/screen-4.jpg',  // symptom logging
  'screens/screen-5.jpg',  // body measurements
  'screens/screen-6.jpg',  // PDF report for doctors
];

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

function ScrollStage() {
  const mobile = useIsMobile(860);
  const { accentColor, headline, subline, appStoreUrl } = React.useContext(TweaksContext);
  const wrapRef = React.useRef(null);
  const stickyRef = React.useRef(null);
  const canvasRef = React.useRef(null);
  const liquidRef = React.useRef(null);
  const introRef = React.useRef(null);
  const cardRefs = React.useRef([]);
  const chipRefs = React.useRef([]);
  const [failed, setFailed] = React.useState(false);

  React.useEffect(() => {
    const bootDone = () => window.dispatchEvent(new Event('althea:stage-ready'));
    if (typeof window.Phone3D === 'undefined') { setFailed(true); bootDone(); return; }
    let phone, raf = 0, disposed = false;
    try {
      phone = window.Phone3D.createPhoneScene({
        container: canvasRef.current,
        screens: PHONE_SCREENS,
        dwell: DWELL,
        frontSwing: FRONT_SWING,
        smoothing: 0.12,
        fill: mobile ? 0.56 : 0.62,
      });
    } catch (e) { setFailed(true); bootDone(); return; }
    window.__stage = phone;

    /* Drop clearcoat on the dark-glass materials (desktop): it's the only
       physical-only feature in use — nothing uses transmission — so killing it
       removes the clearcoat shader chunks and roughly halves fragment cost.
       Compensate with tighter roughness + stronger env reflections. */
    const maxAniso = (() => {
      try { return phone.renderer.capabilities.getMaxAnisotropy(); } catch (e) { return 8; }
    })();
    const eachMaterial = fn => {
      phone.phone.traverse(o => {
        if (!o.material) return;
        (Array.isArray(o.material) ? o.material : [o.material]).forEach(fn);
      });
    };
    if (!mobile) {
      eachMaterial(m => {
        if (m.clearcoat > 0) {
          m.clearcoat = 0;
          m.roughness = Math.max(0.02, m.roughness * 0.8);
          m.envMapIntensity = (m.envMapIntensity == null ? 1 : m.envMapIntensity) * 1.14;
          m.needsUpdate = true;
        }
      });
    }

    /* The stage swaps the screenshot texture per scene, so anisotropy has to be
       re-applied as maps change — sampled obliquely mid-rotation this is the
       single biggest sharpness lever, and it costs almost nothing. */
    const sharpenMaps = () => eachMaterial(m => {
      if (m.map && m.map.anisotropy !== maxAniso) {
        m.map.anisotropy = maxAniso;
        m.map.needsUpdate = true;
      }
    });
    sharpenMaps();

    /* Adaptive resolution. A fixed guess can't work: the screenshot is 2622px tall
       but the on-screen phone is only ~600-800px, so more pixel ratio keeps adding
       real detail well past 2× — while the ceiling that holds 60fps depends on the
       GPU. So start high and let measured frame time settle it. */
    const maxPr = Math.min(window.devicePixelRatio || 1, mobile ? 2 : 3);
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
    let budget = 0;
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
      if (slow > 12 && curPr > 1.25) {
        curPr = Math.max(1.25, curPr - 0.25); slow = 0; quick = 0; applyPr();
      } else if (quick > 240 && curPr < maxPr) {
        curPr = Math.min(maxPr, curPr + 0.25); slow = 0; quick = 0; applyPr();
      }
    };
    applyPr();
    window.addEventListener('resize', fitPixelRatio);

    /* Hold the static boot frame until every screenshot texture is decoded and one
       real frame is on screen, then hand over — so the stage is never seen empty
       or half-textured, and the page is never scrollable into a dead zone. */
    const signalReady = bootDone;
    try {
      const r = phone.ready();
      if (r && typeof r.then === 'function') {
        r.then(() => {
          phone.renderAt(0);
          requestAnimationFrame(() => requestAnimationFrame(signalReady));
        }).catch(signalReady);
      } else signalReady();
    } catch (e) { signalReady(); }

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
      if (!el || disposed) return;
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
      phone.setProgress(p);
      if (liquid) liquid.setProgress(raw);

      const introVis = 1 - stageSmooth(0, INTRO_FADE, p);
      if (introRef.current) {
        introRef.current.style.opacity = introVis;
        introRef.current.style.transform = `translateY(${(1 - introVis) * -22}px)`;
        introRef.current.style.pointerEvents = introVis > 0.4 ? 'auto' : 'none';
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
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', fitPixelRatio);
      try { phone.dispose(); } catch (e) {}
      try { if (liquid) liquid.dispose(); } catch (e) {}
    };
  }, [mobile, accentColor]);

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

        {failed && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <img src={PHONE_SCREENS[0]} alt="Althea app" style={{
              height: mobile ? '54vh' : '76vh', borderRadius: 34, border: '9px solid #0B0E11',
              boxShadow: '0 40px 70px -24px rgba(0,0,0,0.7)',
            }} />
          </div>
        )}

        {STAGE_SCENES.map((s, i) => (
          <GlassPanel key={s.n} scene={s} mobile={mobile} accent={accentColor}
            cardRef={el => { cardRefs.current[i] = el; }}
            chipRef={el => { chipRefs.current[i] = el; }} />
        ))}

        <div ref={introRef} style={{
          position: 'absolute', inset: 0, display: 'grid',
          gridTemplateRows: 'auto 1fr auto', justifyItems: 'center',
          padding: mobile ? '14px 0 max(80px, calc(env(safe-area-inset-bottom, 0px) + 80px))' : '24px 0 6vh',
          textAlign: 'center',
        }}>
          <h1 style={{
            fontSize: mobile ? 'clamp(22px, 6.2vw, 29px)' : 'clamp(28px, 3.4vw, 43px)',
            lineHeight: 1.14, color: '#EFF4F3',
            margin: mobile ? '0 16px' : '0 20px',
            maxWidth: mobile ? 'none' : 'min(1000px, 88vw)',
            textShadow: '0 2px 20px rgba(0,0,0,0.5)',
          }}>{(subline || '').split(/(GLP-1)/).map((part, i) => (
            <span key={i} style={{ fontWeight: part === 'GLP-1' ? 600 : 500 }}>{part}</span>
          ))}</h1>
          <div style={{
            ...glassShell, borderRadius: 24, padding: mobile ? '16px 20px' : '18px 28px',
            margin: '0 20px', maxWidth: mobile ? 'none' : 420,
            gridRow: 3, background: 'rgba(255,255,255,0.045)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}><AppStoreBadge dark={false} href={appStoreUrl} /></div>
          </div>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { ScrollStage, STAGE_SCENES, GlassPanel, PHONE_SCREENS });
