// phone-screens.jsx — Mockup iOS app screens for the Althea landing page
// Depends on: ios-frame.jsx (IOSDevice)

const MC = {
  primary: '#2AB5A2', primaryLight: '#5AD8C6', primaryDark: '#1A8A7A',
  primarySubtle: 'rgba(42,181,162,0.12)',
  accent: '#FF8C5A', accentSubtle: 'rgba(255,140,90,0.12)',
  success: '#34C759', info: '#007AFF', warning: '#FF9500', error: '#FF3B30',
  bg: '#F2F2F7', surface: '#FFFFFF',
  t1: '#1C1C1E', t2: '#8E8E93', t3: '#C7C7CC',
};

const mCard = {
  background: MC.surface, borderRadius: 16, padding: '12px 14px',
  boxShadow: '0 2px 10px rgba(0,0,0,0.055)',
};

function MCard({ children, style }) {
  return <div style={{ ...mCard, ...style }}>{children}</div>;
}

function MBadge({ label, color }) {
  return (
    <span style={{
      fontSize: 10, fontWeight: 600, color,
      background: color + '1F', padding: '2px 8px', borderRadius: 20,
    }}>{label}</span>
  );
}

/* ── SVG mini weight chart ─────────────────────────────────────────────── */

function WeightMiniChart({ id = 'wc' }) {
  const w = 200, h = 55;
  const data = [82.5, 82, 81.2, 80.5, 80.1, 79.5, 79, 78.2];
  const mn = 77, mx = 83.5;
  const pts = data.map((v, i) => [
    (i / (data.length - 1)) * w,
    h - ((v - mn) / (mx - mn)) * h,
  ]);
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ display: 'block' }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={MC.primary} stopOpacity="0.18" />
          <stop offset="100%" stopColor={MC.primary} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${line} L${w},${h} L0,${h} Z`} fill={`url(#${id})`} />
      <path d={line} fill="none" stroke={MC.primary} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="3.5" fill={MC.primary} />
    </svg>
  );
}

/* ── Mini circular progress ────────────────────────────────────────────── */

function MiniCircle({ pct, color, size = 36, stroke = 3.5 }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color + '22'} strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={c} strokeDashoffset={c * (1 - pct)} strokeLinecap="round" />
    </svg>
  );
}

/* ── Activity row ──────────────────────────────────────────────────────── */

function ActivityRow({ color, icon, title, sub, time, last }) {
  return (
    <div style={{
      padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10,
      borderBottom: last ? 'none' : '1px solid rgba(0,0,0,0.05)',
    }}>
      <div style={{
        width: 30, height: 30, borderRadius: 15, background: color + '1A',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 13, color, fontWeight: 700,
      }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11.5, fontWeight: 500, color: MC.t1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</div>
        <div style={{ fontSize: 10, color: MC.t2 }}>{sub}</div>
      </div>
      <div style={{ fontSize: 9.5, color: MC.t3, flexShrink: 0 }}>{time}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   DASHBOARD SCREEN
   ═══════════════════════════════════════════════════════════════════════════ */

function DashboardScreen() {
  return (
    <IOSDevice title="Good morning, Sarah">
      <div style={{ padding: '0 14px 24px', display: 'flex', flexDirection: 'column', gap: 14, background: MC.bg, minHeight: '100%' }}>
        {/* Weight Graph Card */}
        <MCard>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: MC.t1 }}>Weight Progress</span>
            <span style={{ fontSize: 10, color: MC.t2 }}>8 weeks</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 5, marginBottom: 8 }}>
            <span style={{ fontSize: 30, fontWeight: 700, color: MC.primary, fontFamily: 'system-ui', letterSpacing: '-0.02em' }}>78.2</span>
            <span style={{ fontSize: 12, color: MC.t2 }}>kg</span>
            <MBadge label="↓ 4.3 kg" color={MC.success} />
          </div>
          <WeightMiniChart id="dash-wc" />
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <div style={{ flex: 1, height: 32, borderRadius: 10, background: MC.primary, color: '#fff', fontSize: 11.5, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Log Weight</div>
            <div style={{ flex: 1, height: 32, borderRadius: 10, background: MC.primarySubtle, color: MC.primary, fontSize: 11.5, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Log Dose</div>
          </div>
        </MCard>

        {/* Medication Level */}
        <MCard>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <MiniCircle pct={0.72} color={MC.primary} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: MC.t1 }}>Active Level</div>
              <div style={{ fontSize: 10.5, color: MC.t2 }}>Semaglutide · 1.0 mg</div>
            </div>
            <span style={{ fontSize: 22, fontWeight: 700, color: MC.primary }}>72%</span>
          </div>
          <div style={{ height: 4, borderRadius: 2, background: MC.primarySubtle, marginTop: 10, overflow: 'hidden' }}>
            <div style={{ width: '72%', height: '100%', borderRadius: 2, background: MC.primary }} />
          </div>
        </MCard>

        {/* Recent Activity */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: MC.t1, marginBottom: 8 }}>Recent Activity</div>
          <MCard style={{ padding: 0, overflow: 'hidden' }}>
            <ActivityRow color={MC.primary} icon="⤵" title="Dose logged — 1.0 mg" sub="Left thigh" time="2h ago" />
            <ActivityRow color={MC.primary} icon="◎" title="Weight logged" sub="78.2 kg" time="Today" />
            <ActivityRow color={MC.accent} icon="~" title="Mild nausea" sub="Severity: 2" time="Yesterday" last />
          </MCard>
        </div>
      </div>
    </IOSDevice>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   TRACK SCREEN
   ═══════════════════════════════════════════════════════════════════════════ */

function TrackScreen() {
  return (
    <IOSDevice title="Track">
      <div style={{ padding: '0 14px 24px', display: 'flex', flexDirection: 'column', gap: 14, background: MC.bg, minHeight: '100%' }}>
        {/* Daily Log header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: MC.t1 }}>Daily Log</span>
            {[MC.primary, MC.success, MC.info, MC.accent].map((c, i) => (
              <div key={i} style={{
                width: 6, height: 6, borderRadius: 3,
                background: i === 0 ? c : MC.t3 + '55',
              }} />
            ))}
          </div>
          <MBadge label="2/4" color={MC.primary} />
        </div>

        {/* Weight Card */}
        <MCard style={{
          border: `1px solid ${MC.t3}33`,
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Card header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 20, color: MC.primary }}>⚖</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: MC.t1 }}>Weight</span>
            </div>
            <div style={{ width: 18, height: 18, borderRadius: 9, background: MC.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>✓</span>
            </div>
          </div>

          {/* Big number */}
          <div style={{ textAlign: 'center', margin: '8px 0' }}>
            <span style={{ fontSize: 44, fontWeight: 700, color: MC.primary, letterSpacing: '-0.03em', fontFamily: 'system-ui' }}>78.5</span>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <span style={{ fontSize: 14, color: MC.t2 }}>kg</span>
              <MBadge label="↓ 0.3 kg" color={MC.success} />
            </div>
          </div>

          {/* Steppers */}
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 6, marginTop: 12 }}>
            {['-1', '-0.1', '+0.1', '+1'].map(l => (
              <div key={l} style={{
                flex: 1, height: 34, borderRadius: 8, background: MC.primarySubtle,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 600, color: MC.primary,
              }}>{l}</div>
            ))}
          </div>

          {/* Slider */}
          <div style={{ marginTop: 10, padding: '10px 12px', background: MC.bg, borderRadius: 10 }}>
            <div style={{ height: 4, borderRadius: 2, background: MC.t3 + '44', position: 'relative' }}>
              <div style={{ position: 'absolute', left: '38%', top: -4, width: 12, height: 12, borderRadius: 6, background: MC.primary, boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }} />
              <div style={{ width: '38%', height: '100%', borderRadius: 2, background: MC.primary }} />
            </div>
          </div>

          {/* CTA */}
          <div style={{
            marginTop: 12, height: 38, borderRadius: 12, background: MC.primary,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 13, fontWeight: 600,
          }}>Log 78.5 kg</div>
        </MCard>

        {/* Page dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 5 }}>
          {[MC.primary, MC.t3 + '44', MC.t3 + '44', MC.t3 + '44'].map((c, i) => (
            <div key={i} style={{ width: i === 0 ? 16 : 6, height: 6, borderRadius: 3, background: c }} />
          ))}
        </div>

        {/* Weekly check-in */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: MC.t1, marginBottom: 8 }}>Weekly Check-in</div>
          <MCard>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 18, background: MC.info + '1A',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, color: MC.info,
              }}>📏</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: MC.t1 }}>Body Measurements</div>
                <div style={{ fontSize: 10, color: MC.t2 }}>Waist, hips, arms & more</div>
              </div>
              <span style={{ fontSize: 12, color: MC.t3 }}>›</span>
            </div>
          </MCard>
        </div>
      </div>
    </IOSDevice>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   PROGRESS SCREEN
   ═══════════════════════════════════════════════════════════════════════════ */

function ProgressScreen() {
  return (
    <IOSDevice title="Progress">
      <div style={{ padding: '0 14px 24px', display: 'flex', flexDirection: 'column', gap: 14, background: MC.bg, minHeight: '100%' }}>
        {/* Stats row */}
        <div style={{ display: 'flex', gap: 10 }}>
          {[
            { v: '4.3', u: 'kg', l: 'Total lost', c: MC.primary },
            { v: '16', u: '', l: 'Doses logged', c: MC.accent },
            { v: '94%', u: '', l: 'Adherence', c: MC.success },
          ].map((s, i) => (
            <MCard key={i} style={{ flex: 1, textAlign: 'center', padding: '14px 8px' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: s.c, letterSpacing: '-0.02em' }}>{s.v}<span style={{ fontSize: 10, fontWeight: 500, color: MC.t2 }}>{s.u}</span></div>
              <div style={{ fontSize: 9.5, color: MC.t2, marginTop: 2 }}>{s.l}</div>
            </MCard>
          ))}
        </div>

        {/* Weight trend */}
        <MCard>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: MC.t1, marginBottom: 8 }}>Weight Trend</div>
          <WeightMiniChart id="prog-wc" />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
            {['4w', '8w', '12w', '6m', '1y'].map((p, i) => (
              <span key={p} style={{
                fontSize: 10, fontWeight: i === 1 ? 600 : 400, padding: '3px 8px', borderRadius: 8,
                color: i === 1 ? MC.primary : MC.t2,
                background: i === 1 ? MC.primarySubtle : 'transparent',
              }}>{p}</span>
            ))}
          </div>
        </MCard>

        {/* Dose adherence */}
        <MCard>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: MC.t1 }}>Dose Adherence</span>
            <MBadge label="12-dose streak" color={MC.accent} />
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {Array.from({ length: 12 }, (_, i) => (
              <div key={i} style={{
                flex: 1, height: 28, borderRadius: 4,
                background: i < 11 ? MC.primary : MC.primary + '44',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {i < 11 && <span style={{ color: '#fff', fontSize: 8, fontWeight: 700 }}>✓</span>}
              </div>
            ))}
          </div>
        </MCard>

        {/* Side effect trend */}
        <MCard>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: MC.t1, marginBottom: 8 }}>Side Effect Trend</div>
          <div style={{ display: 'flex', gap: 6 }}>
            {['Nausea', 'Fatigue', 'Headache'].map((s, i) => (
              <div key={s} style={{
                flex: 1, padding: '8px 6px', borderRadius: 10, background: MC.accent + (i === 0 ? '18' : '0A'),
                textAlign: 'center',
              }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: i === 0 ? MC.accent : MC.t3 }}>{[3, 1, 0][i]}</div>
                <div style={{ fontSize: 8.5, color: MC.t2, marginTop: 2 }}>{s}</div>
              </div>
            ))}
          </div>
        </MCard>
      </div>
    </IOSDevice>
  );
}

Object.assign(window, { DashboardScreen, TrackScreen, ProgressScreen, MC });
