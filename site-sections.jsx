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
          <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.03em', color: '#0D1117' }}>althea</span>
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: mobile ? 12 : 32 }}>
          {!mobile && <>
            <a href="#features" style={{ fontSize: 14, fontWeight: 500, color: '#5F6B7A', textDecoration: 'none' }}>Features</a>
            <a href="#pricing" style={{ fontSize: 14, fontWeight: 500, color: '#5F6B7A', textDecoration: 'none' }}>Pricing</a>
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
      overflow: 'hidden',
    }}>
      {/* Text */}
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
        <RevealOnScroll>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            background: accentColor + '1A', padding: '5px 14px 5px 10px',
            borderRadius: 20, marginBottom: 24,
          }}>
            <AltheaLogo size={20} />
            <span style={{ fontSize: 12.5, fontWeight: 600, color: accentColor, letterSpacing: '0.01em' }}>Available on the App Store</span>
          </div>
        </RevealOnScroll>

        <RevealOnScroll delay={0.07}>
          <h1 style={{
            fontSize: mobile ? 42 : 'clamp(48px, 6vw, 72px)',
            fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.04em',
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
          marginTop: mobile ? 48 : 64,
          padding: '0 24px',
          overflow: 'hidden',
        }}>
          {!mobile && (
            <PhoneFrame id="hero-left" scale={0.52} style={{ marginBottom: -40 }} />
          )}
          <PhoneFrame id="hero-center" scale={mobile ? 0.72 : 0.60} style={{ marginBottom: mobile ? 0 : 0 }} />
          {!mobile && (
            <PhoneFrame id="hero-right" scale={0.52} style={{ marginBottom: -80 }} />
          )}
        </div>
      </RevealOnScroll>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   TRUST BAR
   ═══════════════════════════════════════════════════════════════════════════ */
function TrustBar() {
  const mobile = useIsMobile(640);
  const items = [
    { icon: '★', label: '4.8 on the App Store' },
    { icon: '⬛', label: '100% private — stays on your device', svg: true },
    { icon: '💊', label: '16+ GLP-1 medications' },
    { icon: '⬛', label: 'Clinically informed tracking', svg2: true },
  ];
  return (
    <div style={{
      background: '#fff', borderTop: '1px solid rgba(0,0,0,0.06)',
      borderBottom: '1px solid rgba(0,0,0,0.06)',
    }}>
      <div style={{
        maxWidth: 1160, margin: '0 auto', padding: '0 24px',
        height: mobile ? 'auto' : 64, paddingTop: mobile ? 20 : 0, paddingBottom: mobile ? 20 : 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexWrap: 'wrap', gap: mobile ? '12px 24px' : 0,
      }}>
        {[
          {
            icon: (
              <svg width="22" height="22" viewBox="0 0 24 24">
                <polygon points="12,2 15.1,8.3 22,9.3 17,14.1 18.2,21 12,17.8 5.8,21 7,14.1 2,9.3 8.9,8.3" fill="#FF8C5A"/>
              </svg>
            ),
            label: '4.8 on the App Store',
          },
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
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M2 12h4l2-5 3 10 2-7 2 4h7" stroke="#FF8C5A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ),
            label: 'Built for patients',
          },
        ].map((item, i, arr) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            flex: mobile ? '0 0 auto' : 1,
            justifyContent: 'center',
            padding: mobile ? '0' : '0 20px',
            borderRight: (!mobile && i < arr.length - 1) ? '1px solid rgba(0,0,0,0.08)' : 'none',
          }}>
            {item.icon}
            <span style={{ fontSize: 13.5, fontWeight: 500, color: '#4A5568', whiteSpace: 'nowrap' }}>{item.label}</span>
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
        <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
          <rect x="19" y="6" width="10" height="26" rx="5" stroke="#2AB5A2" strokeWidth="2.2"/>
          <rect x="21" y="12" width="6" height="8" rx="1" fill="#2AB5A2" opacity="0.25"/>
          <line x1="21" y1="24" x2="27" y2="24" stroke="#2AB5A2" strokeWidth="1.5" strokeLinecap="round" opacity="0.45"/>
          <line x1="21" y1="27" x2="27" y2="27" stroke="#2AB5A2" strokeWidth="1.5" strokeLinecap="round" opacity="0.45"/>
          <line x1="19" y1="32" x2="29" y2="32" stroke="#2AB5A2" strokeWidth="1.5" strokeLinecap="round" opacity="0.35"/>
          <line x1="24" y1="32" x2="24" y2="42" stroke="#2AB5A2" strokeWidth="2" strokeLinecap="round"/>
          <rect x="20" y="4" width="8" height="4" rx="2" fill="#2AB5A2"/>
        </svg>
      ),
      title: 'Dose Tracking',
      desc: 'Log every injection with one tap. Automatic site rotation, personalised reminders, and real-time drug level curves.',
    },
    {
      color: '#FF8C5A',
      icon: (
        <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
          <rect x="8" y="30" width="32" height="12" rx="4" stroke="#FF8C5A" strokeWidth="2.2"/>
          <rect x="12" y="27" width="24" height="5" rx="2" fill="#FF8C5A" opacity="0.15" stroke="#FF8C5A" strokeWidth="1.5"/>
          <rect x="16" y="33" width="16" height="5" rx="1.5" fill="#FF8C5A" opacity="0.18"/>
          <line x1="20" y1="35.5" x2="28" y2="35.5" stroke="#FF8C5A" strokeWidth="1.6" strokeLinecap="round"/>
          <path d="M24 6v14" stroke="#FF8C5A" strokeWidth="2.2" strokeLinecap="round"/>
          <path d="M18 16l6 7 6-7" stroke="#FF8C5A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      title: 'Weight Progress',
      desc: 'Tap to log, watch the trend. Milestone charts, goal tracking, and doctor-ready PDF reports in seconds.',
    },
    {
      color: '#AF52DE',
      icon: (
        <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
          <rect x="10" y="10" width="28" height="34" rx="4" stroke="#AF52DE" strokeWidth="2.2"/>
          <rect x="18" y="6" width="12" height="7" rx="3.5" fill="none" stroke="#AF52DE" strokeWidth="2.2"/>
          <circle cx="17" cy="22" r="3" fill="#AF52DE" opacity="0.75"/>
          <path d="M15.7 22l1.1 1.1 2.2-2.2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <line x1="23" y1="22" x2="33" y2="22" stroke="#AF52DE" strokeWidth="1.8" strokeLinecap="round" opacity="0.35"/>
          <circle cx="17" cy="31" r="3" fill="#AF52DE" opacity="0.75"/>
          <path d="M15.7 31l1.1 1.1 2.2-2.2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <line x1="23" y1="31" x2="33" y2="31" stroke="#AF52DE" strokeWidth="1.8" strokeLinecap="round" opacity="0.35"/>
          <circle cx="17" cy="40" r="3" fill="none" stroke="#AF52DE" strokeWidth="1.8" opacity="0.35"/>
          <line x1="23" y1="40" x2="30" y2="40" stroke="#AF52DE" strokeWidth="1.8" strokeLinecap="round" opacity="0.2"/>
        </svg>
      ),
      title: 'Side Effect Log',
      desc: 'Quick-tap symptom chips with severity scoring. See patterns emerge and bring real data to every appointment.',
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
              One app for your entire GLP-1 journey.
            </p>
          </div>
        </RevealOnScroll>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 20,
        }}>
          {pillars.map((p, i) => (
            <RevealOnScroll key={i} delay={i * 0.08}>
              <div style={{
                background: '#FAFAFA', borderRadius: 22, padding: '32px 28px',
                border: '1px solid rgba(0,0,0,0.05)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='0 8px 32px rgba(0,0,0,0.07)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none'; }}>
                <div style={{
                  marginBottom: 18,
                }}>{p.icon}</div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: '#0D1117', marginBottom: 10, letterSpacing: '-0.02em' }}>{p.title}</h3>
                <p style={{ fontSize: 15, lineHeight: 1.6, color: '#5F6B7A', margin: 0 }}>{p.desc}</p>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE DEEP DIVES
   ═══════════════════════════════════════════════════════════════════════════ */
function FeatureDeep({ reverse, bg, accentColor, tag, title, body, bullets, phoneId, delay = 0 }) {
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
              display: 'inline-block', fontSize: 11.5, fontWeight: 700, letterSpacing: '0.1em',
              textTransform: 'uppercase', color: accentColor, marginBottom: 16,
              background: accentColor + '12', padding: '4px 12px', borderRadius: 6,
            }}>{tag}</div>
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
          </RevealOnScroll>
        </div>

        {/* Phone */}
        <RevealOnScroll delay={delay + 0.12} from={mobile ? 'bottom' : (reverse ? 'left' : 'right')}>
          <PhoneFrame id={phoneId} scale={mobile ? 0.65 : 0.68} />
        </RevealOnScroll>
      </div>
    </section>
  );
}

function FeatureDeepSection() {
  return (
    <React.Fragment>
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
      />
      <FeatureDeep
        reverse={true} bg="#fff" accentColor="#FF8C5A"
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
      />
      <FeatureDeep
        reverse={false} bg="#F7FBFA" accentColor="#AF52DE"
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
      desc: 'Choose from 16+ GLP-1 drugs — Ozempic, Wegovy, Mounjaro, Zepbound, and more. Enter your dose and start date.',
    },
    {
      n: '02', color: '#FF8C5A',
      title: 'Log your day',
      desc: 'Doses, weight, food, hydration, symptoms — all in under 60 seconds. Althea makes daily logging effortless.',
    },
    {
      n: '03', color: '#AF52DE',
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
                <div style={{
                  width: 44, height: 44, borderRadius: 13, background: s.color + '15',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 20,
                }}>
                  <span style={{ fontSize: 20, fontWeight: 700, color: s.color, fontFamily: 'system-ui' }}>{i + 1}</span>
                </div>
                <h3 style={{ fontSize: 19, fontWeight: 700, color: '#0D1117', marginBottom: 10, letterSpacing: '-0.02em' }}>{s.title}</h3>
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
  const features = [
    'Dose logging & site rotation', 'Pharmacokinetic drug curves',
    'Weight & body measurement tracking', 'Side effect logging',
    'Food & hydration logs', 'Full GLP-1 drug library (16+ meds)',
    'Progress charts & milestones', 'PDF reports for your doctor',
  ];
  return (
    <section id="pricing" style={{ padding: '88px 0', background: '#F7FBFA' }}>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '0 24px' }}>
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
            {/* Annual */}
            <button onClick={() => setSel('annual')} style={{
              display: 'flex', alignItems: 'center', gap: 16, padding: '20px 22px',
              borderRadius: 18, cursor: 'pointer', textAlign: 'left', width: '100%',
              border: sel === 'annual' ? '2px solid #2AB5A2' : '2px solid #E2E8F0',
              background: sel === 'annual' ? 'rgba(42,181,162,0.04)' : '#fff',
              transition: 'all 0.18s ease',
            }}>
              <div style={{
                width: 22, height: 22, borderRadius: 11, flexShrink: 0,
                border: `2px solid ${sel === 'annual' ? '#2AB5A2' : '#CBD5E0'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {sel === 'annual' && <div style={{ width: 12, height: 12, borderRadius: 6, background: '#2AB5A2' }} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                  <span style={{ fontSize: 16, fontWeight: 650, color: '#0D1117' }}>Annual</span>
                  <span style={{
                    fontSize: 10.5, fontWeight: 700, color: '#1A8A7A', letterSpacing: '0.04em',
                    background: 'rgba(42,181,162,0.12)', padding: '2px 8px', borderRadius: 5,
                  }}>7-DAY FREE TRIAL</span>
                </div>
                <span style={{ fontSize: 13, color: '#8896A5' }}>$49.99/year after trial — save 41%</span>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 13, color: '#CBD5E0', textDecoration: 'line-through', marginBottom: 1 }}>$6.99/mo</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: sel === 'annual' ? '#2AB5A2' : '#0D1117' }}>$4.17/mo</div>
              </div>
            </button>

            {/* Monthly */}
            <button onClick={() => setSel('monthly')} style={{
              display: 'flex', alignItems: 'center', gap: 16, padding: '20px 22px',
              borderRadius: 18, cursor: 'pointer', textAlign: 'left', width: '100%',
              border: sel === 'monthly' ? '2px solid #2AB5A2' : '2px solid #E2E8F0',
              background: sel === 'monthly' ? 'rgba(42,181,162,0.04)' : '#fff',
              transition: 'all 0.18s ease',
            }}>
              <div style={{
                width: 22, height: 22, borderRadius: 11, flexShrink: 0,
                border: `2px solid ${sel === 'monthly' ? '#2AB5A2' : '#CBD5E0'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {sel === 'monthly' && <div style={{ width: 12, height: 12, borderRadius: 6, background: '#2AB5A2' }} />}
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 16, fontWeight: 650, color: '#0D1117', display: 'block', marginBottom: 3 }}>Monthly</span>
                <span style={{ fontSize: 13, color: '#8896A5' }}>Billed monthly, cancel anytime</span>
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: sel === 'monthly' ? '#2AB5A2' : '#0D1117' }}>$6.99/mo</div>
            </button>
          </div>
        </RevealOnScroll>

        <RevealOnScroll delay={0.14}>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '11px 20px', marginBottom: 36,
          }}>
            {features.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <svg width="20" height="20" viewBox="0 0 22 22" fill="none" style={{ flexShrink: 0 }}>
                  <path d="M4 11l5 5L18 6" stroke="#2AB5A2" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span style={{ fontSize: 14, color: '#374151' }}>{f}</span>
              </div>
            ))}
          </div>
        </RevealOnScroll>

        <RevealOnScroll delay={0.2}>
          <div style={{ textAlign: 'center' }}>
            <AppStoreBadge dark size="lg" />
            <p style={{ fontSize: 12.5, color: '#8896A5', marginTop: 14, lineHeight: 1.6 }}>
              {sel === 'annual'
                ? 'After your 7-day free trial, $49.99/year. Cancel in Settings › Apple ID › Subscriptions.'
                : '$6.99 charged monthly. Cancel anytime in Settings › Apple ID › Subscriptions.'}
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
  const { accentColor, trialDays } = React.useContext(TweaksContext);
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
          <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.03em', color: '#fff' }}>althea</span>
        </a>
        <div style={{ display: 'flex', gap: 24 }}>
          <a href="privacy-policy" style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Privacy Policy</a>
          <a href="terms-of-use" style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Terms of Use</a>
          <a href="mailto:hello@althea.team" style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Support</a>
        </div>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>© 2025 Althea. All rights reserved.</span>
      </div>
    </footer>
  );
}

Object.assign(window, {
  RevealOnScroll, useIsMobile,
  AltheaLogo, AppStoreBadge,
  NavBar, HeroSection, TrustBar,
  FeaturePillarsSection, FeatureDeepSection,
  HowItWorksSection, PricingSection,
  FinalCTASection, FooterSection,
});
