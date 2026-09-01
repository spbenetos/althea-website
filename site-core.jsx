// site-core.jsx — shared primitives for the landing page.
// Context, scroll reveal, viewport helper and brand marks. Everything the
// dark scroll-tour page (site-dark / site-scrollstage / site-scrollhint /
// site-video-app) needs from the old section library lives here.

/* ── Animation context ──────────────────────────────────────────────────── */
const AnimContext = React.createContext({
  animChartDraw: true,
  animCountUp: true,
  animProgressRail: true,
  animHeroParallax: true,
});
window.AnimContext = AnimContext;

/* ── Tweaks context ─────────────────────────────────────────────────────── */
const TweaksContext = React.createContext({
  accentColor: '#2AB5A2',
  headline: 'Track every dose.\nSee every result.',
  subline: 'The companion app for your GLP-1 medication journey — dose logging, weight tracking, and side effect monitoring in one place.',
  appStoreUrl: '#',
  trialDays: 7,
});
window.TweaksContext = TweaksContext;

/* ── Scroll reveal ──────────────────────────────────────────────────────── */
function RevealOnScroll({ children, delay = 0, from = 'bottom' }) {
  const ref = React.useRef(null);
  const [vis, setVis] = React.useState(false);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight + 40) { setVis(true); return; }
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } },
      { threshold: 0.08, rootMargin: '0px 0px -32px 0px' }
    );
    obs.observe(el);
    const t = setTimeout(() => { setVis(true); obs.disconnect(); }, 800);
    return () => { obs.disconnect(); clearTimeout(t); };
  }, []);
  const hidden = from === 'bottom' ? 'translateY(28px)' : from === 'left' ? 'translateX(-28px)' : 'translateX(28px)';
  return (
    <div ref={ref} style={{
      opacity: vis ? 1 : 0,
      transform: vis ? 'none' : hidden,
      transition: `opacity 0.7s cubic-bezier(.22,1,.36,1) ${delay}s, transform 0.7s cubic-bezier(.22,1,.36,1) ${delay}s`,
    }}>
      {children}
    </div>
  );
}

/* ── useIsMobile ────────────────────────────────────────────────────────── */
function useIsMobile(bp = 768) {
  const [m, setM] = React.useState(window.innerWidth < bp);
  React.useEffect(() => {
    const fn = () => setM(window.innerWidth < bp);
    window.addEventListener('resize', fn, { passive: true });
    return () => window.removeEventListener('resize', fn);
  }, [bp]);
  return m;
}

/* ── Brand ──────────────────────────────────────────────────────────────── */
function AltheaLogo({ size = 32 }) {
  return <img src="app-icon.png" alt="Althea" width={size} height={size}
    style={{ borderRadius: Math.round(size * 0.22), display: 'block', flexShrink: 0 }} />;
}

function AppStoreBadge({ dark = true, size = 'md', compact = false }) {
  const { appStoreUrl, accentColor } = React.useContext(TweaksContext);
  const bg = dark ? '#000' : '#fff';
  const fg = dark ? '#fff' : '#000';
  const border = dark ? 'none' : '1.5px solid rgba(0,0,0,0.12)';
  if (compact) {
    return (
      <a href={appStoreUrl} style={{
        display: 'inline-flex', alignItems: 'center', gap: 7,
        background: bg, color: fg, border, borderRadius: 11,
        padding: '8px 15px 8px 13px', textDecoration: 'none', flexShrink: 0,
      }}>
        <svg width="15" height="18" viewBox="0 0 22 26" fill={fg}>
          <path d="M18.07 13.62c-.03-3.1 2.53-4.6 2.65-4.67-1.44-2.11-3.69-2.4-4.49-2.43-1.91-.2-3.73 1.12-4.7 1.12-.97 0-2.47-1.1-4.06-1.07-2.09.03-4.01 1.21-5.09 3.08-2.17 3.77-.56 9.36 1.56 12.42 1.03 1.5 2.27 3.18 3.89 3.12 1.56-.06 2.15-1.01 4.04-1.01 1.89 0 2.42 1.01 4.07.98 1.68-.03 2.74-1.53 3.76-3.03 1.19-1.74 1.68-3.42 1.71-3.51-.04-.02-3.28-1.26-3.34-5z"/>
          <path d="M14.95 4.27c.86-1.04 1.44-2.48 1.28-3.92-1.24.05-2.74.82-3.63 1.86-.79.92-1.49 2.38-1.3 3.79 1.38.11 2.79-.7 3.65-1.73z"/>
        </svg>
        <span style={{ fontSize: 14, fontWeight: 650, letterSpacing: '-0.01em' }}>Get</span>
      </a>
    );
  }
  const pad = size === 'lg' ? '12px 24px 12px 20px' : '10px 20px 10px 16px';
  const iconSz = size === 'lg' ? 26 : 22;
  const titleSz = size === 'lg' ? 19 : 17;
  return (
    <a href={appStoreUrl} style={{
      display: 'inline-flex', alignItems: 'center', gap: 10,
      background: bg, color: fg, border, borderRadius: 14,
      padding: pad, textDecoration: 'none',
      transition: 'transform 0.18s ease, box-shadow 0.18s ease',
    }}
    onMouseEnter={e => { e.currentTarget.style.transform='scale(1.03)'; e.currentTarget.style.boxShadow='0 6px 20px rgba(0,0,0,0.14)'; }}
    onMouseLeave={e => { e.currentTarget.style.transform='scale(1)'; e.currentTarget.style.boxShadow='none'; }}>
      <svg width={iconSz} height={iconSz * 1.18} viewBox="0 0 22 26" fill={fg}>
        <path d="M18.07 13.62c-.03-3.1 2.53-4.6 2.65-4.67-1.44-2.11-3.69-2.4-4.49-2.43-1.91-.2-3.73 1.12-4.7 1.12-.97 0-2.47-1.1-4.06-1.07-2.09.03-4.01 1.21-5.09 3.08-2.17 3.77-.56 9.36 1.56 12.42 1.03 1.5 2.27 3.18 3.89 3.12 1.56-.06 2.15-1.01 4.04-1.01 1.89 0 2.42 1.01 4.07.98 1.68-.03 2.74-1.53 3.76-3.03 1.19-1.74 1.68-3.42 1.71-3.51-.04-.02-3.28-1.26-3.34-5z"/>
        <path d="M14.95 4.27c.86-1.04 1.44-2.48 1.28-3.92-1.24.05-2.74.82-3.63 1.86-.79.92-1.49 2.38-1.3 3.79 1.38.11 2.79-.7 3.65-1.73z"/>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
        <span style={{ fontSize: 10, fontWeight: 400, opacity: 0.8 }}>Download on the</span>
        <span style={{ fontSize: titleSz, fontWeight: 650, letterSpacing: '-0.01em', marginTop: 2 }}>App Store</span>
      </div>
    </a>
  );
}

Object.assign(window, { AnimContext, TweaksContext, RevealOnScroll, useIsMobile, AltheaLogo, AppStoreBadge });
