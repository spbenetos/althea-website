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
  { n: '03', kicker: 'Nutrition', title: 'Food, without the friction',
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
  const canvasRef = React.useRef(null);
  const liquidRef = React.useRef(null);
  const introRef = React.useRef(null);
  const cardRefs = React.useRef([]);
  const chipRefs = React.useRef([]);
  const [failed, setFailed] = React.useState(false);

  React.useEffect(() => {
    if (typeof window.Phone3D === 'undefined') { setFailed(true); return; }
    let phone, raf = 0, disposed = false;
    try {
      phone = window.Phone3D.createPhoneScene({
        container: canvasRef.current,
        screens: PHONE_SCREENS,
        dwell: DWELL,
        frontSwing: FRONT_SWING,
        smoothing: 0.12,
        fill: mobile ? 0.676 : 0.80,
      });
    } catch (e) { setFailed(true); return; }
    window.__stage = phone;

    /* The phone module caps the render at 2× device pixels; on a 3× display that
       renders the screenshots at two thirds native and lets the browser upscale.
       Desktop can afford the real ratio. */
    if (!mobile && (window.devicePixelRatio || 1) > 2) {
      try {
        phone.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 3));
        const el = canvasRef.current;
        phone.renderer.setSize(el.clientWidth, el.clientHeight, false);
      } catch (e) {}
    }

    let liquid = null;
    if (typeof window.createLiquidLayer === 'function' && liquidRef.current) {
      try {
        liquid = window.createLiquidLayer({
          container: liquidRef.current, color: accentColor,
          rate: 0.055, intensity: mobile ? 0.32 : 0.40,
        });
      } catch (e) { liquid = null; }
    }

    const tick = () => {
      const el = wrapRef.current;
      if (!el || disposed) return;
      const r = el.getBoundingClientRect();
      const span = r.height - window.innerHeight;
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
      try { phone.dispose(); } catch (e) {}
      try { if (liquid) liquid.dispose(); } catch (e) {}
    };
  }, [mobile, accentColor]);

  const totalVh = N_SCENES * P_END * VH_PER_SCREEN + 40;

  return (
    <section ref={wrapRef} id="tour" style={{ height: `${totalVh}vh`, position: 'relative', overflow: 'visible', background: 'transparent' }}>
      <div style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: `radial-gradient(52% 40% at 50% 46%, ${accentColor}14 0%, rgba(0,0,0,0) 68%)`,
        }} />

        <div ref={liquidRef} aria-hidden="true" style={{
          position: 'absolute', inset: '-8%', overflow: 'hidden',
          filter: 'blur(16px) saturate(115%)', opacity: 0.55,
          mixBlendMode: 'screen', pointerEvents: 'none',
        }} />

        <div ref={canvasRef} style={{ position: 'absolute', inset: 0, transform: mobile ? 'translateY(-1.5%)' : 'none' }} />

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
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'space-between',
          padding: mobile ? '20px 0 30px' : '24px 0 6vh', textAlign: 'center',
        }}>
          <h1 style={{
            fontSize: mobile ? 'clamp(26px, 7.4vw, 34px)' : 'clamp(38px, 4.6vw, 58px)',
            lineHeight: 1.08, color: '#EFF4F3', margin: '0 20px',
            textShadow: '0 2px 20px rgba(0,0,0,0.5)',
          }}>{(headline || '').split('\n').map((l, i) => <React.Fragment key={i}>{l}<br /></React.Fragment>)}</h1>
          <div style={{
            ...glassShell, borderRadius: 24, padding: mobile ? '16px 20px' : '18px 28px',
            margin: '0 20px', maxWidth: mobile ? 'none' : 420,
            background: 'rgba(255,255,255,0.045)',
          }}>
            <p style={{ fontSize: mobile ? 14.5 : 16, color: 'rgba(239,244,243,0.66)', margin: '0 0 14px', textWrap: 'pretty' }}>{subline}</p>
            <div style={{ display: 'flex', justifyContent: 'center' }}><AppStoreBadge dark={false} href={appStoreUrl} /></div>
          </div>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { ScrollStage, STAGE_SCENES, GlassPanel, PHONE_SCREENS });
