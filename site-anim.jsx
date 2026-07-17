// site-anim.jsx — Scroll-driven animation helpers for the Althea site
// Depends on React. Exports to window for other babel scripts.

const AnimContext = React.createContext({
  animChartDraw: true,
  animCountUp: true,
  animProgressRail: true,
  animHeroParallax: true,
});
window.AnimContext = AnimContext;

/* ── useInView — fires once when element enters viewport ─────────────────── */
function useInView(threshold = 0.3) {
  const ref = React.useRef(null);
  const [inView, setInView] = React.useState(false);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.85) { setInView(true); return; }
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

/* ── useScrollProgress — 0..1 down the whole page ───────────────────────── */
function useScrollProgress() {
  const [p, setP] = React.useState(0);
  React.useEffect(() => {
    let raf = 0;
    const fn = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const h = document.documentElement.scrollHeight - window.innerHeight;
        setP(h > 0 ? Math.min(1, Math.max(0, window.scrollY / h)) : 0);
      });
    };
    window.addEventListener('scroll', fn, { passive: true });
    window.addEventListener('resize', fn, { passive: true });
    fn();
    return () => { window.removeEventListener('scroll', fn); window.removeEventListener('resize', fn); cancelAnimationFrame(raf); };
  }, []);
  return p;
}

/* ── ScrollProgressRail — thin teal bar across the top ──────────────────── */
function ScrollProgressRail({ color = '#2AB5A2' }) {
  const { animProgressRail } = React.useContext(AnimContext);
  const p = useScrollProgress();
  if (!animProgressRail) return null;
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, height: 3, zIndex: 200,
      background: 'transparent', pointerEvents: 'none',
    }}>
      <div style={{
        height: '100%', width: `${p * 100}%`,
        background: `linear-gradient(90deg, ${color}, ${color}CC)`,
        boxShadow: `0 0 8px ${color}88`,
        transition: 'width 0.08s linear',
      }} />
    </div>
  );
}

/* ── CountUp — animates a number from 0 to target when in view ──────────── */
function CountUp({ value, suffix = '', prefix = '', decimals = 0, duration = 1400, style }) {
  const { animCountUp } = React.useContext(AnimContext);
  const [ref, inView] = useInView(0.5);
  const [n, setN] = React.useState(animCountUp ? 0 : value);
  React.useEffect(() => {
    if (!animCountUp) { setN(value); return; }
    if (!inView) return;
    let raf = 0, start = 0;
    const step = (ts) => {
      if (!start) start = ts;
      const t = Math.min(1, (ts - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setN(value * eased);
      if (t < 1) raf = requestAnimationFrame(step);
      else setN(value);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, duration, animCountUp]);
  const shown = decimals > 0 ? n.toFixed(decimals) : Math.round(n).toString();
  return <span ref={ref} style={style}>{prefix}{shown}{suffix}</span>;
}

/* ── DrawChart — an SVG trend line that draws itself when in view ───────── */
function DrawChart({ color = '#2AB5A2', width = 300, height = 140, strokeWidth = 3, fill = true,
                     startLabel = '92.4 kg', endLabel = '83.2 kg' }) {
  const { animChartDraw } = React.useContext(AnimContext);
  const [ref, inView] = useInView(0.4);

  const padTop = 16, padBottom = 22, padX = 4;

  // A gentle downward weight-loss trend with realistic wobble
  const pts = React.useMemo(() => {
    const data = [0.86, 0.82, 0.84, 0.76, 0.72, 0.74, 0.66, 0.6, 0.62, 0.54, 0.5, 0.44];
    const usableH = height - padTop - padBottom;
    const usableW = width - padX * 2;
    return data.map((v, i) => [
      padX + (i / (data.length - 1)) * usableW,
      padTop + (1 - v) * usableH,
    ]);
  }, [width, height]);

  const line = React.useMemo(() =>
    pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' '), [pts]);

  const drawn = !animChartDraw || inView;
  const first = pts[0], last = pts[pts.length - 1];
  const gid = React.useMemo(() => 'dc' + Math.random().toString(36).slice(2, 8), []);
  const gridY = [padTop, padTop + (height - padTop - padBottom) / 2, height - padBottom];

  return (
    <div ref={ref} style={{ position: 'relative', width: '100%', height }}>
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{ display: 'block', overflow: 'visible' }}>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.16" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Gridlines */}
        {gridY.map((y, i) => (
          <line key={i} x1="0" y1={y} x2={width} y2={y}
            stroke="#000" strokeOpacity="0.05" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        ))}
        {/* Reveal group — clip-path sweeps left→right (no getTotalLength glitch) */}
        <g style={{
          clipPath: `inset(-20% ${drawn ? 0 : 100}% -20% 0)`,
          WebkitClipPath: `inset(-20% ${drawn ? 0 : 100}% -20% 0)`,
          transition: 'clip-path 1.5s cubic-bezier(.4,0,.2,1), -webkit-clip-path 1.5s cubic-bezier(.4,0,.2,1)',
        }}>
          {fill && <path d={`${line} L${last[0]},${height - padBottom} L${first[0]},${height - padBottom} Z`} fill={`url(#${gid})`} />}
          <path d={line} fill="none" stroke={color} strokeWidth={strokeWidth}
            vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>

      {/* Start / end weight labels */}
      <div style={{ position: 'absolute', left: 0, bottom: 0, fontSize: 11, fontWeight: 600, color: '#8896A5' }}>{startLabel}</div>
      <div style={{ position: 'absolute', right: 0, bottom: 0, fontSize: 11, fontWeight: 700, color }}>{endLabel}</div>

      {/* End dot — HTML overlay so it stays perfectly round */}
      <div style={{
        position: 'absolute',
        left: `${(last[0] / width) * 100}%`,
        top: `${(last[1] / height) * 100}%`,
        width: (strokeWidth + 3) * 2, height: (strokeWidth + 3) * 2, borderRadius: '50%',
        background: color, border: '2px solid #fff', boxShadow: `0 0 0 4px ${color}22`,
        transform: `translate(-50%, -50%) scale(${drawn ? 1 : 0})`,
        transition: 'transform 0.4s cubic-bezier(.34,1.56,.64,1) 1.2s',
      }} />
    </div>
  );
}

/* ── FallingLeaves — gentle falling Althea leaves (canvas) ──────────────── */
function FallingLeaves({ color = '#2AB5A2', count = 20 }) {
  const canvasRef = React.useRef(null);
  React.useEffect(() => {
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf = 0, w = 0, h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const r = canvas.parentElement.getBoundingClientRect();
      w = r.width; h = r.height;
      canvas.width = w * dpr; canvas.height = h * dpr;
      canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement);

    const rand = (a, b) => a + Math.random() * (b - a);
    const leaves = Array.from({ length: count }, () => ({
      x: rand(0, 1), y: rand(-0.3, 1.1),
      size: rand(9, 18),
      speed: rand(0.045, 0.11),
      drift: rand(0.4, 1.1) * (Math.random() < 0.5 ? -1 : 1),
      spin: rand(-1.4, 1.4),
      phase: rand(0, Math.PI * 2),
      opacity: rand(0.18, 0.5),
      fadeStart: rand(0.45, 0.8),
    }));

    const drawLeaf = (s) => {
      // simple two-arc leaf around origin, height ~ s
      ctx.beginPath();
      ctx.moveTo(0, -s / 2);
      ctx.quadraticCurveTo(s / 2, 0, 0, s / 2);
      ctx.quadraticCurveTo(-s / 2, 0, 0, -s / 2);
      ctx.closePath();
      ctx.fill();
      // mid vein
      ctx.beginPath();
      ctx.moveTo(0, -s / 2); ctx.lineTo(0, s / 2);
      ctx.stroke();
    };

    const start = performance.now();
    const frame = (now) => {
      const t = (now - start) / 1000;
      ctx.clearRect(0, 0, w, h);
      for (const p of leaves) {
        const cycle = (p.y + t * p.speed) % 1.25;
        const prog = cycle / 1.25;              // 0 (top) → 1 (bottom)
        const yy = prog * (h + h * 0.1) - h * 0.05;
        const xx = (p.x * w) + Math.sin(t * 0.8 + p.phase) * p.drift * 22;
        const angle = p.phase + t * p.spin;
        // fade out over the lower portion of the fall, each leaf at its own point
        let alpha = p.opacity;
        if (prog > p.fadeStart) {
          alpha *= Math.max(0, 1 - (prog - p.fadeStart) / (1 - p.fadeStart));
        }
        if (alpha <= 0.01) continue;
        ctx.save();
        ctx.translate(xx, yy);
        ctx.rotate(angle);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = color;
        ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        ctx.lineWidth = 0.8;
        drawLeaf(p.size);
        ctx.restore();
      }
      if (!reduce) raf = requestAnimationFrame(frame);
    };
    if (reduce) { frame(start + 3000); } else { raf = requestAnimationFrame(frame); }

    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [color, count]);

  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />;
}

/* ── RisingBars — stepped bars that grow upward one after another on view ── */
function RisingBars({ color = '#2AB5A2', count = 28, baseDelay = 2.2 }) {
  const [ref, inView] = useInView(0.4);
  const bars = React.useMemo(() => Array.from({ length: count }, (_, i) => {
    const t = i / (count - 1);
    const wobble = Math.sin(i * 1.7) * 0.05;
    return Math.max(0.08, 0.12 + t * 0.82 + wobble); // 0..1 height, rising L→R
  }), [count]);
  return (
    <div ref={ref} style={{
      position: 'absolute', left: 0, right: 0, bottom: 0, height: '52%',
      display: 'flex', alignItems: 'flex-end', gap: 6,
      padding: '0 24px', pointerEvents: 'none',
      maskImage: 'linear-gradient(90deg, transparent, #000 15%)',
      WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 15%)',
    }}>
      {bars.map((h, i) => (
        <div key={i} style={{
          flex: 1, height: `${h * 100}%`, borderRadius: '3px 3px 0 0',
          background: `linear-gradient(180deg, ${color}55, ${color}0A)`,
          transform: `scaleY(${inView ? 1 : 0})`, transformOrigin: 'bottom',
          transition: `transform 0.7s cubic-bezier(.22,1,.36,1) ${baseDelay + i * 0.045}s`,
        }} />
      ))}
    </div>
  );
}

/* ── useParallax — returns a translateY based on element position ────────── */
function useParallax(speed = 0.12) {
  const ref = React.useRef(null);
  const [y, setY] = React.useState(0);
  const { animHeroParallax } = React.useContext(AnimContext);
  React.useEffect(() => {
    if (!animHeroParallax) { setY(0); return; }
    let raf = 0;
    const fn = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = ref.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const center = rect.top + rect.height / 2 - window.innerHeight / 2;
        setY(-center * speed);
      });
    };
    window.addEventListener('scroll', fn, { passive: true });
    fn();
    return () => { window.removeEventListener('scroll', fn); cancelAnimationFrame(raf); };
  }, [speed, animHeroParallax]);
  return [ref, y];
}

Object.assign(window, {
  AnimContext, useInView, useScrollProgress, ScrollProgressRail,
  CountUp, DrawChart, useParallax, FallingLeaves, RisingBars,
});
