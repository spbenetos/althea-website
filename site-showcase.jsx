// site-showcase.jsx — app screenshot showcase + testimonials

/* ═══════════════════════════════════════════════════════════════════════════
   SHOWCASE — "see it in action" swipeable gallery of real app screens
   ═══════════════════════════════════════════════════════════════════════════ */
function ShowcaseSection() {
  const mobile = useIsMobile();
  const { accentColor } = React.useContext(TweaksContext);
  const shots = [
    { id: 'hero-center', caption: 'Home — doses & drug levels' },
    { id: 'feat-1', caption: 'Drug library — 16+ medications' },
    { id: 'feat-2', caption: 'Weight — trends & milestones' },
    { id: 'feat-3', caption: 'Side effects — severity over time' },
    { id: 'hero-left', caption: 'Doses — injection site rotation' },
    { id: 'hero-right', caption: 'Progress — your full picture' },
  ];
  return (
    <section style={{
      padding: mobile ? '72px 0' : '96px 0',
      background: 'linear-gradient(180deg, #F7FBFA 0%, #EDF8F6 100%)',
      overflow: 'hidden',
    }}>
      <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 24px' }}>
        <RevealOnScroll>
          <div style={{ textAlign: 'center', marginBottom: mobile ? 36 : 48 }}>
            <div style={{
              fontSize: 11.5, fontWeight: 700, letterSpacing: '0.14em',
              textTransform: 'uppercase', color: accentColor, marginBottom: 14,
            }}>See it in action</div>
            <h2 style={{
              fontSize: 'clamp(24px, 3.5vw, 42px)', fontWeight: 750,
              letterSpacing: '-0.03em', color: '#0D1117', marginBottom: 14, lineHeight: 1.15,
            }}>Made for the daily habit</h2>
            <p style={{ fontSize: 17, color: '#4A5568', maxWidth: 480, margin: '0 auto' }}>
              Every screen built to make tracking fast, clear, and entirely yours.
            </p>
          </div>
        </RevealOnScroll>
      </div>
      <RevealOnScroll delay={0.08}>
        <div className="showcase-scroll" style={{
          display: 'flex', gap: mobile ? 18 : 30,
          overflowX: 'auto', scrollSnapType: 'x mandatory',
          padding: mobile ? '8px 24px 28px' : '8px max(24px, calc((100vw - 1160px) / 2)) 32px',
          WebkitOverflowScrolling: 'touch',
        }}>
          {shots.map((s, i) => (
            <div key={i} style={{
              flex: '0 0 auto', scrollSnapAlign: 'center',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
            }}>
              <PhoneFrame id={s.id} scale={mobile ? 0.58 : 0.66} />
              <span style={{
                fontSize: 13.5, fontWeight: 600, color: '#5F6B7A',
                letterSpacing: '0.01em', whiteSpace: 'nowrap',
              }}>{s.caption}</span>
            </div>
          ))}
        </div>
      </RevealOnScroll>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   TESTIMONIALS
   PLACEHOLDER reviews — replace `reviews` with real App Store reviews before launch.
   ═══════════════════════════════════════════════════════════════════════════ */
function Stars({ color }) {
  return (
    <div style={{ display: 'flex', gap: 2, marginBottom: 16 }}>
      {[0, 1, 2, 3, 4].map(i => (
        <svg key={i} width="15" height="15" viewBox="0 0 24 24" fill={color}>
          <polygon points="12,2 15.1,8.3 22,9.3 17,14.1 18.2,21 12,17.8 5.8,21 7,14.1 2,9.3 8.9,8.3" />
        </svg>
      ))}
    </div>
  );
}

function TestimonialCard({ r, accentColor }) {
  return (
    <div style={{
      background: '#fff', border: '1px solid rgba(13,17,23,0.07)', borderRadius: 20,
      padding: '28px 26px', display: 'flex', flexDirection: 'column',
      boxShadow: '0 2px 12px rgba(13,17,23,0.03)',
    }}>
      <Stars color={accentColor} />
      <p style={{
        fontSize: 15.5, lineHeight: 1.62, color: '#374151', margin: '0 0 22px',
        textWrap: 'pretty', flex: 1,
      }}>"{r.quote}"</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 20, flexShrink: 0,
          background: 'linear-gradient(150deg, #3FD0BC, #1F9E8C)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: 15, fontWeight: 700, letterSpacing: '0.01em',
        }}>{r.initials}</div>
        <div>
          <div style={{ fontSize: 14.5, fontWeight: 650, color: '#0D1117' }}>{r.name}</div>
          <div style={{ fontSize: 13, color: '#8896A5' }}>{r.meta}</div>
        </div>
      </div>
    </div>
  );
}

function TestimonialsSection() {
  const mobile = useIsMobile(768);
  const { accentColor } = React.useContext(TweaksContext);
  const reviews = [
    { quote: 'I finally stopped guessing where I was in my dosing cycle. The drug-level curve is the feature I didn\u2019t know I needed.', name: 'Maria K.', meta: 'Wegovy \u00b7 4 months', initials: 'MK' },
    { quote: 'Logging my weight takes one tap, and the trend chart keeps me honest on the weeks I\u2019d rather not look.', name: 'James T.', meta: 'Mounjaro \u00b7 7 months', initials: 'JT' },
    { quote: 'I brought the PDF report to my endocrinologist and she actually asked which app I was using.', name: 'Priya S.', meta: 'Ozempic \u00b7 6 months', initials: 'PS' },
    { quote: 'Knowing my data never leaves my phone is exactly why I trust it with something this personal.', name: 'Daniel R.', meta: 'Zepbound \u00b7 3 months', initials: 'DR' },
  ];
  return (
    <section style={{ padding: mobile ? '72px 0' : '96px 0', background: '#fff' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '0 24px' }}>
        <RevealOnScroll>
          <div style={{ textAlign: 'center', marginBottom: mobile ? 36 : 52 }}>
            <div style={{
              fontSize: 11.5, fontWeight: 700, letterSpacing: '0.14em',
              textTransform: 'uppercase', color: accentColor, marginBottom: 14,
            }}>Loved by people on the journey</div>
            <h2 style={{
              fontSize: 'clamp(30px, 3.5vw, 42px)', fontWeight: 750,
              letterSpacing: '-0.03em', color: '#0D1117', lineHeight: 1.15,
            }}>You’re in good company</h2>
          </div>
        </RevealOnScroll>
        <RevealOnScroll delay={0.08}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: mobile ? '1fr' : 'repeat(2, 1fr)',
            gap: 16,
          }}>
            {reviews.map((r, i) => (
              <TestimonialCard key={i} r={r} accentColor={accentColor} />
            ))}
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}

Object.assign(window, { ShowcaseSection, TestimonialsSection, TestimonialCard, Stars });
