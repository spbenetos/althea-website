// site-extras.jsx — FAQ, sticky mobile CTA, QR code for the Althea site

/* ═══ FAQ ═══════════════════════════════════════════════════════════════════ */
function FAQItem({ q, a, open, onToggle }) {
  return (
    <div style={{ borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
      <button onClick={onToggle} style={{
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 16, padding: '20px 4px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
      }}>
        <span style={{ fontSize: 16.5, fontWeight: 600, color: '#0D1117', letterSpacing: '-0.01em' }}>{q}</span>
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" style={{
          flexShrink: 0, transform: open ? 'rotate(45deg)' : 'none', transition: 'transform 0.25s ease',
        }}>
          <path d="M10 3v14M3 10h14" stroke="#2AB5A2" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </button>
      <div style={{
        maxHeight: open ? 300 : 0, overflow: 'hidden',
        transition: 'max-height 0.35s cubic-bezier(.4,0,.2,1)',
      }}>
        <p style={{ fontSize: 15, lineHeight: 1.65, color: '#4A5568', margin: 0, padding: '0 4px 20px' }}>{a}</p>
      </div>
    </div>
  );
}

function FAQSection() {
  const [open, setOpen] = React.useState(0);
  const faqs = [
    { q: 'Is my health data private?',
      a: 'Completely. Your data lives on your device and in your own private iCloud — we run no servers and never see it. No analytics, no tracking, no ads. Read our Privacy Policy for the full details.' },
    { q: 'Which medications does Althea support?',
      a: 'All the major GLP-1 medications — Retatrutide, Ozempic, Wegovy, Mounjaro, Zepbound, Saxenda, Rybelsus, Trulicity and more. 16+ drugs with dosing schedules, titration steps, and pharmacokinetic curves.' },
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
    <section id="faq" style={{ padding: '88px 0', background: '#fff' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px' }}>
        <RevealOnScroll>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2 style={{
              fontSize: 'clamp(30px, 3.5vw, 42px)', fontWeight: 750,
              letterSpacing: '-0.03em', color: '#0D1117', marginBottom: 14,
            }}>Questions, answered</h2>
          </div>
        </RevealOnScroll>
        <RevealOnScroll delay={0.08}>
          <div style={{ borderTop: '1px solid rgba(0,0,0,0.07)' }}>
            {faqs.map((f, i) => (
              <FAQItem key={i} q={f.q} a={f.a} open={open === i}
                onToggle={() => setOpen(open === i ? -1 : i)} />
            ))}
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}

/* ═══ Sticky mobile CTA ═════════════════════════════════════════════════════ */
function StickyMobileCTA() {
  const mobile = useIsMobile(640);
  const { appStoreUrl } = React.useContext(TweaksContext);
  const [show, setShow] = React.useState(false);
  React.useEffect(() => {
    const fn = () => setShow(window.scrollY > window.innerHeight * 1.1);
    window.addEventListener('scroll', fn, { passive: true });
    fn();
    return () => window.removeEventListener('scroll', fn);
  }, []);
  if (!mobile) return null;
  return (
    <div style={{
      position: 'fixed', left: 12, right: 12, bottom: 12, zIndex: 150,
      transform: show ? 'translateY(0)' : 'translateY(calc(100% + 20px))',
      transition: 'transform 0.35s cubic-bezier(.22,1,.36,1)',
    }}>
      <a href={appStoreUrl} style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        background: 'rgba(13,17,23,0.92)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        color: '#fff', borderRadius: 999, padding: '15px 20px', textDecoration: 'none',
        boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
      }}>
        <img src="app-icon.png" alt="" width="26" height="26" style={{ borderRadius: 6 }} />
        <span style={{ fontSize: 15.5, fontWeight: 650, letterSpacing: '-0.01em' }}>Download Althea</span>
        <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.55)' }}>· Free 7-day trial</span>
      </a>
    </div>
  );
}

/* ═══ QR code (canvas-drawn via qrcode-generator lib) ═══════════════════════ */
function QRCode({ url, size = 132 }) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const el = ref.current;
    if (!el || typeof qrcode === 'undefined') return;
    const qr = qrcode(0, 'M');
    qr.addData(url);
    qr.make();
    const n = qr.getModuleCount();
    const ctx = el.getContext('2d');
    const pad = 10, cell = (size - pad * 2) / n;
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = '#0D1117';
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
      if (qr.isDark(r, c)) ctx.fillRect(pad + c * cell, pad + r * cell, Math.ceil(cell), Math.ceil(cell));
    }
  }, [url, size]);
  return <canvas ref={ref} width={size} height={size} style={{ borderRadius: 12 }} />;
}

Object.assign(window, { FAQSection, StickyMobileCTA, QRCode });
