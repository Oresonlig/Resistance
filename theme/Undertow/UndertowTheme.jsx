// undertow.jsx — Void's first LIGHT theme. "Undertow."
// You are suspended mid-water, sinking, looking UP at a bright dappled surface
// you can't reach. Sun-from-below palette: cool white-blue at the surface fading
// to a deeper steel below. Caustics ripple across the top. Bubbles escape in
// bursts (your breath leaving you) then stillness. A waterline creeps upward.
// Abyss navy is the deep — and the color of commitment (LOG / DONE pull you under).
//
// No-nonsense / clinical: Archivo grotesque + DM Mono instrument readouts.
// Shape language = a dive-computer: frosted glass, hairline strokes, gauge motifs.
// Keeps the original Void app's copy verbatim.

// ---------- background: caustics + light shafts + waterline ----------
function CausticLayer() {
  // SVG fractal-noise turbulence, displacing a soft luminance field, animated.
  // Reads as rippling underwater light. Masked brighter toward the surface (top).
  return (
    <svg className="ut-caustics" viewBox="0 0 380 760" preserveAspectRatio="xMidYMid slice"
         aria-hidden="true">
      <defs>
        <radialGradient id="ut-surface-glow" cx="50%" cy="-4%" r="82%">
          <stop offset="0%"  stopColor="#ffffff" stopOpacity="1" />
          <stop offset="20%" stopColor="#ffffff" stopOpacity="0.75" />
          <stop offset="44%" stopColor="#e6f2f7" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#e6f2f7" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="ut-caustic-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="22%" stopColor="#ffffff" stopOpacity="1" />
          <stop offset="68%" stopColor="#ffffff" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.15" />
        </linearGradient>
        <mask id="ut-caustic-mask">
          <rect width="380" height="760" fill="url(#ut-caustic-fade)" />
        </mask>

        <filter id="ut-caustic" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.015 0.024" numOctaves="2"
                        seed="7" stitchTiles="stitch" result="noise" />
          {/* push noise into thin bright ridges */}
          <feColorMatrix in="noise" type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -8.5 4.6" result="ridges" />
          <feGaussianBlur in="ridges" stdDeviation="0.5" result="soft" />
          <feComponentTransfer in="soft" result="caustic">
            <feFuncA type="gamma" amplitude="1" exponent="1.4" offset="0" />
          </feComponentTransfer>
          <feFlood floodColor="#ffffff" result="white" />
          <feComposite in="white" in2="soft" operator="in" />
        </filter>
      </defs>

      {/* bright surface bloom */}
      <rect width="380" height="760" fill="url(#ut-surface-glow)" />

      {/* the rippling caustic net, masked to fade with depth (static) */}
      <g style={{ mixBlendMode: 'screen' }}>
        <rect x="-40" y="-40" width="460" height="840" filter="url(#ut-caustic)" opacity="0.6"
              mask="url(#ut-caustic-mask)" />
      </g>

      {/* static light shafts from the surface (sun from below) */}
      <g style={{ mixBlendMode: 'screen' }}>
        <polygon points="60,-20 120,-20 230,520 150,520" fill="#ffffff" opacity="0.18" />
        <polygon points="180,-20 214,-20 286,500 232,500" fill="#ffffff" opacity="0.14" />
        <polygon points="250,-20 300,-20 360,470 300,470" fill="#eaf4f8" opacity="0.12" />
      </g>
    </svg>
  );
}

// rising/creeping waterline — a faint refractive band that very slowly drifts up
function Waterline() {
  return <div className="ut-waterline" aria-hidden="true"></div>;
}

// ---------- bubble bursts (canvas) ----------
function BubbleField() {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0, h = 0, raf = 0, alive = true;

    function size() {
      const p = canvas.parentElement;
      w = p.clientWidth; h = p.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    size();
    const ro = new ResizeObserver(size);
    ro.observe(canvas.parentElement);

    const rand = (a, b) => a + Math.random() * (b - a);
    const bubbles = [];

    function gasp(intensity) {
      const ox = rand(w * 0.22, w * 0.78);
      const oy = h - rand(-10, 30);
      const n = Math.floor(rand(16, 28) * intensity);
      for (let i = 0; i < n; i++) {
        const big = Math.random() < 0.22;
        const r = big ? rand(4.5, 9.5) : rand(0.9, 3.4);
        const ang = -Math.PI / 2 + rand(-0.85, 0.85);
        const speed = (big ? rand(2.2, 3.8) : rand(1.4, 3.0)) + r * 0.05;
        bubbles.push({
          x: ox + rand(-22, 22), y: oy + rand(-12, 16), r,
          vx: Math.cos(ang) * speed, vy: Math.sin(ang) * speed,
          drift: rand(-0.1, 0.1), wobP: rand(0, Math.PI * 2),
          wobS: rand(0.02, 0.05), wobA: rand(0.3, 1.1),
          a: rand(0.45, 0.82), decel: rand(0.93, 0.97),
          term: -(rand(0.25, 0.55) + r * 0.02),
        });
      }
    }

    let mode = 'quiet', timer = 500, pulses = 0;
    function schedule() {
      timer -= 16;
      if (timer > 0) return;
      if (mode === 'quiet') {
        pulses = Math.floor(rand(2, 5)) - 1;
        gasp(rand(1.0, 1.5));
        mode = 'gasp';
        timer = rand(120, 280);
      } else if (pulses > 0) {
        gasp(rand(0.55, 1.0));
        pulses--;
        timer = rand(120, 280);
      } else {
        mode = 'quiet';
        timer = rand(2600, 5200);
      }
    }

    function tick() {
      if (!alive) return;
      ctx.clearRect(0, 0, w, h);
      schedule();
      for (let i = bubbles.length - 1; i >= 0; i--) {
        const b = bubbles[i];
        b.wobP += b.wobS;
        b.vy *= b.decel; b.vx *= 0.94;
        if (b.vy > b.term) b.vy = b.term;
        b.y += b.vy;
        b.x += b.vx + b.drift + Math.sin(b.wobP) * b.wobA * 0.12;
        const depth = b.y / h;
        let a = b.a * Math.min(1, depth * 1.6);
        if (b.y < -10 || b.x < -24 || b.x > w + 24) { bubbles.splice(i, 1); continue; }
        ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${a * 0.14})`; ctx.fill();
        ctx.lineWidth = Math.max(0.6, b.r * 0.16);
        ctx.strokeStyle = `rgba(24, 56, 92, ${a * 0.5})`; ctx.stroke();
        ctx.beginPath(); ctx.arc(b.x - b.r * 0.3, b.y - b.r * 0.32, Math.max(0.5, b.r * 0.3), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${a * 0.95})`; ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    }
    tick();
    return () => { alive = false; cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);
  return <canvas ref={ref} className="ut-bubbles" aria-hidden="true"></canvas>;
}

// ---------- glyphs ----------
function GaugeSigil({ size = 26 }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} fill="none" className="ut-gauge">
      <circle cx="16" cy="16" r="13.2" stroke="#163763" strokeWidth="1.3" />
      <circle cx="16" cy="16" r="9.4" stroke="#163763" strokeWidth="0.5" strokeOpacity="0.4" />
      {[0,45,90,135,180,225,270,315].map((d, i) => {
        const a = (d - 90) * Math.PI / 180;
        const r1 = 13.2, r2 = i % 2 ? 11.4 : 10.6;
        return <line key={i} x1={16+Math.cos(a)*r1} y1={16+Math.sin(a)*r1} x2={16+Math.cos(a)*r2} y2={16+Math.sin(a)*r2} stroke="#163763" strokeWidth="0.7" strokeOpacity="0.55" />;
      })}
      <g className="ut-needle" style={{ transformOrigin: '16px 16px' }}>
        <line x1="16" y1="16" x2="16" y2="26.5" stroke="#163763" strokeWidth="1.4" strokeLinecap="round" />
        <line x1="16" y1="16" x2="16" y2="9" stroke="#9e4a45" strokeWidth="1" strokeLinecap="round" />
      </g>
      <circle cx="16" cy="16" r="1.7" fill="#163763" />
    </svg>
  );
}

function DropGlyph() {
  return (
    <svg viewBox="0 0 16 16" width="13" height="13" fill="none">
      <circle cx="8" cy="8" r="5" stroke="#163763" strokeWidth="0.9" strokeOpacity="0.6" />
      <circle cx="6.2" cy="6.2" r="1.5" fill="#ffffff" stroke="#163763" strokeWidth="0.4" strokeOpacity="0.5" />
    </svg>
  );
}

Object.assign(window, { CausticLayer, Waterline, BubbleField, GaugeSigil, DropGlyph });
