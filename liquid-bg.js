// liquid-bg.js — self-playing teal liquid field (WebGL metaballs) behind the phone stage.
// Motion runs on its own slow clock; scroll only fades it in and out.
// window.createLiquidLayer({ container, color, intensity }) -> { setProgress, dispose }
(function () {
  const VERT = `attribute vec2 aP;void main(){gl_Position=vec4(aP,0.0,1.0);}`;

  const FRAG = `precision highp float;
uniform vec2 uRes;uniform float uTime,uRate,uAmp;uniform vec3 uC1,uC2,uC3;
float h(float n){return fract(sin(n*127.1+13.7)*43758.5453);}
void main(){
  vec2 uv=(gl_FragCoord.xy-0.5*uRes)/min(uRes.x,uRes.y);
  float t=uTime;
  float cyc=uTime*uRate, u=fract(cyc);

  /* the water never regroups: every drop drifts one way across the stage and is
     replaced from behind, and the flow axis turns each scene so successive
     passes arrive from a new direction */
  float ax=cyc*0.62+0.35;                         // flow axis turns continuously
  vec2 axis=vec2(cos(ax),sin(ax)), perp=vec2(-axis.y,axis.x);
  float flow=cyc*0.46+t*0.012;                    // monotonic — no reset per scene
  float front=mix(-1.15,1.15,smoothstep(0.0,0.88,u));
  float stir=0.55+0.45*sin(cyc*3.14159);          // pass intensity, never zeroes out

  /* liquid domain warp — slow swell plus finer ripple around the moving front */
  vec2 w=uv;
  w+=0.10*axis*sin(dot(uv,perp)*2.9+t*0.38+flow*1.6);
  w+=0.075*perp*cos(dot(uv,axis)*2.5-t*0.31);
  w+=(0.026+0.026*stir)*vec2(sin(uv.y*6.1-t*0.82),cos(uv.x*5.4+t*0.67));
  float dw=dot(w,axis)-front;
  float wake=exp(-dw*dw*4.5);
  w+=perp*wake*0.085*sin(dot(w,axis)*11.0-t*2.4);

  float field=0.0;
  for(int i=0;i<13;i++){
    float fi=float(i);
    /* travel along the axis, wrapping with a fade so nothing pops or piles up */
    float s=fract(h(fi)+flow*(0.55+0.5*h(fi+9.0)));
    float wt=smoothstep(0.0,0.20,s)*(1.0-smoothstep(0.80,1.0,s));
    float along=mix(-1.30,1.30,s);
    /* held off the centre line so the mass passes above/below, not behind */
    float pv=h(fi+5.0)*2.0-1.0;
    float across=sign(pv)*(0.17+0.55*abs(pv));
    across+=0.16*sin(t*(0.31+0.13*h(fi))+fi*1.7);
    along+=0.10*cos(t*(0.26+0.12*h(fi+1.0))+fi*2.2);

    vec2 p=axis*along+perp*across;
    /* the front shoves whatever it moves through, then lets it go */
    float d=along-front;
    float shove=exp(-d*d*5.5)*stir;
    p+=axis*shove*0.14+perp*shove*0.085*sin(fi*3.3+t*1.4);

    float r=(0.082+0.048*h(fi+3.0))*(0.88+0.22*sin(t*0.5+fi));
    p.y*=0.74;                                     // wide, shallow pool for a 16:9 stage
    vec2 q=w-p;
    /* smeared along the flow, so drops read as moving liquid rather than dots */
    float qa=dot(q,axis)/(1.45+0.55*shove), qp=dot(q,perp);
    field+=wt*r*r/(qa*qa+qp*qp+0.0006);
  }

  /* soft ink wash the drops swim in, so the field reads as depth not decals */
  float wash=exp(-dot(w,w)*1.5)*(0.55+0.45*sin(dot(w,perp)*2.2+t*0.3));
  /* soft void behind the phone — the water flows around it, never banks up on it */
  float hole=smoothstep(0.45,1.30,length(uv/vec2(0.32,0.62)));
  field*=mix(0.12,1.0,hole);
  wash*=mix(0.40,1.0,hole);

  float glow=smoothstep(0.14,1.20,field);
  float body=smoothstep(0.58,1.30,field);
  float rim=smoothstep(0.74,0.98,field)-smoothstep(0.98,1.45,field);
  float depth=clamp((field-0.7)*0.55,0.0,1.0);

  /* teal gradient across the whole field, deep on one side, lit on the other */
  float gd=0.19*t;
  float g=clamp(0.5+0.74*dot(uv,vec2(cos(gd),sin(gd)*0.5-0.6))+0.12*(w.y-uv.y),0.0,1.0);
  vec3 col=mix(uC1,uC2,smoothstep(0.0,0.58,g));
  col=mix(col,uC3,smoothstep(0.48,1.0,g));
  col=mix(col,mix(uC1,uC2,0.35),depth*0.30);      // thicker water reads deeper
  col+=uC3*rim*0.10;

  float alpha=glow*0.17+body*0.31+rim*0.03+wash*0.075;
  float vig=1.0-smoothstep(0.50,1.22,length(uv*vec2(0.72,1.0)));
  alpha*=mix(0.28,1.0,vig)*uAmp;
  gl_FragColor=vec4(col*alpha,max(alpha,0.0));
}`;

  function hex2rgb(hex) {
    const s = String(hex).replace('#', '');
    const n = parseInt(s.length === 3 ? s.split('').map(c => c + c).join('') : s, 16);
    return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
  }
  const mixc = (a, b, k) => a.map((v, i) => v + (b[i] - v) * k);

  function compile(gl, type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  }

  window.createLiquidLayer = function ({ container, color = '#2AB5A2', rate = 0.055, intensity = 1 }) {
    const canvas = document.createElement('canvas');
    Object.assign(canvas.style, {
      position: 'absolute', inset: '0', width: '100%', height: '100%',
      display: 'block', pointerEvents: 'none',
    });
    const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false, depth: false });
    if (!gl) return null;
    container.appendChild(canvas);

    const prog = gl.createProgram();
    gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const aP = gl.getAttribLocation(prog, 'aP');
    gl.enableVertexAttribArray(aP);
    gl.vertexAttribPointer(aP, 2, gl.FLOAT, false, 0, 0);

    const U = n => gl.getUniformLocation(prog, n);
    const uRes = U('uRes'), uTime = U('uTime'), uAmp = U('uAmp');

    const base = hex2rgb(color);
    gl.uniform3fv(U('uC1'), mixc([0.02, 0.10, 0.11], base, 0.30));   // deep water
    gl.uniform3fv(U('uC2'), base);                                    // brand teal
    gl.uniform3fv(U('uC3'), mixc(base, [0.90, 1.0, 0.98], 0.55));     // lit crest
    gl.uniform1f(U('uRate'), rate);                                   // cycles/sec — own clock

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const scale = 0.72 * Math.min(window.devicePixelRatio || 1, 1.6);
    let w = 0, h = 0;
    function resize() {
      const r = container.getBoundingClientRect();
      const nw = Math.max(1, Math.round(r.width * scale)), nh = Math.max(1, Math.round(r.height * scale));
      if (nw === w && nh === h) return;
      w = nw; h = nh; canvas.width = w; canvas.height = h;
      gl.viewport(0, 0, w, h);
      gl.uniform2f(uRes, w, h);
    }
    resize();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null;
    if (ro) ro.observe(container); else window.addEventListener('resize', resize);

    let p = 0, shown = 0, raf = 0, dead = false, visible = true;
    const t0 = performance.now();
    const io = typeof IntersectionObserver !== 'undefined'
      ? new IntersectionObserver(es => { visible = es[0].isIntersecting; }, { rootMargin: '20%' })
      : null;
    if (io) io.observe(container);

    function frame() {
      if (dead) return;
      raf = requestAnimationFrame(frame);
      if (!visible) return;
      resize();
      shown += (p - shown) * 0.07;                       // scroll only drives the fade
      const t = reduce ? 4 : (performance.now() - t0) / 1000;
      // full strength from the very top; fades out only before the section ends
      const amp = intensity * (1 - Math.max(0, (shown - 0.94) / 0.06));
      gl.uniform1f(uTime, t);
      gl.uniform1f(uAmp, Math.max(0, amp));
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    raf = requestAnimationFrame(frame);

    return {
      canvas,
      setProgress(v) { p = Math.max(0, Math.min(1, v)); },
      dispose() {
        dead = true; cancelAnimationFrame(raf);
        if (io) io.disconnect();
        if (ro) ro.disconnect(); else window.removeEventListener('resize', resize);
        try { gl.getExtension('WEBGL_lose_context')?.loseContext(); } catch (e) {}
        canvas.remove();
      },
    };
  };
})();
