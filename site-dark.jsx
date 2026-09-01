// site-dark.jsx — dark-theme chrome for the video/tour landing page.
// Only this page uses these; index.html keeps its light components untouched.

const D = {
  ink: '#EFF4F3',
  mid: 'rgba(239,244,243,0.66)',
  faint: 'rgba(239,244,243,0.42)',
  rule: 'rgba(239,244,243,0.10)',
  glass: 'rgba(255,255,255,0.055)',
  glassLine: 'rgba(255,255,255,0.13)',
};

const darkGlass = {
  background: D.glass,
  backdropFilter: 'blur(24px) saturate(150%)',
  WebkitBackdropFilter: 'blur(24px) saturate(150%)',
  border: `1px solid ${D.glassLine}`,
  boxShadow: '0 28px 70px -26px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.14)',
  borderRadius: 20,
};

function DarkNavBar() {
  const [scrolled, setScrolled] = React.useState(false);
  const mobile = useIsMobile(640);
  React.useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 32);
    window.addEventListener('scroll', fn, { passive: true });
    fn();
    return () => window.removeEventListener('scroll', fn);
  }, []);
  const link = { fontSize: 14, fontWeight: 500, color: D.mid, textDecoration: 'none' };
  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      opacity: scrolled ? 1 : 0, pointerEvents: scrolled ? 'auto' : 'none',
      background: scrolled ? 'rgba(0,1,2,0.32)' : 'transparent',
      backdropFilter: scrolled ? 'saturate(160%) blur(18px)' : 'none',
      WebkitBackdropFilter: scrolled ? 'saturate(160%) blur(18px)' : 'none',
      borderBottom: `1px solid ${scrolled ? D.rule : 'transparent'}`,
      transition: 'opacity 0.3s ease, background 0.3s ease, border-color 0.3s ease, backdrop-filter 0.3s ease',
    }}>
      <div style={{
        maxWidth: 1160, margin: '0 auto', padding: '0 24px',
        height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <a href="index.html" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <AltheaLogo size={34} />
          <span style={{
            fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif",
            fontSize: 22, fontWeight: 600, letterSpacing: '-0.03em', color: D.ink,
          }}>Althea</span>
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: mobile ? 12 : 32 }}>
          {!mobile && <>
            <a href="#tour" style={link}>Tour</a>
            <a href="#faq" style={link}>FAQ</a>
          </>}
          <AppStoreBadge dark={false} size="sm" compact={mobile} />
        </div>
      </div>
    </nav>
  );
}

function DarkFAQItem({ q, a, open, onToggle }) {
  const { accentColor } = React.useContext(TweaksContext);
  return (
    <div style={{ borderBottom: `1px solid ${D.rule}` }}>
      <button onClick={onToggle} style={{
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 16, padding: '20px 4px', background: 'none', border: 'none', cursor: 'pointer',
        textAlign: 'left', color: 'inherit',
      }}>
        <span style={{ fontSize: 16.5, fontWeight: 600, color: D.ink, letterSpacing: '-0.015em' }}>{q}</span>
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" style={{
          flexShrink: 0, transform: open ? 'rotate(45deg)' : 'none', transition: 'transform 0.25s ease',
        }}>
          <path d="M10 3v14M3 10h14" stroke={accentColor} strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
      <div style={{ maxHeight: open ? 320 : 0, overflow: 'hidden', transition: 'max-height 0.35s cubic-bezier(.4,0,.2,1)' }}>
        <p style={{ fontSize: 15, lineHeight: 1.68, color: D.mid, margin: 0, padding: '0 4px 22px', textWrap: 'pretty' }}>{a}</p>
      </div>
    </div>
  );
}

function DarkFAQSection() {
  const [open, setOpen] = React.useState(0);
  const faqs = [
    { q: 'Is my health data private?',
      a: 'Completely. Your data lives on your device and in your own private iCloud — we run no servers and never see it. No analytics, no tracking, no ads. Read our Privacy Policy for the full details.' },
    { q: 'Which medications does Althea support?',
      a: 'All the major GLP-1 medications — Ozempic®, Wegovy®, Mounjaro®, Zepbound®, Rybelsus®, Saxenda®, Trulicity®, Victoza®, Retatrutide and more. 16+ drugs with dosing schedules, titration steps, and pharmacokinetic curves, in injectable and oral forms.' },
    { q: 'Does Althea support compounded GLP-1s?',
      a: 'Yes. Alongside brand-name drugs, Althea supports compounded semaglutide and tirzepatide with custom strengths and schedules — you set the dose, Althea handles the rest.' },
    { q: 'What makes Althea different from other GLP-1 trackers?',
      a: 'Three things: your data never leaves your device, it models the actual drug level in your body between doses, and its reports are designed with clinicians for real appointments.' },
    { q: 'Does Althea replace my doctor?',
      a: 'No. Althea is a tracking companion, not a medical device. It helps you arrive at appointments with clear data, but every medication decision belongs with your prescribing healthcare provider.' },
    { q: 'How does the free trial work?',
      a: 'The annual plan starts with 7 days completely free — no charge until the trial ends, and you can cancel any time before it does. Billing is handled securely by Apple.' },
    { q: 'How do I cancel my subscription?',
      a: 'Any time via Settings › your Apple ID › Subscriptions on your iPhone. You keep full access until the end of the current billing period.' },
    { q: 'Does it work with Apple Health?',
      a: 'Yes — optionally. Althea can sync your weight with Apple Health and read metrics like steps, sleep, and heart rate to show alongside your journey. You choose exactly what to share.' },
  ];
  return (
    <section id="faq" style={{ padding: '92px 0', background: 'transparent', position: 'relative', zIndex: 2 }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px' }}>
        <RevealOnScroll>
          <div style={{ textAlign: 'center', marginBottom: 38 }}>
            <h2 style={{
              fontSize: 'clamp(26px, 3.5vw, 40px)', color: D.ink, marginBottom: 12, lineHeight: 1.14,
            }}>Questions, answered</h2>
          </div>
        </RevealOnScroll>
        <RevealOnScroll delay={0.08}>
          <div style={{ ...darkGlass, borderRadius: 22, padding: '6px 22px' }}>
            {faqs.map((f, i) => (
              <DarkFAQItem key={i} q={f.q} a={f.a} open={open === i}
                onToggle={() => setOpen(open === i ? -1 : i)} />
            ))}
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}

function DarkFooter() {
  const mobile = useIsMobile(640);
  const link = { fontSize: 14, color: D.mid, textDecoration: 'none' };
  return (
    <footer style={{
      background: 'transparent', borderTop: `1px solid ${D.rule}`, position: 'relative', zIndex: 2,
      padding: mobile ? '34px 24px 40px' : '40px 24px',
    }}>
      <div style={{
        maxWidth: 1160, margin: '0 auto', display: 'flex', flexWrap: 'wrap',
        alignItems: 'center', justifyContent: 'space-between', gap: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <AltheaLogo size={28} />
          <span style={{
            fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif",
            fontSize: 20, fontWeight: 600, letterSpacing: '-0.03em', color: D.ink,
          }}>Althea</span>
        </div>
        <nav style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
          <a href="privacy-policy/index.html" style={link}>Privacy Policy</a>
          <a href="terms-of-use/index.html" style={link}>Terms of Use</a>
          <a href="mailto:support@althea.team" style={link}>Support</a>
        </nav>
        <span style={{ fontSize: 12.5, color: D.faint }}>© 2026 Althea. All rights reserved.</span>
      </div>
    </footer>
  );
}

Object.assign(window, { D, darkGlass, DarkNavBar, DarkFAQSection, DarkFAQItem, DarkFooter });
