// site-sections.jsx — Althea landing page v2 — complete redesign

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

function AppStoreBadge({ dark = true, size = 'md' }) {
  const { appStoreUrl, accentColor } = React.useContext(TweaksContext);
  const pad = size === 'lg' ? '12px 24px 12px 20px' : '10px 20px 10px 16px';
  const iconSz = size === 'lg' ? 26 : 22;
  const titleSz = size === 'lg' ? 19 : 17;
  const bg = dark ? '#000' : '#fff';
  const fg = dark ? '#fff' : '#000';
  const border = dark ? 'none' : '1.5px solid rgba(0,0,0,0.12)';
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

/* ═══════════════════════════════════════════════════════════════════════════
   NAV BAR
   ═══════════════════════════════════════════════════════════════════════════ */
function NavBar() {
  const [scrolled, setScrolled] = React.useState(false);
  const mobile = useIsMobile(640);
  React.useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 32);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);
  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled ? 'rgba(255,255,255,0.9)' : 'transparent',
      backdropFilter: scrolled ? 'blur(20px) saturate(1.8)' : 'none',
      WebkitBackdropFilter: scrolled ? 'blur(20px) saturate(1.8)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(0,0,0,0.07)' : '1px solid transparent',
      transition: 'all 0.3s ease',
    }}>
      <div style={{
        maxWidth: 1160, margin: '0 auto', padding: '0 24px',
        height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <a href="index.html" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <AltheaLogo size={34} />
          <span style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.03em', color: '#0D1117' }}>Althea</span>
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: mobile ? 12 : 32 }}>
          {!mobile && <>
            <a href="#features" style={{ fontSize: 14, fontWeight: 500, color: '#5F6B7A', textDecoration: 'none' }}>Features</a>
            <a href="#pricing" style={{ fontSize: 14, fontWeight: 500, color: '#5F6B7A', textDecoration: 'none' }}>Pricing</a>
            <a href="#faq" style={{ fontSize: 14, fontWeight: 500, color: '#5F6B7A', textDecoration: 'none' }}>FAQ</a>
          </>}
          <AppStoreBadge dark size="sm" />
        </div>
      </div>
    </nav>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   HERO
   ═══════════════════════════════════════════════════════════════════════════ */
function HeroSection() {
  const mobile = useIsMobile();
  const { accentColor, headline, subline, trialDays } = React.useContext(TweaksContext);
  const lines = headline.split('\n');
  return (
    <section style={{
      paddingTop: mobile ? 100 : 120,
      paddingBottom: 0,
      background: 'linear-gradient(180deg, #EDF8F6 0%, #F5FBFA 40%, #fff 75%)',
      overflowX: 'clip',
    }}>
      {/* Text */}
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
        <RevealOnScroll delay={0.07}>
          <h1 style={{
            fontSize: mobile ? 'clamp(34px, 9vw, 44px)' : 'clamp(48px, 6vw, 72px)',
            fontWeight: 800, lineHeight: 1.06, letterSpacing: '-0.04em',
            color: '#0D1117', marginBottom: 20,
            textWrap: 'balance',
          }}>
            {lines.map((line, i) => (
              <React.Fragment key={i}>{line}{i < lines.length - 1 && <br />}</React.Fragment>
            ))}
          </h1>
        </RevealOnScroll>

        <RevealOnScroll delay={0.12}>
          <p style={{
            fontSize: mobile ? 17 : 19, lineHeight: 1.65, color: '#4A5568',
            maxWidth: 520, margin: '0 auto 32px', textWrap: 'pretty',
          }}>
            {subline}
          </p>
        </RevealOnScroll>

        <RevealOnScroll delay={0.17}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <AppStoreBadge dark size="lg" />
            <span style={{ fontSize: 13, color: '#8896A5' }}>Free {trialDays}-day trial · No commitment</span>
          </div>
        </RevealOnScroll>
      </div>

      {/* Phones */}
      <RevealOnScroll delay={0.22}>
        <div style={{
          display: 'flex', justifyContent: 'center', alignItems: 'flex-end',
          gap: mobile ? 10 : 20,
          marginTop: mobile ? 32 : 32,
          padding: '34px 24px 0',
          overflow: 'hidden',
        }}>
          {!mobile && (
            <ParallaxPhone id="hero-left" scale={0.52} speed={0.06} baseMargin={-40} />
          )}
          <ParallaxPhone id="hero-center" scale={mobile ? 0.72 : 0.60} speed={mobile ? 0 : 0.02} baseMargin={mobile ? 12 : 28} />
          {!mobile && (
            <ParallaxPhone id="hero-right" scale={0.52} speed={0.1} baseMargin={-80} />
          )}
        </div>
      </RevealOnScroll>
    </section>
  );
}

/* ParallaxPhone — wraps a PhoneFrame with scroll-linked drift */
function ParallaxPhone({ id, scale, speed, baseMargin }) {
  const [ref, y] = useParallax(speed);
  return (
    <div ref={ref} style={{ marginBottom: baseMargin, transform: `translateY(${y}px)`, willChange: 'transform' }}>
      <PhoneFrame id={id} scale={scale} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   IMPACT BAND — life-years saved
   ═══════════════════════════════════════════════════════════════════════════ */
function ImpactBand() {
  const mobile = useIsMobile(640);
  const { accentColor } = React.useContext(TweaksContext);
  return (
    <section style={{
      padding: mobile ? '4px 0 40px' : '8px 0 52px',
      background: 'linear-gradient(180deg, #fff 0%, #F0FAF8 100%)',
      textAlign: 'center', overflow: 'hidden', position: 'relative',
    }}>
      <div style={{ position: 'absolute', inset: 0 }}>
        <RisingBars color={accentColor} />
      </div>
      <div style={{ maxWidth: 820, margin: '0 auto', padding: '0 24px', position: 'relative' }}>
        <RevealOnScroll>
          <div style={{
            fontSize: 11.5, fontWeight: 700, letterSpacing: '0.12em',
            textTransform: 'uppercase', color: accentColor, marginBottom: 10,
          }}>Our community's impact</div>
        </RevealOnScroll>
        <RevealOnScroll delay={0.06}>
          <div style={{
            fontSize: mobile ? 'clamp(48px, 15vw, 64px)' : 'clamp(64px, 8vw, 96px)',
            fontWeight: 800, letterSpacing: '-0.05em', lineHeight: 0.95,
            color: '#0D1117',
          }}>
            <CountUp value={128940} duration={2200} style={{
              background: `linear-gradient(120deg, ${accentColor}, #1A8A7A)`,
              WebkitBackgroundClip: 'text', backgroundClip: 'text',
              WebkitTextFillColor: 'transparent', color: 'transparent',
            }} />
          </div>
        </RevealOnScroll>
        <RevealOnScroll delay={0.12}>
          <div style={{
            fontSize: mobile ? 17 : 20, fontWeight: 750, letterSpacing: '-0.02em',
            color: '#0D1117', marginTop: 4,
          }}>life-years gained</div>
        </RevealOnScroll>
        <RevealOnScroll delay={0.18}>
          <p style={{
            fontSize: mobile ? 14.5 : 15.5, lineHeight: 1.6, color: '#4A5568',
            maxWidth: 480, margin: '12px auto 0', textWrap: 'pretty',
            background: 'radial-gradient(ellipse 90% 130% at 50% 50%, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.6) 55%, transparent 100%)',
            borderRadius: 24, padding: '10px 18px',
          }}>
            Every kilogram lost adds healthy time to your life. Together, people tracking with Althea have reclaimed over a hundred thousand years of it.
          </p>
        </RevealOnScroll>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   TRUST BAR
   ═══════════════════════════════════════════════════════════════════════════ */
function TrustBar() {
  const mobile = useIsMobile(640);
  return (
    <div style={{
      background: '#fff', borderTop: '1px solid rgba(0,0,0,0.06)',
      borderBottom: '1px solid rgba(0,0,0,0.06)',
    }}>
      <div style={{
        maxWidth: 1160, margin: '0 auto', padding: mobile ? '20px 20px' : '0 24px',
        height: mobile ? 'auto' : 64,
        display: mobile ? 'grid' : 'flex',
        gridTemplateColumns: mobile ? '1fr 1fr' : undefined,
        alignItems: 'center', justifyContent: 'center',
        gap: mobile ? '16px 16px' : 0,
      }}>
        {[
          {
            icon: (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <rect x="5" y="11" width="14" height="10" rx="2.5" stroke="#2AB5A2" strokeWidth="1.8"/>
                <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="#2AB5A2" strokeWidth="1.8" strokeLinecap="round"/>
                <circle cx="12" cy="16" r="1.5" fill="#2AB5A2"/>
                <line x1="12" y1="17.5" x2="12" y2="19.2" stroke="#2AB5A2" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            ),
            label: 'Private by design',
          },
          {
            icon: (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <rect x="9" y="3" width="6" height="16" rx="3" stroke="#2AB5A2" strokeWidth="1.7"/>
                <rect x="10.5" y="7" width="3" height="5" rx="0.5" fill="#2AB5A2" opacity="0.35"/>
                <line x1="12" y1="19" x2="12" y2="22" stroke="#2AB5A2" strokeWidth="1.6" strokeLinecap="round"/>
                <circle cx="12" cy="3.5" r="1.5" fill="#2AB5A2"/>
              </svg>
            ),
            label: '16+ medications',
          },
          {
            icon: (
              <svg width="22" height="22" viewBox="0 0 24 24">
                <polygon points="12,2 15.1,8.3 22,9.3 17,14.1 18.2,21 12,17.8 5.8,21 7,14.1 2,9.3 8.9,8.3" fill="#2AB5A2"/>
              </svg>
            ),
            label: 'Built by doctors',
          },
          {
            icon: (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M2 12h4l2-5 3 10 2-7 2 4h7" stroke="#2AB5A2" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ),
            label: '...for patients',
          },
        ].map((item, i, arr) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            flex: mobile ? 'unset' : 1,
            justifyContent: mobile ? 'flex-start' : 'center',
            padding: mobile ? '0' : '0 20px',
            borderRight: (!mobile && i < arr.length - 1) ? '1px solid rgba(0,0,0,0.08)' : 'none',
          }}>
            <span style={{ flexShrink: 0, display: 'flex' }}>{item.icon}</span>
            <span style={{ fontSize: 13.5, fontWeight: 500, color: '#4A5568', whiteSpace: mobile ? 'normal' : 'nowrap' }}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE PILLARS
   ═══════════════════════════════════════════════════════════════════════════ */
function FeaturePillarsSection() {
  const pillars = [
    {
      color: '#2AB5A2',
      icon: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2AB5A2" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2.5s5.5 6 5.5 10.5a5.5 5.5 0 0 1-11 0C6.5 8.5 12 2.5 12 2.5z"/>
          <line x1="12" y1="9.5" x2="12" y2="15.5"/>
          <line x1="9" y1="12.5" x2="15" y2="12.5"/>
        </svg>
      ),
      title: 'Dose Tracking',
      desc: 'Log every injection with one tap. Automatic site rotation, personalised reminders, and real-time drug level curves.',
    },
    {
      color: '#2AB5A2',
      icon: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2AB5A2" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="5"/>
          <path d="M8.5 15.5a4 4 0 0 1 7-2.6"/>
          <line x1="12" y1="15.5" x2="14.6" y2="11.8"/>
          <circle cx="12" cy="7" r="0.6" fill="#2AB5A2"/>
        </svg>
      ),
      title: 'Weight Progress',
      desc: 'Tap to log, watch the trend. Milestone charts, goal tracking, and doctor-ready PDF reports in seconds.',
    },
    {
      color: '#2AB5A2',
      icon: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2AB5A2" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 20.5S4.5 15.5 4.5 9.8A3.8 3.8 0 0 1 12 8a3.8 3.8 0 0 1 7.5 1.8c0 5.7-7.5 10.7-7.5 10.7z"/>
          <path d="M7.5 11h2l1-1.7 1.6 3.2 1-1.5H15"/>
        </svg>
      ),
      title: 'Side Effect Log',
      desc: 'Quick-tap symptom chips with severity scoring. See patterns emerge and bring real data to every appointment.',
    },
    {
      color: '#2AB5A2',
      icon: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2AB5A2" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2.5" y="8" width="19" height="8" rx="4" transform="rotate(45 12 12)"/>
          <line x1="9.2" y1="9.2" x2="14.8" y2="14.8"/>
        </svg>
      ),
      title: 'GLP-1 Drug Library',
      desc: 'In-depth profiles for 16+ medications — Retatrutide, Ozempic, Wegovy, Mounjaro, Zepbound and more — with dosing schedules and PK curves.',
    },
    {
      color: '#2AB5A2',
      icon: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2AB5A2" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8.5a6 6 0 0 0-12 0c0 6.5-2.5 8.5-2.5 8.5h17S18 15 18 8.5z"/>
          <path d="M10.2 20.5a2.2 2.2 0 0 0 3.6 0"/>
        </svg>
      ),
      title: 'Smart Reminders',
      desc: 'Dose and appointment reminders that adapt to your schedule, so you never miss a beat in your routine.',
    },
    {
      color: '#2AB5A2',
      icon: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2AB5A2" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7.5 4h9v4.5a4.5 4.5 0 0 1-9 0V4z"/>
          <path d="M7.5 5.5H5a1.8 1.8 0 0 0 2 3M16.5 5.5H19a1.8 1.8 0 0 1-2 3"/>
          <line x1="12" y1="13" x2="12" y2="16.5"/>
          <path d="M8.5 20.5h7M9.5 20.5l.4-2.5h4.2l.4 2.5"/>
        </svg>
      ),
      title: 'Achievements',
      desc: 'Stay motivated with milestone badges, dose streaks, and gentle celebrations as your progress builds.',
    },
    {
      color: '#2AB5A2',
      icon: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2AB5A2" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6.5 3v6a2 2 0 0 0 4 0V3M8.5 11v10"/>
          <path d="M16 3c-1.6 0-2.6 2.2-2.6 5s1 4 2.6 4v9"/>
        </svg>
      ),
      title: 'Food & Water Logging',
      desc: 'Barcode scanning, macro breakdowns, and hydration goals — know exactly what is fuelling your progress.',
    },
    {
      color: '#2AB5A2',
      icon: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2AB5A2" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 3h7l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/>
          <path d="M14 3v4h4"/>
          <line x1="9" y1="13" x2="15" y2="13"/>
          <line x1="9" y1="16.5" x2="13" y2="16.5"/>
        </svg>
      ),
      title: 'Doctor-Ready Reports',
      desc: 'Export a clean PDF of your doses, weight, and side effects to share with your care team in one tap.',
    },
    {
      color: '#2AB5A2',
      icon: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2AB5A2" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 18.5a4.2 4.2 0 0 1-.3-8.4 5.6 5.6 0 0 1 10.8-1.6 3.8 3.8 0 0 1 .5 7.5"/>
          <path d="M9.5 15l2 2 3.5-4"/>
        </svg>
      ),
      title: 'Private iCloud Sync',
      desc: 'Your data stays yours — synced across your devices through your own private iCloud, never our servers.',
    },
  ];
  return (
    <section id="features" style={{ padding: '88px 0', background: '#fff' }}>
      <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 24px' }}>
        <RevealOnScroll>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{
              fontSize: 'clamp(30px, 3.5vw, 42px)', fontWeight: 750,
              letterSpacing: '-0.03em', color: '#0D1117', marginBottom: 14, lineHeight: 1.15,
            }}>Everything you need, built in</h2>
            <p style={{ fontSize: 17, color: '#4A5568', maxWidth: 440, margin: '0 auto' }}>
              One app for your entire GLP-1 journey. Scroll to explore →
            </p>
          </div>
        </RevealOnScroll>

        <div className="features-scroll" style={{
          display: 'flex', gap: 20,
          overflowX: 'auto', scrollSnapType: 'x mandatory',
          padding: '4px 4px 20px',
          margin: '0 -4px',
          WebkitOverflowScrolling: 'touch',
        }}>
          {pillars.map((p, i) => (
            <div key={i} style={{
              flex: '0 0 auto', width: 280, scrollSnapAlign: 'start',
              background: '#FAFAFA', borderRadius: 22, padding: '32px 28px',
              border: '1px solid rgba(0,0,0,0.05)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='0 8px 32px rgba(0,0,0,0.07)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none'; }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                  background: 'linear-gradient(150deg, #3FD0BC, #1F9E8C)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <div style={{ filter: 'brightness(0) invert(1)', display: 'flex', transform: 'scale(0.5)' }}>{p.icon}</div>
                </div>
                <h3 style={{ fontSize: 16.5, fontWeight: 700, color: '#0D1117', letterSpacing: '-0.02em', margin: 0 }}>{p.title}</h3>
              </div>
              <p style={{ fontSize: 15, lineHeight: 1.6, color: '#5F6B7A', margin: 0 }}>{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE DEEP DIVES
   ═══════════════════════════════════════════════════════════════════════════ */
function FeatureDeep({ reverse, bg, accentColor, tag, title, body, bullets, phoneId, delay = 0, chart = false, caption }) {
  const mobile = useIsMobile();
  return (
    <section style={{ padding: '80px 0', background: bg }}>
      <div style={{
        maxWidth: 1160, margin: '0 auto', padding: '0 24px',
        display: 'flex', alignItems: 'center', gap: 'clamp(32px, 5vw, 72px)',
        flexDirection: mobile ? 'column' : (reverse ? 'row-reverse' : 'row'),
        justifyContent: 'center',
      }}>
        {/* Text */}
        <div style={{ flex: '1 1 360px', maxWidth: 480 }}>
          <RevealOnScroll delay={delay} from={mobile ? 'bottom' : (reverse ? 'right' : 'left')}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 11.5, fontWeight: 700, letterSpacing: '0.1em',
              textTransform: 'uppercase', color: accentColor, marginBottom: 16,
            }}>
              <span style={{ width: 22, height: 2, borderRadius: 2, background: accentColor, display: 'inline-block' }}></span>
              {tag}
            </div>
            <h2 style={{
              fontSize: 'clamp(28px, 3.5vw, 40px)', fontWeight: 750,
              letterSpacing: '-0.03em', color: '#0D1117', marginBottom: 18, lineHeight: 1.15,
            }}>{title}</h2>
            <p style={{ fontSize: 16.5, lineHeight: 1.68, color: '#4A5568', marginBottom: 24, textWrap: 'pretty' }}>{body}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {bullets.map((b, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <svg width="20" height="20" viewBox="0 0 22 22" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
                    <path d="M4 11l5 5L18 6" stroke={accentColor} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span style={{ fontSize: 15, color: '#374151', lineHeight: 1.55 }}>{b}</span>
                </div>
              ))}
            </div>
            {chart && (
              <div style={{
                marginTop: 28, padding: '18px 20px 16px', background: '#fff',
                border: '1px solid rgba(0,0,0,0.06)', borderRadius: 18,
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 4, background: accentColor, display: 'inline-block' }}></span>
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: '#0D1117', letterSpacing: '0.01em' }}>Weight trend</span>
                    <span style={{ fontSize: 12, color: '#8896A5' }}>· 12 weeks</span>
                  </div>
                  <span style={{
                    fontSize: 13, fontWeight: 700, color: accentColor,
                    background: accentColor + '14', padding: '3px 10px', borderRadius: 20,
                  }}>
                    <CountUp value={9.2} decimals={1} prefix="↓ " suffix=" kg" />
                  </span>
                </div>
                <DrawChart color={accentColor} height={150} />
              </div>
            )}
          </RevealOnScroll>
        </div>

        {/* Phone */}
        <RevealOnScroll delay={delay + 0.12} from={mobile ? 'bottom' : (reverse ? 'left' : 'right')}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
            <PhoneFrame id={phoneId} scale={mobile ? 0.65 : 0.68} />
            {caption && (
              <span style={{ fontSize: 13, fontWeight: 500, color: '#8896A5', letterSpacing: '0.01em' }}>{caption}</span>
            )}
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   RESULTS BAND (count-up stats)
   ═══════════════════════════════════════════════════════════════════════════ */
function ResultsBand() {
  const mobile = useIsMobile(640);
  const stats = [
    { v: 16, suffix: '+', decimals: 0, label: 'GLP-1 medications supported' },
    { v: 94, suffix: '%', decimals: 0, label: 'Average dose adherence' },
    { v: 4.8, suffix: '', decimals: 1, label: 'App Store rating' },
  ];
  return (
    <section style={{ padding: mobile ? '56px 0' : '72px 0', background: '#0D1117' }}>
      <div style={{
        maxWidth: 1000, margin: '0 auto', padding: '0 24px',
        display: 'grid', gridTemplateColumns: mobile ? '1fr' : 'repeat(3, 1fr)',
        gap: mobile ? 32 : 24, textAlign: 'center',
      }}>
        {stats.map((s, i) => (
          <div key={i} style={{
            borderLeft: (!mobile && i > 0) ? '1px solid rgba(255,255,255,0.1)' : 'none',
          }}>
            <div style={{ fontSize: mobile ? 44 : 54, fontWeight: 800, letterSpacing: '-0.03em', color: '#fff', lineHeight: 1 }}>
              <CountUp value={s.v} suffix={s.suffix} decimals={s.decimals} />
            </div>
            <div style={{ fontSize: 14.5, color: 'rgba(255,255,255,0.55)', marginTop: 12 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function FeatureDeepSection() {
  return (
    <React.Fragment>
      <ResultsBand />
      <FeatureDeep
        reverse={false} bg="#F7FBFA" accentColor="#2AB5A2"
        tag="Dose Tracking"
        title="Never miss a dose"
        body="Set up your GLP-1 medication once, and Althea handles the rest. Intelligent injection site rotation keeps you tracking correctly, while real-time drug level curves show you exactly where you are in your dosing cycle."
        bullets={[
          'Body-map rotation across 8 injection sites',
          'PK curves for 16+ GLP-1 medications',
          'Customisable reminders that adapt to your schedule',
        ]}
        phoneId="feat-1"
        caption="Home dashboard — doses & drug levels"
      />
      <FeatureDeep
        reverse={true} bg="#fff" accentColor="#2AB5A2"
        tag="Weight & Progress"
        title="Watch your progress unfold"
        body="Log your weight in a single tap and watch the trend emerge week by week. Althea's charts show you not just where you are today, but how far you've come — the most important thing to see when you're in it for the long haul."
        bullets={[
          'One-tap weight logging with smart pre-fill',
          'Trend charts with milestone markers',
          'PDF reports ready to share with your doctor',
        ]}
        phoneId="feat-2"
        delay={0.04}
        chart
        caption="Weight tracking — trends & milestones"
      />
      <FeatureDeep
        reverse={false} bg="#F7FBFA" accentColor="#1A8A7A"
        tag="Side Effects"
        title="Know what your body is saying"
        body="GLP-1 side effects are real. Log them quickly, track severity over time, and arrive at your next appointment with actual data — not just 'I felt a bit off last week.'"
        bullets={[
          'Quick-tap symptom chips — under 5 seconds',
          'Severity scoring on a 1–10 scale',
          'Pattern insights across your dosing cycle',
        ]}
        phoneId="feat-3"
        delay={0.04}
        caption="Side effect log — severity over time"
      />
    </React.Fragment>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   HOW IT WORKS
   ═══════════════════════════════════════════════════════════════════════════ */
function HowItWorksSection() {
  const steps = [
    {
      n: '01', color: '#2AB5A2',
      title: 'Set up your medication',
      desc: 'Choose from 16+ GLP-1 drugs — Retatrutide, Ozempic, Wegovy, Mounjaro, Zepbound, and more. Enter your dose and start date.',
    },
    {
      n: '02', color: '#2AB5A2',
      title: 'Log your day',
      desc: 'Doses, weight, food, hydration, symptoms — all in under 60 seconds. Althea makes daily logging effortless.',
    },
    {
      n: '03', color: '#1A8A7A',
      title: 'See what\'s working',
      desc: 'Clear charts, milestones, and exportable reports show your complete picture. Bring it to your next appointment.',
    },
  ];
  return (
    <section style={{ padding: '88px 0', background: '#fff' }}>
      <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 24px' }}>
        <RevealOnScroll>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <h2 style={{
              fontSize: 'clamp(30px, 3.5vw, 42px)', fontWeight: 750,
              letterSpacing: '-0.03em', color: '#0D1117', marginBottom: 14,
            }}>Up and running in minutes</h2>
            <p style={{ fontSize: 17, color: '#4A5568', maxWidth: 400, margin: '0 auto' }}>
              No complicated setup. Just open, set up, and start tracking.
            </p>
          </div>
        </RevealOnScroll>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 12, position: 'relative',
        }}>
          {steps.map((s, i) => (
            <RevealOnScroll key={i} delay={i * 0.1}>
              <div style={{
                padding: '36px 28px', borderRadius: 22,
                background: '#FAFAFA', border: '1px solid rgba(0,0,0,0.05)',
                position: 'relative', overflow: 'hidden',
              }}>
                <div style={{
                  fontSize: 64, fontWeight: 800, letterSpacing: '-0.04em',
                  color: s.color + '14', lineHeight: 1,
                  position: 'absolute', top: 16, right: 20,
                  fontFamily: 'system-ui',
                }}>{s.n}</div>
                <h3 style={{ fontSize: 19, fontWeight: 700, color: '#0D1117', marginBottom: 10, letterSpacing: '-0.02em', marginTop: 4 }}>{s.title}</h3>
                <p style={{ fontSize: 15, lineHeight: 1.6, color: '#5F6B7A', margin: 0 }}>{s.desc}</p>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   PRICING
   ═══════════════════════════════════════════════════════════════════════════ */
function PricingSection() {
  const [sel, setSel] = React.useState('annual');
  const mobile = useIsMobile(560);
  const { accentColor, appStoreUrl } = React.useContext(TweaksContext);
  const features = [
    'Dose logging & site rotation', 'Pharmacokinetic drug curves',
    'Weight & body measurement tracking', 'Side effect logging',
    'Food & hydration logs', 'Full GLP-1 drug library (16+ meds)',
    'Progress charts & milestones', 'PDF reports for your doctor',
  ];
  return (
    <section id="pricing" style={{ padding: '88px 0', background: '#F7FBFA', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <FallingLeaves color={accentColor} count={14} />
      </div>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '0 24px', position: 'relative' }}>
        <RevealOnScroll>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{
              fontSize: 'clamp(30px, 3.5vw, 42px)', fontWeight: 750,
              letterSpacing: '-0.03em', color: '#0D1117', marginBottom: 14,
            }}>Simple, transparent pricing</h2>
            <p style={{ fontSize: 17, color: '#4A5568' }}>Start free for 7 days. Cancel anytime.</p>
          </div>
        </RevealOnScroll>

        <RevealOnScroll delay={0.08}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 36 }}>
            {/* Annual — trial card, green gradient like the app paywall */}
            <button onClick={() => setSel('annual')} style={{
              display: 'flex', alignItems: 'center', gap: mobile ? 12 : 16, padding: mobile ? '16px 16px' : '20px 22px',
              borderRadius: 18, cursor: 'pointer', textAlign: 'left', width: '100%',
              border: sel === 'annual' ? '1.5px solid #35C07B' : '1.5px solid rgba(53,192,123,0.35)',
              background: 'linear-gradient(135deg, rgba(53,192,123,0.12), rgba(42,181,162,0.05))',
              transition: 'all 0.18s ease',
            }}>
              <div style={{
                width: 22, height: 22, borderRadius: 11, flexShrink: 0,
                border: `1.5px solid ${sel === 'annual' ? '#35C07B' : 'rgba(0,0,0,0.2)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {sel === 'annual' && <div style={{ width: 12, height: 12, borderRadius: 6, background: '#35C07B' }} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 16, fontWeight: 650, color: '#0D1117' }}>Annual</span>
                  <span style={{
                    fontSize: 9.5, fontWeight: 700, color: '#fff', letterSpacing: '0.04em',
                    background: 'linear-gradient(90deg, #35C07B, #2AB5A2)', padding: '3px 8px', borderRadius: 20,
                  }}>7-DAY FREE TRIAL</span>
                </div>
                <span style={{ fontSize: 13, color: '#4A5568' }}>7 days free · billed $49.99/yr</span>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 13, color: '#9AA6B2', textDecoration: 'line-through', marginBottom: 1 }}>$6.99/mo</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: sel === 'annual' ? '#1A8A7A' : '#0D1117' }}>$4.17/mo</div>
              </div>
            </button>

            {/* Monthly — translucent card */}
            <button onClick={() => setSel('monthly')} style={{
              display: 'flex', alignItems: 'center', gap: mobile ? 12 : 16, padding: mobile ? '16px 16px' : '20px 22px',
              borderRadius: 18, cursor: 'pointer', textAlign: 'left', width: '100%',
              border: sel === 'monthly' ? `1.5px solid ${accentColor}` : '1.5px solid rgba(0,0,0,0.08)',
              background: '#fff',
              transition: 'all 0.18s ease',
            }}>
              <div style={{
                width: 22, height: 22, borderRadius: 11, flexShrink: 0,
                border: `1.5px solid ${sel === 'monthly' ? accentColor : 'rgba(0,0,0,0.2)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {sel === 'monthly' && <div style={{ width: 12, height: 12, borderRadius: 6, background: accentColor }} />}
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 16, fontWeight: 650, color: '#0D1117', display: 'block', marginBottom: 3 }}>Monthly</span>
                <span style={{ fontSize: 13, color: '#8896A5' }}>per month, charged today</span>
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: sel === 'monthly' ? accentColor : '#0D1117' }}>$6.99/mo</div>
            </button>
          </div>
        </RevealOnScroll>

        <RevealOnScroll delay={0.14}>
          <div style={{
            display: 'grid', gridTemplateColumns: mobile ? '1fr' : 'repeat(2, 1fr)', gap: mobile ? '11px' : '11px 20px', marginBottom: 36,
          }}>
            {features.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <svg width="14" height="14" viewBox="0 0 22 22" fill="none" style={{ flexShrink: 0 }}>
                  <path d="M4 11l5 5L18 6" stroke="#35C07B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span style={{ fontSize: 14, color: '#374151' }}>{f}</span>
              </div>
            ))}
          </div>
        </RevealOnScroll>

        <RevealOnScroll delay={0.2}>
          <div style={{ textAlign: 'center' }}>
            <a href={appStoreUrl} style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              background: `linear-gradient(90deg, #35C07B, ${accentColor})`,
              color: '#fff', fontSize: 16.5, fontWeight: 700, letterSpacing: '-0.01em',
              padding: '16px 40px', borderRadius: 16, textDecoration: 'none',
              boxShadow: '0 8px 28px rgba(53,192,123,0.3)',
              transition: 'transform 0.18s ease, box-shadow 0.18s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform='scale(1.03)'; e.currentTarget.style.boxShadow='0 12px 36px rgba(53,192,123,0.4)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform='scale(1)'; e.currentTarget.style.boxShadow='0 8px 28px rgba(53,192,123,0.3)'; }}>
              <svg width="18" height="16" viewBox="0 0 24 20" fill="#fff">
                <path d="M2 6l5 4 5-8 5 8 5-4-2 12H4L2 6z"/>
                <rect x="4" y="19" width="16" height="1.5" rx="0.75"/>
              </svg>
              {sel === 'annual' ? 'Start My Free Trial' : 'Subscribe Monthly'}
            </a>
            <p style={{ fontSize: 12, color: '#8896A5', marginTop: 18, lineHeight: 1.6, maxWidth: 440, marginLeft: 'auto', marginRight: 'auto' }}>
              {sel === 'annual'
                ? 'After the 7-day free trial, you will be charged $49.99/year. Cancel any time in Settings › Apple ID › Subscriptions before the trial ends to avoid charges.'
                : 'You will be charged $6.99 today and monthly thereafter. Cancel any time in Settings › Apple ID › Subscriptions.'}
            </p>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   FINAL CTA
   ═══════════════════════════════════════════════════════════════════════════ */
function FinalCTASection() {
  const mobile = useIsMobile();
  const { accentColor, trialDays, appStoreUrl } = React.useContext(TweaksContext);
  return (
    <section style={{ padding: '100px 0', background: '#0D1117', position: 'relative', overflow: 'hidden' }}>
      {/* Glow */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 600, height: 300,
        background: `radial-gradient(ellipse, ${accentColor}30 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 24px', textAlign: 'center', position: 'relative' }}>
        <RevealOnScroll>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
            <AltheaLogo size={60} />
          </div>
          <h2 style={{
            fontSize: mobile ? 36 : 'clamp(36px, 4.5vw, 52px)',
            fontWeight: 800, letterSpacing: '-0.04em', color: '#fff',
            marginBottom: 18, lineHeight: 1.1,
          }}>Your GLP-1 journey<br />starts here.</h2>
          <p style={{ fontSize: 17, lineHeight: 1.65, color: 'rgba(255,255,255,0.6)', marginBottom: 36, textWrap: 'pretty' }}>
            Download Althea and take control of your medication journey today. {trialDays} days free, no credit card required.
          </p>
          <AppStoreBadge dark={false} size="lg" />
          {!mobile && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, marginTop: 28 }}>
              <div style={{ background: '#fff', borderRadius: 16, padding: 6, boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}>
                <QRCode url={appStoreUrl || 'https://althea.team'} size={124} />
              </div>
              <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.45)' }}>Scan with your iPhone camera</span>
            </div>
          )}
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', marginTop: 20 }}>
            Available on iPhone · iOS 17+
          </p>
        </RevealOnScroll>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   FOOTER
   ═══════════════════════════════════════════════════════════════════════════ */
function FooterSection() {
  const mobile = useIsMobile(640);
  return (
    <footer style={{ background: '#080B10', padding: '40px 24px' }}>
      <div style={{
        maxWidth: 1160, margin: '0 auto',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 16,
      }}>
        <a href="index.html" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <AltheaLogo size={28} />
          <span style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.03em', color: '#fff' }}>Althea</span>
        </a>
        <div style={{ display: 'flex', gap: 24 }}>
          <a href="privacy-policy.html" style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Privacy Policy</a>
          <a href="terms-of-use.html" style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Terms of Use</a>
          <a href="mailto:support@althea.team" style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Support</a>
        </div>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>© 2026 Althea. All rights reserved.</span>
      </div>
    </footer>
  );
}

Object.assign(window, {
  RevealOnScroll, useIsMobile,
  AltheaLogo, AppStoreBadge,
  NavBar, HeroSection, ImpactBand, TrustBar,
  FeaturePillarsSection, FeatureDeepSection,
  HowItWorksSection, PricingSection,
  FinalCTASection, FooterSection,
});
