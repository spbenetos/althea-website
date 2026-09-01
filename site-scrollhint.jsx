// site-scrollhint.jsx — swipe-down nudge shown if the user idles at the very top.
// Appears after 6s of no scroll at y≈0; dismisses on any scroll/key/touch intent.

const HINT_DELAY = 6000;

function ScrollHint() {
  const t = React.useContext(TweaksContext) || {};
  const accent = t.accentColor || '#2AB5A2';
  const mobile = useIsMobile(820);
  const [shown, setShown] = React.useState(false);
  const doneRef = React.useRef(false);

  React.useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let timer = null;
    const arm = () => {
      clearTimeout(timer);
      if (doneRef.current) return;
      if (window.scrollY > 4) { setShown(false); return; }
      timer = setTimeout(() => {
        if (!doneRef.current && window.scrollY <= 4) setShown(true);
      }, HINT_DELAY);
    };
    const dismiss = () => {
      doneRef.current = true;
      clearTimeout(timer);
      setShown(false);
      window.removeEventListener('wheel', dismiss);
      window.removeEventListener('touchstart', dismiss);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', onScroll);
    };
    const onKey = e => { if ([' ', 'ArrowDown', 'PageDown', 'End'].includes(e.key)) dismiss(); };
    const onScroll = () => { if (window.scrollY > 40) dismiss(); else arm(); };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('wheel', dismiss, { passive: true });
    window.addEventListener('touchstart', dismiss, { passive: true });
    window.addEventListener('keydown', onKey);
    arm();
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('wheel', dismiss);
      window.removeEventListener('touchstart', dismiss);
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  return (
    <div aria-hidden="true" style={{
      position: 'fixed',
      left: mobile ? '9%' : 'clamp(56px, 18%, 24%)',
      top: mobile ? '40%' : '50%',
      transform: `translate(-50%, -50%) translateY(${shown ? '0' : '18px'})`,
      opacity: shown ? 1 : 0, transition: 'opacity .55s ease, transform .55s cubic-bezier(.22,1,.36,1)',
      pointerEvents: 'none', zIndex: 60, display: 'flex', flexDirection: 'column',
      alignItems: 'center', gap: mobile ? '12px' : '18px',
    }}>
      <div style={{
        position: 'relative', width: mobile ? '80px' : '108px', height: mobile ? '134px' : '176px',
        display: 'grid', placeItems: 'center',
      }}>
        <span style={{
          position: 'absolute', top: mobile ? '18px' : '33px', width: '2px', height: '50px',
          borderRadius: '2px', transformOrigin: 'top',
          background: `linear-gradient(180deg, ${accent}00 0%, ${accent}3D 38%, ${accent}B3 100%)`,
          boxShadow: `0 0 10px ${accent}55`,
          animation: shown ? 'hintTrail 2.4s cubic-bezier(.4,0,.5,1) infinite' : 'none',
        }} />
        <svg viewBox="0 0 24 30" width={mobile ? 56 : 68} height={mobile ? 70 : 85} fill="none" style={{
          animation: shown ? 'hintSwipe 2.4s cubic-bezier(.4,0,.5,1) infinite' : 'none',
          filter: 'drop-shadow(0 6px 18px rgba(0,0,0,.5))',
        }}>
          <path d="M9.6 13.2V4.4a2.1 2.1 0 0 1 4.2 0v9.4" stroke="rgba(255,255,255,.92)" strokeWidth="1.35" strokeLinecap="round" />
          <path d="M13.8 11.4a1.9 1.9 0 0 1 3.8 0v2.6M17.6 12.6a1.8 1.8 0 0 1 3.6 0v5.6c0 4.6-2.9 8.4-7.2 8.4h-2.3c-2.4 0-3.9-1-5-2.9l-3.2-5.4a1.9 1.9 0 0 1 3.1-2.2l1.2 1.5" stroke="rgba(255,255,255,.92)" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}

Object.assign(window, { ScrollHint });
