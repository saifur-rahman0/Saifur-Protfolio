/**
 * canvas.js — Aurora Silk Flow Canvas
 * Md. Saifur Rahman Portfolio
 *
 * Elegant, gorgeous, complex-but-clean background:
 *   - Multi-layered luminous silk ribbon flows (Lissajous-inspired bezier streams)
 *   - Soft floating light orbs with radial glow halos
 *   - Subtle animated hex/grid shimmer layer
 *   - Smooth mouse parallax displacement on orbs
 *   - IntersectionObserver lifecycle (0% CPU when off-screen)
 */

/**
 * Parse CSS color string → {r, g, b}
 */
function parseColorToRgb(str) {
  const fb = { r: 0, g: 242, b: 254 };
  if (!str) return fb;
  const s = str.trim();
  if (s.startsWith('#')) {
    let h = s.slice(1);
    if (h.length === 3) h = h.split('').map(c => c + c).join('');
    if (h.length === 6) {
      const n = parseInt(h, 16);
      return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
    }
  }
  const m = s.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (m) return { r: +m[1], g: +m[2], b: +m[3] };
  return fb;
}

function getThemePalette() {
  const cs = getComputedStyle(document.documentElement);
  return {
    primary:   parseColorToRgb(cs.getPropertyValue('--accent-primary')   || '#00f2fe'),
    secondary: parseColorToRgb(cs.getPropertyValue('--accent-secondary')  || '#7928ca'),
    success:   parseColorToRgb(cs.getPropertyValue('--accent-success')    || '#00ff88'),
    isLight:   document.documentElement.dataset.theme === 'light'
  };
}

/**
 * Smooth-step interpolation helper
 */
function smoothstep(a, b, t) {
  t = Math.max(0, Math.min(1, (t - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

/**
 * A luminous silk ribbon stream — an animated bezier path with soft glowing stroke.
 * Each ribbon flows across the canvas following organic sinusoidal offsets.
 */
class SilkRibbon {
  constructor(canvasW, canvasH, index, total, palette) {
    this.W = canvasW;
    this.H = canvasH;
    this.index = index;
    this.total = total;

    // Each ribbon has a base Y position spread across the canvas
    this.baseY = (canvasH / (total + 1)) * (index + 1);

    // Unique phase/speed offsets for organic, non-repeating feel
    this.phase    = (index / total) * Math.PI * 2 + Math.random() * 0.6;
    this.speed    = 0.00025 + Math.random() * 0.00018;
    this.amp1     = 55 + Math.random() * 90;   // Primary vertical amplitude
    this.amp2     = 25 + Math.random() * 45;   // Secondary ripple amplitude
    this.freq1    = 0.7 + Math.random() * 0.8; // Primary frequency multiplier
    this.freq2    = 1.8 + Math.random() * 1.4; // Secondary frequency multiplier
    this.waveLen  = canvasW * (0.55 + Math.random() * 0.55); // Horizontal wavelength

    // Color — cycle through palette per ribbon
    const colorKeys = ['primary', 'secondary', 'success'];
    this.colorKey = colorKeys[index % colorKeys.length];

    // Opacity and stroke tuning — softer and feathered
    this.alpha = 0.08 + (index % 2 === 0 ? 0.06 : 0.03);
    this.lineWidth = 1.6 + Math.random() * 1.2;

    // Ribbon width (it's a "fat" stroke drawn as area)
    this.glowWidth = 26 + Math.random() * 26;
  }

  getY(x, time) {
    const progress = x / this.W;
    const t = time * this.speed + this.phase;
    return this.baseY
      + Math.sin(progress * Math.PI * this.freq1 + t) * this.amp1
      + Math.sin(progress * Math.PI * this.freq2 + t * 1.7) * this.amp2;
  }

  draw(ctx, time, palette) {
    const rgb = palette[this.colorKey] || palette.primary;
    const { r, g, b } = rgb;
    const steps = Math.ceil(this.W / 16);

    // Curve points
    const pts = [];
    for (let i = 0; i <= steps; i++) {
      const x = (i / steps) * this.W;
      const y = this.getY(x, time);
      pts.push({ x, y });
    }

    // Horizontal fade-out gradients — fades out at left and right borders of the screen
    const gradGlow = ctx.createLinearGradient(0, 0, this.W, 0);
    gradGlow.addColorStop(0.00, `rgba(${r}, ${g}, ${b}, 0)`);
    gradGlow.addColorStop(0.12, `rgba(${r}, ${g}, ${b}, ${this.alpha * 0.15})`);
    gradGlow.addColorStop(0.30, `rgba(${r}, ${g}, ${b}, ${this.alpha * 0.50})`);
    gradGlow.addColorStop(0.60, `rgba(${r}, ${g}, ${b}, ${this.alpha * 0.75})`);
    gradGlow.addColorStop(0.82, `rgba(${r}, ${g}, ${b}, ${this.alpha * 0.55})`);
    gradGlow.addColorStop(0.92, `rgba(${r}, ${g}, ${b}, ${this.alpha * 0.18})`);
    gradGlow.addColorStop(1.00, `rgba(${r}, ${g}, ${b}, 0)`);

    const gradCore = ctx.createLinearGradient(0, 0, this.W, 0);
    gradCore.addColorStop(0.00, `rgba(${r}, ${g}, ${b}, 0)`);
    gradCore.addColorStop(0.10, `rgba(${r}, ${g}, ${b}, ${this.alpha * 0.18})`);
    gradCore.addColorStop(0.28, `rgba(${r}, ${g}, ${b}, ${this.alpha * 0.55})`);
    gradCore.addColorStop(0.60, `rgba(${r}, ${g}, ${b}, ${this.alpha * 1.25})`);
    gradCore.addColorStop(0.82, `rgba(${r}, ${g}, ${b}, ${this.alpha * 0.90})`);
    gradCore.addColorStop(0.92, `rgba(${r}, ${g}, ${b}, ${this.alpha * 0.25})`);
    gradCore.addColorStop(1.00, `rgba(${r}, ${g}, ${b}, 0)`);

    // 1. Broad soft ambient aura (wide, diffused — zero hard borders)
    ctx.beginPath();
    for (let i = 0; i < pts.length; i++) {
      i === 0 ? ctx.moveTo(pts[i].x, pts[i].y) : ctx.lineTo(pts[i].x, pts[i].y);
    }
    ctx.strokeStyle = gradGlow;
    ctx.lineWidth = this.glowWidth;
    ctx.lineCap = 'round';
    ctx.stroke();

    // 2. Mid silk body flow
    ctx.beginPath();
    for (let i = 0; i < pts.length; i++) {
      i === 0 ? ctx.moveTo(pts[i].x, pts[i].y) : ctx.lineTo(pts[i].x, pts[i].y);
    }
    ctx.strokeStyle = gradGlow;
    ctx.lineWidth = Math.max(8, this.glowWidth * 0.4);
    ctx.stroke();

    // 3. Smooth crest stroke (feathered via gradient, zero shadowBlur CPU stall)
    ctx.beginPath();
    for (let i = 0; i < pts.length; i++) {
      i === 0 ? ctx.moveTo(pts[i].x, pts[i].y) : ctx.lineTo(pts[i].x, pts[i].y);
    }
    ctx.strokeStyle = gradCore;
    ctx.lineWidth = this.lineWidth;
    ctx.stroke();
  }

  resize(w, h) {
    this.W = w;
    this.H = h;
    this.baseY = (h / (this.total + 1)) * (this.index + 1);
  }
}

/**
 * A floating glowing orb — a radial gradient sphere that drifts in a Lissajous pattern.
 */
class AuroraOrb {
  constructor(w, h, index) {
    this.W = w;
    this.H = h;

    // Unique center position
    this.cx = w * (0.12 + Math.random() * 0.76);
    this.cy = h * (0.12 + Math.random() * 0.76);

    // Lissajous-style drift parameters
    this.ampX  = 60 + Math.random() * 120;
    this.ampY  = 50 + Math.random() * 90;
    this.freqX = 0.000095 + Math.random() * 0.00008;
    this.freqY = 0.00011  + Math.random() * 0.00009;
    this.phaseX = Math.random() * Math.PI * 2;
    this.phaseY = Math.random() * Math.PI * 2;

    // Size & visual
    this.radius = 90 + Math.random() * 160;
    this.alpha  = 0.07 + Math.random() * 0.11;

    const types = ['primary', 'secondary', 'success'];
    this.colorKey = types[index % types.length];

    // Mouse parallax sensitivity (each orb has slightly different depth)
    this.parallaxFactor = 0.012 + Math.random() * 0.022;

    this.x = this.cx;
    this.y = this.cy;
  }

  update(time, mouseX, mouseY) {
    // Lissajous drift
    this.x = this.cx + Math.sin(time * this.freqX + this.phaseX) * this.ampX;
    this.y = this.cy + Math.cos(time * this.freqY + this.phaseY) * this.ampY;

    // Subtle mouse parallax
    if (mouseX >= 0) {
      const relX = (mouseX / this.W - 0.5) * 2;
      const relY = (mouseY / this.H - 0.5) * 2;
      this.x += relX * this.W * this.parallaxFactor;
      this.y += relY * this.H * this.parallaxFactor;
    }
  }

  draw(ctx, palette) {
    const rgb = palette[this.colorKey] || palette.primary;
    const { r, g, b } = rgb;

    const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
    grad.addColorStop(0,   `rgba(${r}, ${g}, ${b}, ${this.alpha * 1.6})`);
    grad.addColorStop(0.4, `rgba(${r}, ${g}, ${b}, ${this.alpha * 0.7})`);
    grad.addColorStop(1,   `rgba(${r}, ${g}, ${b}, 0)`);

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
  }

  resize(w, h) {
    const scaleX = w / Math.max(this.W, 1);
    const scaleY = h / Math.max(this.H, 1);
    this.cx *= scaleX;
    this.cy *= scaleY;
    this.W = w;
    this.H = h;
  }
}

/**
 * Subtle animated hexagonal/diamond shimmer grid — batched single-pass draw.
 */
class HexShimmerGrid {
  constructor(w, h) {
    this.W = w;
    this.H = h;
    this.cellSize = 72;
    this.speed = 0.00018;
    this.cells = [];
    this._build(w, h);
  }

  _build(w, h) {
    this.cells = [];
    const cs = this.cellSize;
    const cols = Math.ceil(w / cs) + 2;
    const rows = Math.ceil(h / (cs * 0.866)) + 2;

    for (let row = -1; row < rows; row++) {
      for (let col = -1; col < cols; col++) {
        const offset = (row % 2 === 0) ? 0 : cs * 0.5;
        this.cells.push({
          x: col * cs + offset,
          y: row * cs * 0.866,
          phase: Math.random() * Math.PI * 2,
          speed: 0.00010 + Math.random() * 0.00012
        });
      }
    }
  }

  draw(ctx, time, palette) {
    const { primary } = palette;
    const { r, g, b } = primary;
    const cs = this.cellSize * 0.5;

    ctx.beginPath();
    for (let i = 0; i < this.cells.length; i++) {
      const cell = this.cells[i];
      const brightness = (Math.sin(time * cell.speed + cell.phase) + 1) * 0.5;
      if (brightness < 0.28) continue;

      const x = cell.x;
      const y = cell.y;

      for (let k = 0; k < 6; k++) {
        const angle = (Math.PI / 3) * k - Math.PI / 6;
        const px = x + Math.cos(angle) * cs;
        const py = y + Math.sin(angle) * cs;
        k === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
    }
    ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.032)`;
    ctx.lineWidth = 0.6;
    ctx.stroke(); // Batched single stroke
  }

  resize(w, h) {
    this.W = w;
    this.H = h;
    this._build(w, h);
  }
}

/**
 * Initialize Aurora Silk Flow Canvas.
 */
export function initCanvas() {
  const canvas = document.getElementById('neural-canvas');
  if (!canvas) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    canvas.style.display = 'none';
    return;
  }

  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  let W = 0, H = 0;
  let palette = getThemePalette();
  let ribbons = [];
  let orbs = [];
  let hexGrid = null;
  let animFrameId = null;
  let mouseX = -1, mouseY = -1;

  const RIBBON_COUNT = window.innerWidth < 768 ? 4 : 7;
  const ORB_COUNT    = window.innerWidth < 768 ? 3 : 5;

  function build(w, h) {
    ribbons = [];
    orbs    = [];
    for (let i = 0; i < RIBBON_COUNT; i++) {
      ribbons.push(new SilkRibbon(w, h, i, RIBBON_COUNT, palette));
    }
    for (let i = 0; i < ORB_COUNT; i++) {
      orbs.push(new AuroraOrb(w, h, i));
    }
    hexGrid = new HexShimmerGrid(w, h);
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const el = canvas.parentElement || document.body;
    const newW = el.offsetWidth  || window.innerWidth;
    const newH = el.offsetHeight || window.innerHeight;
    if (!newW || !newH) return;

    if (W === 0 || H === 0) {
      W = newW; H = newH;
      build(W, H);
    } else {
      const scaleX = newW / W;
      const scaleY = newH / H;
      W = newW; H = newH;
      ribbons.forEach(r => r.resize(W, H));
      orbs.forEach(o => o.resize(W, H));
      if (hexGrid) hexGrid.resize(W, H);
    }

    canvas.width  = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    canvas.style.width  = `${W}px`;
    canvas.style.height = `${H}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  resize();

  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 120);
  });

  // Mouse tracking
  window.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
  });
  window.addEventListener('mouseleave', () => { mouseX = -1; mouseY = -1; });

  // Palette hot-swap on theme change
  window.addEventListener('themechange', () => { palette = getThemePalette(); });

  // ── Render loop ──────────────────────────────────────────────
  function render(now) {
    ctx.clearRect(0, 0, W, H);

    // 1. Hex shimmer grid (bottom-most, very faint)
    if (hexGrid) hexGrid.draw(ctx, now, palette);

    // 2. Aurora orbs (glowing depth layer)
    ctx.globalCompositeOperation = 'screen';
    for (let i = 0; i < orbs.length; i++) {
      orbs[i].update(now, mouseX, mouseY);
      orbs[i].draw(ctx, palette);
    }
    ctx.globalCompositeOperation = 'source-over';

    // 3. Silk ribbon streams (top layer)
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (let i = 0; i < ribbons.length; i++) {
      ribbons[i].draw(ctx, now, palette);
    }

    animFrameId = requestAnimationFrame(render);
  }

  // ── Lifecycle ──────────────────────────────────────────────
  let isHeroVisible = true;

  function start() {
    if (!animFrameId && isHeroVisible && !document.hidden) {
      animFrameId = requestAnimationFrame(render);
    }
  }
  function stop() {
    if (animFrameId) {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }
  }

  const target = document.getElementById('hero') || canvas;
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      entries.forEach(e => {
        isHeroVisible = e.isIntersecting;
        isHeroVisible ? start() : stop();
      });
    }, { threshold: 0.05 }).observe(target);
  } else {
    start();
  }

  document.addEventListener('visibilitychange', () => {
    document.hidden ? stop() : start();
  });
}
