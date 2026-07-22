// phone-screens.jsx — Custom CSS iPhone bezel with image-slot interior
// No mock UI. User drops real screenshots in.

/* ── PhoneBezel — pure CSS iPhone shell ─────────────────────────────────── */
function PhoneBezel({ id, src }) {
  const W = 390, H = 844;
  // inner = W/H - 20px padding each axis
  // status bar 59px, home indicator 34px, content = 824-59-34 = 731px
  return (
    <div style={{
      width: W, height: H,
      borderRadius: 52,
      background: 'linear-gradient(155deg, #2E2E32 0%, #1A1A1C 55%, #232326 100%)',
      boxShadow: [
        'inset 0 0 0 1px rgba(255,255,255,0.11)',
        'inset 0 1px 0 rgba(255,255,255,0.16)',
        '0 40px 55px -20px rgba(0,0,0,0.22)',
        '0 16px 26px -12px rgba(0,0,0,0.16)',
      ].join(','),
      padding: 10,
      boxSizing: 'border-box',
      flexShrink: 0,
    }}>
      <div style={{
        width: '100%', height: '100%',
        borderRadius: 43, overflow: 'hidden', background: '#000',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Status bar */}
        <div style={{
          height: 59, flexShrink: 0, background: '#000',
          display: 'flex', alignItems: 'flex-start',
          justifyContent: 'center', paddingTop: 15,
          position: 'relative',
        }}>
          {/* Dynamic island */}
          <div style={{ width: 126, height: 36, background: '#000', borderRadius: 20, boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.06)' }} />
          {/* Time */}
          <span style={{
            position: 'absolute', left: 26, top: 20,
            fontSize: 15, fontWeight: 600, color: '#fff',
            fontFamily: '-apple-system, system-ui',
          }}>9:41</span>
          {/* Icons */}
          <div style={{ position: 'absolute', right: 22, top: 22, display: 'flex', gap: 5, alignItems: 'center' }}>
            <svg width="17" height="12" viewBox="0 0 17 12" fill="#fff">
              <rect x="0" y="8" width="3" height="4" rx="0.6"/>
              <rect x="4.5" y="5" width="3" height="7" rx="0.6"/>
              <rect x="9" y="2" width="3" height="10" rx="0.6"/>
              <rect x="13.5" y="0" width="3" height="12" rx="0.6"/>
            </svg>
            <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
              <path d="M8 3.2C10.2 3.2 12.1 4 13.5 5.4L14.5 4.4C12.8 2.8 10.5 1.8 8 1.8S3.2 2.8 1.5 4.4L2.5 5.4C3.9 4 5.8 3.2 8 3.2z" fill="#fff"/>
              <path d="M8 6.5C9.3 6.5 10.5 7 11.4 7.9L12.4 6.9C11.2 5.7 9.7 5 8 5S4.8 5.7 3.6 6.9L4.6 7.9C5.5 7 6.7 6.5 8 6.5z" fill="#fff"/>
              <circle cx="8" cy="10.2" r="1.5" fill="#fff"/>
            </svg>
            <svg width="26" height="12" viewBox="0 0 26 12">
              <rect x="0.5" y="0.5" width="22" height="11" rx="3" stroke="#fff" strokeOpacity="0.35" fill="none"/>
              <rect x="2" y="2" width="19" height="8" rx="1.5" fill="#fff"/>
              <path d="M24 4v4c.9-.4 1.4-1.1 1.4-2s-.5-1.6-1.4-2z" fill="#fff" fillOpacity="0.4"/>
            </svg>
          </div>
        </div>

        {/* Screen content — 731px tall */}
        <div style={{ height: 731, flexShrink: 0, background: '#0D1117', position: 'relative' }}>
          {src ? (
            <img src={src} alt="Althea app screenshot" draggable="false"
              style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover', userSelect: 'none', WebkitUserSelect: 'none', pointerEvents: 'none' }} />
          ) : (
            <image-slot
              id={`screen-${id}`}
              placeholder="Drop screenshot here"
              shape="rect"
              style={{ display: 'block', width: '100%', height: '100%' }}
            />
          )}
        </div>

        {/* Home indicator */}
        <div style={{
          flex: 1, background: '#000',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ width: 134, height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.3)' }} />
        </div>
      </div>
    </div>
  );
}

/* ── PhoneFrame — scales bezel and collapses layout space ────────────────── */
const SCREENSHOTS = {
  'hero-left': 'screenshots/hero-left.webp',
  'hero-center': 'screenshots/hero-center.webp',
  'hero-right': 'screenshots/hero-right.webp',
  'feat-1': 'screenshots/feat-1.webp',
  'feat-2': 'screenshots/feat-2.webp',
  'feat-3': 'screenshots/feat-3.webp',
};
function PhoneFrame({ id, scale = 0.65, style = {} }) {
  const W = 390, H = 844;
  const cW = Math.round(W * scale);
  const cH = Math.round(H * scale);
  return (
    <div style={{ width: cW, height: cH, position: 'relative', flexShrink: 0, ...style }}>
      <div style={{
        position: 'absolute', top: 0, left: 0,
        transform: `scale(${scale})`, transformOrigin: 'top left',
        width: W, height: H,
      }}>
        <PhoneBezel id={id} src={SCREENSHOTS[id]} />
      </div>
    </div>
  );
}

Object.assign(window, { PhoneBezel, PhoneFrame });
