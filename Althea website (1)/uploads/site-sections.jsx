// site-sections.jsx — Landing page sections for the Althea website
// Depends on: phone-screens.jsx, ios-frame.jsx

/* ── Scroll reveal ─────────────────────────────────────────────────────── */

function RevealOnScroll({ children, delay = 0, className = '' }) {
  const ref = React.useRef(null);
  const [vis, setVis] = React.useState(false);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Immediately visible if already in viewport
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight) { setVis(true); return; }
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );
    obs.observe(el);
    // Fallback: reveal after 600ms in case observer never fires
    const timer = setTimeout(() => { setVis(true); obs.disconnect(); }, 600);
    return () => { obs.disconnect(); clearTimeout(timer); };
  }, []);
  return (
    <div ref={ref} className={className} style={{
      opacity: vis ? 1 : 0,
      transform: vis ? 'translateY(0)' : 'translateY(28px)',
      transition: `opacity 0.65s cubic-bezier(0.22,1,0.36,1) ${delay}s, transform 0.65s cubic-bezier(0.22,1,0.36,1) ${delay}s`,
    }}>
      {children}
    </div>
  );
}

/* ── Althea leaf logo SVG ──────────────────────────────────────────────── */

function AltheaLeaf({ size = 32, color = '#2AB5A2' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <rect width="48" height="48" rx="12" fill={color} />
      <path d="M24 12c-6 4-10 10-10 18 3-2 6-3.5 10-3.5s7 1.5 10 3.5c0-8-4-14-10-18z" fill="#fff" opacity="0.9"/>
      <path d="M24 16c-4 3-6.5 7.5-6.5 13 2-1.2 4-1.8 6.5-1.8s4.5.6 6.5 1.8c0-5.5-2.5-10-6.5-13z" fill="#fff" opacity="0.5"/>
      <line x1="24" y1="15" x2="24" y2="30" stroke="#fff" strokeWidth="1.5" opacity="0.6" strokeLinecap="round"/>
    </svg>
  );
}

function AltheaWordmark({ color = '#1A1D2B' }) {
  return (
    <span style={{
      fontSize: 22, fontWeight: 700, letterSpacing: '-0.03em', color,
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>althea</span>
  );
}

/* ── App Store badge ───────────────────────────────────────────────────── */

function AppStoreBadge({ dark = true }) {
  const bg = dark ? '#000' : '#fff';
  const fg = dark ? '#fff' : '#000';
  return (
    <a href="#" onClick={e => e.preventDefault()} style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      background: bg, color: fg, border: dark ? 'none' : '1px solid #0002',
      borderRadius: 12, padding: '10px 20px 10px 16px',
      textDecoration: 'none', cursor: 'pointer',
      transition: 'transform 0.15s ease, box-shadow 0.15s ease',
    }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)'; }}
    onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      <svg width="22" height="26" viewBox="0 0 22 26" fill={fg}>
        <path d="M18.07 13.62c-.03-3.1 2.53-4.6 2.65-4.67-1.44-2.11-3.69-2.4-4.49-2.43-1.91-.2-3.73 1.12-4.7 1.12-.97 0-2.47-1.1-4.06-1.07-2.09.03-4.01 1.21-5.09 3.08-2.17 3.77-.56 9.36 1.56 12.42 1.03 1.5 2.27 3.18 3.89 3.12 1.56-.06 2.15-1.01 4.04-1.01 1.89 0 2.42 1.01 4.07.98 1.68-.03 2.74-1.53 3.76-3.03 1.19-1.74 1.68-3.42 1.71-3.51-.04-.02-3.28-1.26-3.34-5z"/>
        <path d="M14.95 4.27c.86-1.04 1.44-2.48 1.28-3.92-1.24.05-2.74.82-3.63 1.86-.79.92-1.49 2.38-1.3 3.79 1.38.11 2.79-.7 3.65-1.73z"/>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
        <span style={{ fontSize: 10, fontWeight: 400, opacity: 0.85 }}>Download on the</span>
        <span style={{ fontSize: 17, fontWeight: 600, letterSpacing: '-0.01em', marginTop: 2 }}>App Store</span>
      </div>
    </a>
  );
}

/* ── Phone wrapper — scales IOSDevice to landing page proportions ──────── */

function PhoneFrame({ children, scale = 0.72, style }) {
  return (
    <div style={{
      transform: `scale(${scale})`,
      transformOrigin: 'top center',
      filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.12))',
      ...style,
    }}>
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   NAV BAR
   ═══════════════════════════════════════════════════════════════════════════ */

function NavBar() {
  const [scrolled, setScrolled] = React.useState(false);
  React.useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);
  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled ? 'rgba(255,255,255,0.88)' : 'transparent',
      backdropFilter: scrolled ? 'blur(20px) saturate(1.6)' : 'none',
      WebkitBackdropFilter: scrolled ? 'blur(20px) saturate(1.6)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(0,0,0,0.06)' : '1px solid transparent',
      transition: 'all 0.3s ease',
    }}>
      <div style={{
        maxWidth: 1120, margin: '0 auto', padding: '14px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <AltheaLeaf size={32} />
          <AltheaWordmark />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          <a href="#features" style={{ fontSize: 14, fontWeight: 500, color: '#5F6B7A', textDecoration: 'none' }}>Features</a>
          <a href="#pricing" style={{ fontSize: 14, fontWeight: 500, color: '#5F6B7A', textDecoration: 'none' }}>Pricing</a>
          <a href="#" onClick={e => e.preventDefault()} style={{
            fontSize: 13, fontWeight: 600, color: '#fff', background: '#2AB5A2',
            padding: '8px 18px', borderRadius: 10, textDecoration: 'none',
            transition: 'background 0.15s ease',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#1A8A7A'}
          onMouseLeave={e => e.currentTarget.style.background = '#2AB5A2'}
          >Download</a>
        </div>
      </div>
    </nav>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   HERO — VARIANT A (CLINICAL)
   ═══════════════════════════════════════════════════════════════════════════ */

function HeroClinical() {
  return (
    <section style={{
      paddingTop: 120, paddingBottom: 40,
      background: '#fff',
      overflow: 'hidden',
    }}>
      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
        <RevealOnScroll>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(42,181,162,0.08)', padding: '6px 16px', borderRadius: 20,
            fontSize: 13, fontWeight: 600, color: '#1A8A7A', marginBottom: 24,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: 3, background: '#2AB5A2' }}></span>
            GLP-1 Medication Companion
          </div>
        </RevealOnScroll>

        <RevealOnScroll delay={0.08}>
          <h1 style={{
            fontSize: 'clamp(36px, 5vw, 60px)', fontWeight: 750, lineHeight: 1.08,
            letterSpacing: '-0.035em', color: '#1A1D2B',
            maxWidth: 700, margin: '0 auto 20px',
          }}>
            Your GLP-1 journey,<br />fully supported.
          </h1>
        </RevealOnScroll>

        <RevealOnScroll delay={0.14}>
          <p style={{
            fontSize: 'clamp(16px, 2vw, 19px)', lineHeight: 1.6, color: '#5F6B7A',
            maxWidth: 520, margin: '0 auto 32px', textWrap: 'pretty',
          }}>
            Track doses, monitor your weight, log side effects, and see real progress — all in one clinical-grade companion app.
          </p>
        </RevealOnScroll>

        <RevealOnScroll delay={0.2}>
          <AppStoreBadge />
        </RevealOnScroll>

        {/* Phone mockup */}
        <RevealOnScroll delay={0.26}>
          <div style={{ marginTop: 48, display: 'flex', justifyContent: 'center' }}>
            <PhoneFrame scale={0.78}>
              <DashboardScreen />
            </PhoneFrame>
          </div>
        </RevealOnScroll>

        {/* Floating stat cards */}
        <RevealOnScroll delay={0.35}>
          <div style={{
            display: 'flex', justifyContent: 'center', gap: 20, marginTop: -60,
            flexWrap: 'wrap', padding: '0 20px',
          }}>
            {[
              { v: '16+', l: 'GLP-1 medications', c: '#2AB5A2' },
              { v: '4.3 kg', l: 'Avg. weight lost', c: '#FF8C5A' },
              { v: '94%', l: 'Dose adherence', c: '#34C759' },
            ].map((s, i) => (
              <div key={i} style={{
                background: '#fff', borderRadius: 16, padding: '18px 28px',
                boxShadow: '0 4px 24px rgba(0,0,0,0.08)', textAlign: 'center',
                minWidth: 140,
              }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: s.c, letterSpacing: '-0.02em' }}>{s.v}</div>
                <div style={{ fontSize: 13, color: '#5F6B7A', marginTop: 4 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   HERO — VARIANT B (JOURNEY)
   ═══════════════════════════════════════════════════════════════════════════ */

function HeroJourney() {
  return (
    <section style={{
      paddingTop: 120, paddingBottom: 60,
      background: 'linear-gradient(168deg, #F0FAF8 0%, #FFFFFF 50%, #FFF8F5 100%)',
      overflow: 'hidden',
    }}>
      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 24px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 48,
          flexWrap: 'wrap', justifyContent: 'center',
        }}>
          {/* Text side */}
          <div style={{ flex: '1 1 420px', maxWidth: 520 }}>
            <RevealOnScroll>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'rgba(42,181,162,0.08)', padding: '6px 16px', borderRadius: 20,
                fontSize: 13, fontWeight: 600, color: '#1A8A7A', marginBottom: 24,
              }}>
                <span style={{ width: 6, height: 6, borderRadius: 3, background: '#2AB5A2' }}></span>
                iOS App
              </div>
            </RevealOnScroll>

            <RevealOnScroll delay={0.06}>
              <h1 style={{
                fontSize: 'clamp(34px, 4.5vw, 56px)', fontWeight: 750, lineHeight: 1.08,
                letterSpacing: '-0.035em', color: '#1A1D2B', marginBottom: 20,
              }}>
                Track every dose.<br />
                <span style={{ color: '#2AB5A2' }}>See every result.</span>
              </h1>
            </RevealOnScroll>

            <RevealOnScroll delay={0.12}>
              <p style={{
                fontSize: 'clamp(16px, 1.8vw, 18px)', lineHeight: 1.65, color: '#5F6B7A',
                marginBottom: 32, maxWidth: 440, textWrap: 'pretty',
              }}>
                The companion app built for your GLP-1 medication journey. Dose tracking, weight monitoring, side effect logging, and pharmacokinetic insights — together in one place.
              </p>
            </RevealOnScroll>

            <RevealOnScroll delay={0.18}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                <AppStoreBadge />
                <span style={{ fontSize: 13, color: '#8E8E93' }}>Free 7-day trial</span>
              </div>
            </RevealOnScroll>

            <RevealOnScroll delay={0.24}>
              <div style={{ display: 'flex', gap: 24, marginTop: 40 }}>
                {[
                  { v: '16+', l: 'Medications' },
                  { v: '94%', l: 'Adherence' },
                  { v: '5★', l: 'Rated' },
                ].map((s, i) => (
                  <div key={i}>
                    <div style={{ fontSize: 24, fontWeight: 700, color: '#2AB5A2', letterSpacing: '-0.02em' }}>{s.v}</div>
                    <div style={{ fontSize: 12, color: '#8E8E93', marginTop: 2 }}>{s.l}</div>
                  </div>
                ))}
              </div>
            </RevealOnScroll>
          </div>

          {/* Phones */}
          <RevealOnScroll delay={0.15}>
            <div style={{
              display: 'flex', gap: 0, alignItems: 'flex-start',
              flex: '0 0 auto',
            }}>
              <PhoneFrame scale={0.7} style={{ position: 'relative', zIndex: 2 }}>
                <DashboardScreen />
              </PhoneFrame>
              <PhoneFrame scale={0.62} style={{ marginLeft: -60, marginTop: 60, opacity: 0.92 }}>
                <TrackScreen />
              </PhoneFrame>
            </div>
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURES
   ═══════════════════════════════════════════════════════════════════════════ */

function FeatureBlock({ icon, iconColor, title, desc, bullets, children, reverse }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 'clamp(32px, 5vw, 72px)',
      flexDirection: reverse ? 'row-reverse' : 'row',
      flexWrap: 'wrap', justifyContent: 'center',
    }}>
      <div style={{ flex: '1 1 340px', maxWidth: 440 }}>
        <RevealOnScroll>
          <div style={{
            width: 48, height: 48, borderRadius: 14, background: iconColor + '14',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, marginBottom: 20,
          }}>
            <span style={{ color: iconColor }}>{icon}</span>
          </div>
          <h3 style={{
            fontSize: 'clamp(24px, 3vw, 32px)', fontWeight: 700,
            letterSpacing: '-0.025em', color: '#1A1D2B', marginBottom: 14, lineHeight: 1.2,
          }}>{title}</h3>
          <p style={{
            fontSize: 16, lineHeight: 1.65, color: '#5F6B7A', marginBottom: 20, textWrap: 'pretty',
          }}>{desc}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {bullets.map((b, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <div style={{
                  width: 20, height: 20, borderRadius: 10, background: iconColor + '18',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1,
                }}>
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                    <path d="M2.5 6.5l2.5 2.5 5-5.5" stroke={iconColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span style={{ fontSize: 14.5, color: '#3D4654', lineHeight: 1.5 }}>{b}</span>
              </div>
            ))}
          </div>
        </RevealOnScroll>
      </div>
      <RevealOnScroll delay={0.15}>
        <div style={{ flex: '0 0 auto' }}>
          {children}
        </div>
      </RevealOnScroll>
    </div>
  );
}

function SmallFeatureCard({ icon, iconColor, title, desc }) {
  return (
    <RevealOnScroll>
      <div style={{
        background: '#fff', borderRadius: 20, padding: '28px 24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.03)',
        border: '1px solid rgba(0,0,0,0.04)',
        height: '100%',
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: 13, background: iconColor + '12',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, marginBottom: 16,
        }}>
          <span style={{ color: iconColor }}>{icon}</span>
        </div>
        <h4 style={{ fontSize: 17, fontWeight: 650, color: '#1A1D2B', marginBottom: 8, letterSpacing: '-0.01em' }}>{title}</h4>
        <p style={{ fontSize: 14, lineHeight: 1.55, color: '#5F6B7A', margin: 0 }}>{desc}</p>
      </div>
    </RevealOnScroll>
  );
}

function FeaturesSection() {
  return (
    <section id="features" style={{ padding: '80px 0', background: '#F8FAF9' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 24px' }}>
        <RevealOnScroll>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <h2 style={{
              fontSize: 'clamp(28px, 3.5vw, 40px)', fontWeight: 750,
              letterSpacing: '-0.03em', color: '#1A1D2B', marginBottom: 14, lineHeight: 1.15,
            }}>Everything you need to stay on track</h2>
            <p style={{ fontSize: 17, color: '#5F6B7A', maxWidth: 480, margin: '0 auto' }}>
              Built by people who understand the GLP-1 experience. Every feature designed to support your journey.
            </p>
          </div>
        </RevealOnScroll>

        {/* Feature 1: Dose Tracking */}
        <FeatureBlock
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 3v18M5 8l7-5 7 5M5 16l7 5 7-5" stroke="#2AB5A2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
          iconColor="#2AB5A2"
          title="Smart dose tracking"
          desc="Log every injection with intelligent site rotation guidance. Never wonder where your last dose went."
          bullets={[
            'Automatic injection site rotation with body map',
            'Real-time pharmacokinetic curves for 16+ GLP-1 medications',
            'Personalised reminders that adapt to your schedule',
          ]}
        >
          <PhoneFrame scale={0.68}>
            <DashboardScreen />
          </PhoneFrame>
        </FeatureBlock>

        <div style={{ height: 80 }} />

        {/* Feature 2: Weight Progress */}
        <FeatureBlock
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M3 20l5-8 4 4 5-10 4 6" stroke="#FF8C5A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
          iconColor="#FF8C5A"
          title="Watch your progress unfold"
          desc="Log weight in seconds and see meaningful trends emerge over weeks and months."
          bullets={[
            'One-tap weight logging with smart suggestions',
            'Trend charts with goal tracking and milestones',
            'Detailed PDF reports to share with your doctor',
          ]}
          reverse
        >
          <PhoneFrame scale={0.68}>
            <TrackScreen />
          </PhoneFrame>
        </FeatureBlock>

        <div style={{ height: 80 }} />

        {/* Small feature cards grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 20,
        }}>
          <SmallFeatureCard
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4.5 12.5l3 3 9-9.5" stroke="#34C759" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            iconColor="#34C759"
            title="Side effect logging"
            desc="Quick-tap symptom chips with severity tracking. See trends over time to share with your healthcare provider."
          />
          <SmallFeatureCard
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9" stroke="#007AFF" strokeWidth="2" strokeLinecap="round"/><path d="M17 3v6h6" stroke="#007AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            iconColor="#007AFF"
            title="Food & water tracking"
            desc="Barcode scanning, macro breakdowns, and hydration goals. Know exactly what's fuelling your progress."
          />
          <SmallFeatureCard
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#FF9500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            iconColor="#FF9500"
            title="GLP-1 drug library"
            desc="In-depth profiles for 16+ medications including dosing schedules, PK curves, and titration guidance."
          />
          <SmallFeatureCard
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" stroke="#AF52DE" strokeWidth="2"/><path d="M8 12l3 3 5-6" stroke="#AF52DE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            iconColor="#AF52DE"
            title="Achievements & streaks"
            desc="Stay motivated with milestone badges, dose streaks, and progress celebrations along your journey."
          />
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   PRICING
   ═══════════════════════════════════════════════════════════════════════════ */

function PricingSection() {
  const [selected, setSelected] = React.useState('annual');
  const features = [
    'Site rotation & dose tracking',
    'Weight & progress charts',
    'Full GLP-1 drug library',
    'Personalised dose reminders',
    'PDF report for your doctor',
    'Achievements & milestones',
  ];

  return (
    <section id="pricing" style={{ padding: '80px 0 100px', background: '#fff' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px' }}>
        <RevealOnScroll>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{
              fontSize: 'clamp(28px, 3.5vw, 40px)', fontWeight: 750,
              letterSpacing: '-0.03em', color: '#1A1D2B', marginBottom: 14, lineHeight: 1.15,
            }}>Simple, transparent pricing</h2>
            <p style={{ fontSize: 17, color: '#5F6B7A', maxWidth: 420, margin: '0 auto' }}>
              Start free for 7 days. Cancel any time.
            </p>
          </div>
        </RevealOnScroll>

        {/* Plan cards */}
        <RevealOnScroll delay={0.1}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 40 }}>
            {/* Annual */}
            <button onClick={() => setSelected('annual')} style={{
              display: 'flex', alignItems: 'center', gap: 16,
              padding: '20px 24px', borderRadius: 18, cursor: 'pointer',
              border: selected === 'annual' ? '2px solid #2AB5A2' : '2px solid #E5E7EB',
              background: selected === 'annual' ? 'rgba(42,181,162,0.04)' : '#fff',
              transition: 'all 0.2s ease', textAlign: 'left', width: '100%',
            }}>
              <div style={{
                width: 22, height: 22, borderRadius: 11,
                border: selected === 'annual' ? '2px solid #2AB5A2' : '2px solid #D1D5DB',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                {selected === 'annual' && <div style={{ width: 12, height: 12, borderRadius: 6, background: '#2AB5A2' }} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 16, fontWeight: 650, color: '#1A1D2B' }}>Annual</span>
                  <span style={{
                    fontSize: 10, fontWeight: 700, color: '#1A8A7A',
                    background: 'linear-gradient(90deg, rgba(53,192,123,0.15), rgba(42,181,162,0.15))',
                    padding: '2px 8px', borderRadius: 6,
                  }}>7-DAY FREE TRIAL</span>
                </div>
                <span style={{ fontSize: 13, color: '#8E8E93', marginTop: 2, display: 'block' }}>7 days free · then $49.99/year</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: 12, color: '#8E8E93', textDecoration: 'line-through' }}>$6.99/mo</span>
                <div style={{ fontSize: 17, fontWeight: 650, color: selected === 'annual' ? '#2AB5A2' : '#1A1D2B' }}>$4.17/mo</div>
              </div>
            </button>

            {/* Monthly */}
            <button onClick={() => setSelected('monthly')} style={{
              display: 'flex', alignItems: 'center', gap: 16,
              padding: '20px 24px', borderRadius: 18, cursor: 'pointer',
              border: selected === 'monthly' ? '2px solid #2AB5A2' : '2px solid #E5E7EB',
              background: selected === 'monthly' ? 'rgba(42,181,162,0.04)' : '#fff',
              transition: 'all 0.2s ease', textAlign: 'left', width: '100%',
            }}>
              <div style={{
                width: 22, height: 22, borderRadius: 11,
                border: selected === 'monthly' ? '2px solid #2AB5A2' : '2px solid #D1D5DB',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                {selected === 'monthly' && <div style={{ width: 12, height: 12, borderRadius: 6, background: '#2AB5A2' }} />}
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 16, fontWeight: 650, color: '#1A1D2B' }}>Monthly</span>
                <span style={{ fontSize: 13, color: '#8E8E93', marginTop: 2, display: 'block' }}>Billed monthly</span>
              </div>
              <div style={{ fontSize: 17, fontWeight: 650, color: selected === 'monthly' ? '#2AB5A2' : '#1A1D2B' }}>$6.99/mo</div>
            </button>
          </div>
        </RevealOnScroll>

        {/* Feature checklist */}
        <RevealOnScroll delay={0.15}>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px 24px',
            marginBottom: 40,
          }}>
            {features.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="8" fill="rgba(42,181,162,0.12)"/>
                  <path d="M5 8.2l2 2 4-4.4" stroke="#2AB5A2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span style={{ fontSize: 14, color: '#3D4654' }}>{f}</span>
              </div>
            ))}
          </div>
        </RevealOnScroll>

        {/* CTA */}
        <RevealOnScroll delay={0.2}>
          <div style={{ textAlign: 'center' }}>
            <AppStoreBadge />
            <p style={{ fontSize: 12, color: '#8E8E93', marginTop: 16, lineHeight: 1.5 }}>
              {selected === 'annual'
                ? 'After the 7-day free trial, you will be charged $49.99/year. Cancel any time in Settings › Apple ID › Subscriptions.'
                : 'You will be charged $6.99 today and monthly thereafter. Cancel any time.'}
            </p>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   FOOTER
   ═══════════════════════════════════════════════════════════════════════════ */

function FooterSection() {
  return (
    <footer style={{
      padding: '48px 0 40px',
      background: '#1A1D2B', color: '#fff',
    }}>
      <div style={{
        maxWidth: 1120, margin: '0 auto', padding: '0 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <AltheaLeaf size={28} color="#2AB5A2" />
          <AltheaWordmark color="#fff" />
        </div>
        <div style={{ display: 'flex', gap: 24, fontSize: 13 }}>
          <a href="privacy-policy.html" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>Privacy Policy</a>
          <a href="terms-of-use.html" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>Terms of Use</a>
          <a href="mailto:privacy@altheaapp.com" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>Support</a>
        </div>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>© 2025 Althea. All rights reserved.</span>
      </div>
    </footer>
  );
}

Object.assign(window, {
  RevealOnScroll, NavBar, HeroClinical, HeroJourney,
  FeaturesSection, PricingSection, FooterSection,
  AltheaLeaf, AltheaWordmark, AppStoreBadge, PhoneFrame,
});
