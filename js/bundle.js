/**
 * bundle.js — Unified JavaScript Bundle for Saifur Rahman Portfolio
 * High-performance, zero-dependency, works on both HTTP/HTTPS and direct file:/// launch.
 */

(function () {
  'use strict';

  /* ══════════════════════════════════════════════════════════════
     1. THEME MODULE
     ══════════════════════════════════════════════════════════════ */
  const STORAGE_KEY = 'theme';
  const THEME_DARK = 'dark';
  const THEME_LIGHT = 'light';

  function getSavedTheme() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === THEME_DARK || saved === THEME_LIGHT) return saved;
    } catch (e) {}
    return THEME_DARK;
  }

  function applyTheme(theme, isUserToggle = false) {
    document.documentElement.dataset.theme = theme;
    const toggleBtn = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');

    if (themeIcon) {
      if (theme === THEME_DARK) {
        themeIcon.src = 'assets/icons/sun.svg';
        themeIcon.alt = 'Switch to light mode';
      } else {
        themeIcon.src = 'assets/icons/moon.svg';
        themeIcon.alt = 'Switch to dark mode';
      }
    }

    if (toggleBtn) {
      const label = theme === THEME_DARK ? 'Switch to light theme' : 'Switch to dark theme';
      toggleBtn.setAttribute('aria-label', label);
      toggleBtn.setAttribute('title', label);
    }

    if (isUserToggle) {
      // Light ripple flare animation
      const ripple = document.getElementById('theme-light-ripple');
      if (ripple) {
        ripple.classList.remove('ripple-to-light', 'ripple-to-dark');
        void ripple.offsetWidth;
        ripple.classList.add(theme === THEME_LIGHT ? 'ripple-to-light' : 'ripple-to-dark');
      }

      // Smooth transition across all ambient lights, backgrounds, borders & cards
      document.documentElement.classList.add('theme-transitioning');
      setTimeout(() => {
        document.documentElement.classList.remove('theme-transitioning');
        if (ripple) {
          ripple.classList.remove('ripple-to-light', 'ripple-to-dark');
        }
      }, 750);
    }

    window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
  }

  function initTheme() {
    applyTheme(getSavedTheme(), false);
    const toggleBtn = document.getElementById('theme-toggle');
    if (!toggleBtn) return;

    toggleBtn.addEventListener('click', () => {
      const active = document.documentElement.dataset.theme || THEME_DARK;
      const next = active === THEME_DARK ? THEME_LIGHT : THEME_DARK;

      toggleBtn.classList.remove('rotating');
      void toggleBtn.offsetWidth;
      toggleBtn.classList.add('rotating');
      setTimeout(() => toggleBtn.classList.remove('rotating'), 450);

      applyTheme(next, true);
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch (e) {}
    });
  }


  /* ══════════════════════════════════════════════════════════════
     2. AURORA SILK FLOW CANVAS
     ══════════════════════════════════════════════════════════════ */
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

  function smoothstepCanvas(a, b, t) {
    t = Math.max(0, Math.min(1, (t - a) / (b - a)));
    return t * t * (3 - 2 * t);
  }

  /* ── Silk Ribbon stream ────────────────────────────────────── */
  class SilkRibbon {
    constructor(W, H, index, total) {
      this.W = W; this.H = H;
      this.index = index; this.total = total;
      this.baseY  = (H / (total + 1)) * (index + 1);
      this.phase  = (index / total) * Math.PI * 2 + Math.random() * 0.6;
      this.speed  = 0.00025 + Math.random() * 0.00018;
      this.amp1   = 55 + Math.random() * 90;
      this.amp2   = 25 + Math.random() * 45;
      this.freq1  = 0.7 + Math.random() * 0.8;
      this.freq2  = 1.8 + Math.random() * 1.4;
      const keys  = ['primary', 'secondary', 'success'];
      this.colorKey  = keys[index % keys.length];
      // Opacity and stroke tuning — softer and feathered
      this.alpha     = 0.08 + (index % 2 === 0 ? 0.06 : 0.03);
      this.lineWidth = 1.6 + Math.random() * 1.2;
      this.glowWidth = 26 + Math.random() * 26;
    }

    getY(x, time) {
      const p = x / this.W;
      const t = time * this.speed + this.phase;
      return this.baseY
        + Math.sin(p * Math.PI * this.freq1 + t) * this.amp1
        + Math.sin(p * Math.PI * this.freq2 + t * 1.7) * this.amp2;
    }

    draw(ctx, time, palette) {
      const { r, g, b } = palette[this.colorKey] || palette.primary;
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
      this.W = w; this.H = h;
      this.baseY = (h / (this.total + 1)) * (this.index + 1);
    }
  }

  /* ── Floating aurora orb ───────────────────────────────────── */
  class AuroraOrb {
    constructor(w, h, index) {
      this.W = w; this.H = h;
      this.cx = w * (0.12 + Math.random() * 0.76);
      this.cy = h * (0.12 + Math.random() * 0.76);
      this.ampX  = 60 + Math.random() * 120;
      this.ampY  = 50 + Math.random() * 90;
      this.freqX = 0.000095 + Math.random() * 0.00008;
      this.freqY = 0.00011  + Math.random() * 0.00009;
      this.phaseX = Math.random() * Math.PI * 2;
      this.phaseY = Math.random() * Math.PI * 2;
      this.radius = 90 + Math.random() * 160;
      this.alpha  = 0.07 + Math.random() * 0.11;
      const types = ['primary', 'secondary', 'success'];
      this.colorKey = types[index % types.length];
      this.parallaxFactor = 0.012 + Math.random() * 0.022;
      this.x = this.cx; this.y = this.cy;
    }

    update(time, mouseX, mouseY) {
      this.x = this.cx + Math.sin(time * this.freqX + this.phaseX) * this.ampX;
      this.y = this.cy + Math.cos(time * this.freqY + this.phaseY) * this.ampY;
      if (mouseX >= 0) {
        const rx = (mouseX / this.W - 0.5) * 2;
        const ry = (mouseY / this.H - 0.5) * 2;
        this.x += rx * this.W * this.parallaxFactor;
        this.y += ry * this.H * this.parallaxFactor;
      }
    }

    draw(ctx, palette) {
      const { r, g, b } = palette[this.colorKey] || palette.primary;
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
      this.cx *= w / Math.max(this.W, 1);
      this.cy *= h / Math.max(this.H, 1);
      this.W = w; this.H = h;
    }
  }

  /* ── Hex shimmer grid (Batched Single-Pass Draw) ───────────── */
  class HexShimmerGrid {
    constructor(w, h) {
      this.W = w; this.H = h;
      this.cellSize = 72;
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
      const { r, g, b } = palette.primary;
      const cs = this.cellSize * 0.5;
      ctx.beginPath();
      for (let i = 0; i < this.cells.length; i++) {
        const cell = this.cells[i];
        const bri = (Math.sin(time * cell.speed + cell.phase) + 1) * 0.5;
        if (bri < 0.28) continue;
        for (let k = 0; k < 6; k++) {
          const angle = (Math.PI / 3) * k - Math.PI / 6;
          const px = cell.x + Math.cos(angle) * cs;
          const py = cell.y + Math.sin(angle) * cs;
          k === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
      }
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.032)`;
      ctx.lineWidth = 0.6;
      ctx.stroke(); // Single draw call for the entire hex grid!
    }

    resize(w, h) { this.W = w; this.H = h; this._build(w, h); }
  }

  function initCanvas() {
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
    let ribbons = [], orbs = [], hexGrid = null;
    let animFrameId = null;
    let mouseX = -1, mouseY = -1;

    const isMobile = () => W < 768;
    const RIBBON_COUNT = () => isMobile() ? 3 : 6;
    const ORB_COUNT    = () => isMobile() ? 2 : 4;

    function build(w, h) {
      ribbons = []; orbs = [];
      const rc = RIBBON_COUNT();
      const oc = ORB_COUNT();
      for (let i = 0; i < rc; i++) ribbons.push(new SilkRibbon(w, h, i, rc));
      for (let i = 0; i < oc; i++) orbs.push(new AuroraOrb(w, h, i));
      hexGrid = new HexShimmerGrid(w, h);
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const el = canvas.parentElement || document.body;
      const nW = el.offsetWidth  || window.innerWidth;
      const nH = el.offsetHeight || window.innerHeight;
      if (!nW || !nH) return;

      if (W === 0 || H === 0) {
        W = nW; H = nH;
        build(W, H);
      } else {
        W = nW; H = nH;
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
      resizeTimer = setTimeout(resize, 150);
    }, { passive: true });

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    }, { passive: true });
    window.addEventListener('mouseleave', () => { mouseX = -1; mouseY = -1; }, { passive: true });

    window.addEventListener('themechange', () => { palette = getThemePalette(); });

    function loop(now) {
      ctx.clearRect(0, 0, W, H);

      // Hex grid (deepest layer)
      if (hexGrid) hexGrid.draw(ctx, now, palette);

      // Aurora orbs (screen blend for luminous color mixing)
      ctx.globalCompositeOperation = 'screen';
      for (let i = 0; i < orbs.length; i++) {
        orbs[i].update(now, mouseX, mouseY);
        orbs[i].draw(ctx, palette);
      }
      ctx.globalCompositeOperation = 'source-over';

      // Silk ribbon streams (top layer)
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      for (let i = 0; i < ribbons.length; i++) {
        ribbons[i].draw(ctx, now, palette);
      }

      animFrameId = requestAnimationFrame(loop);
    }

    let isHeroVisible = true;

    function startLoop() {
      if (!animFrameId && isHeroVisible && !document.hidden) {
        animFrameId = requestAnimationFrame(loop);
      }
    }
    function stopLoop() {
      if (animFrameId) { cancelAnimationFrame(animFrameId); animFrameId = null; }
    }

    const target = document.getElementById('hero') || canvas;
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(entries => {
        entries.forEach(e => {
          isHeroVisible = e.isIntersecting;
          isHeroVisible ? startLoop() : stopLoop();
        });
      }, { threshold: 0.05 }).observe(target);
    } else {
      startLoop();
    }

    document.addEventListener('visibilitychange', () => {
      document.hidden ? stopLoop() : startLoop();
    });
  }

  /* ══════════════════════════════════════════════════════════════
     3. PROJECTS MODULE
     ══════════════════════════════════════════════════════════════ */
  const FLAGSHIP_PROJECTS = [
    {
      id: 'bdsl',
      title: 'BdSLW401 — Sign Language AI Recognition',
      category: 'ai',
      coverImage: 'assets/images/projects/bdsl-cover.webp',
      tagline: 'Real-time recognition of 401 Bengali Sign Language word classes',
      description:
        'An end-to-end framework for isolated word-level Bengali Sign Language (BdSL) recognition across 401 distinct vocabulary classes. Features spatial-temporal landmark extraction using MediaPipe Holistic, a novel RQE-SF normalization algorithm, Transformer & CNN-BiLSTM Attention architectures, Explainable AI via Grad-CAM, and an optimized production pipeline. This benchmark serves as the primary final year thesis defence project at ShEC (constituent of University of Dhaka).',
      techStack: ['Python', 'PyTorch', 'MediaPipe', 'ONNX', 'Transformers', 'CNN-BiLSTM', 'Grad-CAM', 'Jupyter'],
      highlights: [
        '401-class isolated word-level Bangla Sign Language benchmark (BdSLW401)',
        'Novel Relative Quantization Encoding with Shoulder Fixing (RQE-SF) normalization',
        'Dual architecture exploration: Transformer and CNN-BiLSTM with Attention mechanism',
        'Explainable AI integration using Grad-CAM heatmaps to inspect model focus',
        'End-to-end pipeline ready for export to ONNX runtime and mobile devices'
      ],
      githubUrl: 'https://github.com/saifur-rahman0/Bangla-Sign-Language-Word-Recognition',
      liveUrl: null,
      badge: 'AI Research',
      badgeClass: 'badge--ai',
      language: 'Python'
    },
    {
      id: 'signapp',
      title: 'BdSL Mobile — Sign Language App',
      category: 'mobile',
      coverImage: 'assets/images/projects/signapp-cover.webp',
      tagline: 'Cross-platform Flutter mobile app with on-device ONNX inference for BdSL',
      description:
        'A cross-platform mobile application delivering real-time Bangladeshi Sign Language word recognition directly on consumer smartphones. Powered by the BdSLW401 benchmark, it runs on-device inference using ONNX Runtime for offline reliability. Features a tactile Neumorphic design system, camera stream processing, and an integrated Bengali Text-to-Speech (TTS) engine to enable real-time communication for the speech and hearing impaired community.',
      techStack: ['Flutter', 'Dart', 'ONNX Runtime', 'MediaPipe', 'Bangla TTS', 'Android', 'iOS'],
      highlights: [
        'On-device neural inference via ONNX Runtime — functions completely offline',
        'Real-time hand and body pose tracking via camera stream integration',
        'Custom Neumorphic UI design system with tactile feedback',
        'Integrated Bengali Text-to-Speech (TTS) synthesizer for vocal translation',
        'Cross-platform architecture supporting Android and iOS'
      ],
      githubUrl: 'https://github.com/saifur-rahman0/Sign-Language-App',
      liveUrl: null,
      badge: 'Mobile AI',
      badgeClass: 'badge--mobile',
      language: 'Dart'
    },
    {
      id: 'guava',
      title: 'Guava Disease Detection AI Suite',
      category: 'ai',
      coverImage: 'assets/images/projects/guava-cover.webp',
      tagline: 'Agricultural CV system detecting diseases in guava fruits and leaves',
      description:
        'An end-to-end Computer Vision and Deep Learning system for identifying and classifying diseases affecting Guava fruits and leaves. Benchmarks multiple architectures including EfficientNet, MobileNetV2, InceptionV3, Mixture of Experts (MoE), and Vision Transformers (ViT). Provides Grad-CAM visual explanations showing diagnostic symptom regions, an interactive web interface for farmers and agronomists, and a production-ready API containerized with Docker.',
      techStack: ['Python', 'TensorFlow', 'EfficientNet', 'Vision Transformer', 'MoE', 'Grad-CAM', 'FastAPI', 'Docker'],
      highlights: [
        'Multi-architecture benchmark: EfficientNet, MobileNetV2, ViT, and Mixture of Experts',
        'Grad-CAM visual attribution highlighting fungal and bacterial lesion areas',
        'Comprehensive data augmentation and contrast normalization pipeline',
        'FastAPI REST server delivering fast sub-second classification responses',
        'Docker containerized deployment ready for edge or cloud compute'
      ],
      githubUrl: 'https://github.com/saifur-rahman0/Guava-Fruit-diseases-using-machine-learning',
      liveUrl: null,
      badge: 'Agricultural AI',
      badgeClass: 'badge--ai',
      language: 'Python'
    },
    {
      id: 'shec',
      title: 'ShEC CSE — Departmental Management App',
      category: 'mobile',
      coverImage: 'assets/images/projects/shec-cover.webp',
      tagline: 'Enterprise mobile app for Sheikh Hasina Engineering College CSE department',
      description:
        'An enterprise-grade cross-platform mobile application built for Sheikh Hasina Engineering College\'s CSE department. Streamlines campus communications, student academic progress tracking, career navigation, real-time messaging, and official administrative procedures in a single cohesive, high-performance Flutter mobile application.',
      techStack: ['Flutter', 'Dart', 'Supabase', 'PostgreSQL', 'Firebase Auth', 'Edge Functions'],
      highlights: [
        'Real-time messaging engine built on Supabase PostgreSQL websocket subscriptions',
        'Push notifications and background dispatch via Supabase Edge Functions',
        'Student academic progress tracking, CGPA calculators, and syllabus viewers',
        'Departmental event management, notices, and financial tracking',
        'Role-based permissions with Firebase authentication'
      ],
      githubUrl: 'https://github.com/saifur-rahman0/ShEC-CSE',
      liveUrl: null,
      badge: 'Enterprise Mobile',
      badgeClass: 'badge--mobile',
      language: 'Dart'
    },
    {
      id: 'etc',
      title: 'ETC Apperial Ltd — Enterprise Management Web',
      category: 'fullstack',
      coverImage: 'assets/images/projects/etc-cover.webp',
      tagline: 'Full-stack enterprise apparel management system live on Vercel',
      description:
        'A deployed full-stack web application designed for apparel manufacturing enterprise management. Features a client-server architecture with Node.js REST API backend, relational MySQL database schema, order lifecycle management, and a responsive web client for tracking inventory, production lots, and factory workflows.',
      techStack: ['Node.js', 'Express', 'MySQL', 'JavaScript', 'HTML5/CSS3', 'Vercel'],
      highlights: [
        'Live production deployment hosted on Vercel at etc-apperial-ltd-client.vercel.app',
        'Dedicated client-server architecture with modular REST API endpoints',
        'Relational schema handling purchase orders, styles, fabrics, and shipment logs',
        'Responsive enterprise UI with desktop and mobile tablet support'
      ],
      githubUrl: 'https://github.com/saifur-rahman0/ETC_Apperial_LTD_v2',
      liveUrl: 'https://etc-apperial-ltd-client.vercel.app/',
      badge: 'Full-Stack',
      badgeClass: 'badge--fullstack',
      language: 'JavaScript'
    },
    {
      id: 'ums',
      title: 'University Management System',
      category: 'systems',
      coverImage: 'assets/images/projects/ums-cover.webp',
      tagline: 'Enterprise desktop CMS/UMS in Java with MySQL backend and PDF generation',
      description:
        'A desktop enterprise University & College Management System built in Java (Swing/AWT) with a MySQL database backend. Streamlines academic administration through dedicated portals for Administrators, Faculty/Teachers, and Students, featuring real-time attendance tracking, exam grading, and automated PDF marksheet generation.',
      techStack: ['Java', 'Swing/AWT', 'MySQL', 'JDBC', 'iText PDF'],
      highlights: [
        'Multi-role access control: Administrator, Faculty/Teacher, and Student portals',
        'Automated marksheet generation with iText PDF library',
        'Real-time student attendance tracking and examination grade computation',
        'Relational database design with JDBC transaction management',
        'Comprehensive audit logging of administrative changes'
      ],
      githubUrl: 'https://github.com/saifur-rahman0/University-Management-System',
      liveUrl: null,
      badge: 'Systems / Desktop',
      badgeClass: 'badge--systems',
      language: 'Java'
    }
  ];

  const COMPACT_PROJECTS = [
    {
      id: 'video-class',
      title: 'Video Classification',
      category: 'ai',
      language: 'Python',
      icon: '🎬',
      badge: 'AI / CV',
      badgeClass: 'badge--ai',
      description: 'Action recognition on UCF101 dataset with spatial-temporal deep learning pipelines.',
      githubUrl: 'https://github.com/saifur-rahman0/Video-Classification'
    },
    {
      id: 'imdb',
      title: 'IMDB Sentiment Analysis',
      category: 'ai',
      language: 'Python',
      icon: '💬',
      badge: 'NLP',
      badgeClass: 'badge--ai',
      description: 'End-to-end NLP sentiment analysis and text classification pipeline on IMDB movie reviews.',
      githubUrl: 'https://github.com/saifur-rahman0/IMDB-Movie-Sentiment-Analysis'
    },
    {
      id: 'fashion',
      title: 'Fashion Recommendation',
      category: 'ai',
      language: 'Python',
      icon: '👗',
      badge: 'Multimodal AI',
      badgeClass: 'badge--ai',
      description: 'Multimodal fashion recommendation system combining LLMs and Computer Vision embeddings.',
      githubUrl: 'https://github.com/saifur-rahman0/fashion-recommendation'
    },
    {
      id: 'face',
      title: 'Real-Time Face Recognition',
      category: 'ai',
      language: 'Python',
      icon: '👤',
      badge: 'Computer Vision',
      badgeClass: 'badge--ai',
      description: 'Real-time webcam face identification and facial landmark tracking with custom CNN pipeline.',
      githubUrl: 'https://github.com/saifur-rahman0/Real-Time-Face-Recognition-Using-CNN'
    },
    {
      id: 'bangla-alpha',
      title: 'Bangla Handwritten Recognition',
      category: 'ai',
      language: 'Python',
      icon: '✍️',
      badge: 'OCR / AI',
      badgeClass: 'badge--ai',
      description: 'CNN-based Bangla handwritten alphabet and character OCR classification system.',
      githubUrl: 'https://github.com/saifur-rahman0/Bangla_Handwritten_Alphabet_Recognition'
    },
    {
      id: 'mnist',
      title: 'MNIST Digit Recognition',
      category: 'ai',
      language: 'Python',
      icon: '🔢',
      badge: 'Deep Learning',
      badgeClass: 'badge--ai',
      description: 'Deep neural network architecture for handwritten digit recognition on the MNIST benchmark.',
      githubUrl: 'https://github.com/saifur-rahman0/Handwritten-Digit-Recognition-MNIST'
    },
    {
      id: 'house',
      title: 'House Value Prediction',
      category: 'ai',
      language: 'Python',
      icon: '🏡',
      badge: 'Machine Learning',
      badgeClass: 'badge--ai',
      description: 'Supervised ML regression analysis with automated feature engineering for housing prices.',
      githubUrl: 'https://github.com/saifur-rahman0/House-Value-Prediction-using-Machine-Learning'
    },
    {
      id: 'todo',
      title: 'To-Do Flutter App',
      category: 'mobile',
      language: 'Dart',
      icon: '📱',
      badge: 'Mobile App',
      badgeClass: 'badge--mobile',
      description: 'Clean, responsive Flutter task management application with reactive state management.',
      githubUrl: 'https://github.com/saifur-rahman0/To-Do-Flutter-App'
    },
    {
      id: 'bmi',
      title: 'BMI Calculator Flutter',
      category: 'mobile',
      language: 'Dart',
      icon: '⚖️',
      badge: 'Mobile App',
      badgeClass: 'badge--mobile',
      description: 'Cross-platform health and BMI calculation utility engineered with Flutter UI components.',
      githubUrl: 'https://github.com/saifur-rahman0/BMI-Calculator-Flutter'
    },
    {
      id: 'competitive',
      title: 'Competitive Problem Solving',
      category: 'systems',
      language: 'C++',
      icon: '⚡',
      badge: 'Algorithms',
      badgeClass: 'badge--systems',
      description: 'Comprehensive repository of algorithmic competitive programming solutions in modern C++.',
      githubUrl: 'https://github.com/saifur-rahman0/Competitive-Problem-Solving'
    },
    {
      id: 'movie',
      title: 'Movie Ticket Booking',
      category: 'systems',
      language: 'C++',
      icon: '🎟️',
      badge: 'Systems',
      badgeClass: 'badge--systems',
      description: 'Console and database-driven ticket booking management system with MySQL backend in C++.',
      githubUrl: 'https://github.com/saifur-rahman0/Movie-Ticket-Booking-with-MySQL'
    },
    {
      id: 'arduino',
      title: 'Arduino Hardware Programs',
      category: 'systems',
      language: 'C++',
      icon: '🤖',
      badge: 'Embedded',
      badgeClass: 'badge--systems',
      description: 'Embedded systems hardware interfacing, sensor integration, and micro-controller automation in C++.',
      githubUrl: 'https://github.com/saifur-rahman0/Arduino-Program'
    }
  ];

  function renderCompactCards() {
    const compactGrid = document.getElementById('compact-grid');
    if (!compactGrid) return;

    compactGrid.innerHTML = COMPACT_PROJECTS.map(
      (project, idx) => `
      <article class="compact-card card reveal-element stagger-${(idx % 4) + 1}" role="listitem" data-category="${project.category}">
        <div class="compact-card__header">
          <span class="compact-card__icon" aria-hidden="true">${project.icon}</span>
          <span class="badge ${project.badgeClass}">${project.badge}</span>
        </div>
        <h4 class="compact-card__title">${project.title}</h4>
        <p class="compact-card__description">${project.description}</p>
        <div class="compact-card__footer">
          <span class="lang-badge">${project.language}</span>
          <a href="${project.githubUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-ghost btn-sm" aria-label="View ${project.title} repository on GitHub">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg> Code
          </a>
        </div>
      </article>
    `
    ).join('');
  }

  function initFilters() {
    const filterTabs = document.querySelectorAll('.filter-tab');
    if (filterTabs.length === 0) return;

    filterTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const filter = tab.dataset.filter || 'all';

        filterTabs.forEach((t) => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');

        const allCards = document.querySelectorAll(
          '#flagship-grid .project-card, #compact-grid .compact-card'
        );

        allCards.forEach((card) => {
          const categories = (card.dataset.category || '').toLowerCase().split(' ');
          const matches = filter === 'all' || categories.includes(filter.toLowerCase());
          if (matches) {
            card.classList.remove('is-filtered');
          } else {
            card.classList.add('is-filtered');
          }
        });
      });
    });
  }

  function initTiltEffect() {
    const isPointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!isPointer || reduced) return;

    document.querySelectorAll('.project-card').forEach((card) => {
      let shine = card.querySelector('.card-shine');
      if (!shine) {
        shine = document.createElement('div');
        shine.className = 'card-shine';
        shine.setAttribute('aria-hidden', 'true');
        card.appendChild(shine);
      }

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(1000px) rotateX(${y * -7}deg) rotateY(${x * 7}deg) translateY(-8px)`;
        shine.style.left = `${e.clientX - rect.left}px`;
        shine.style.top = `${e.clientY - rect.top}px`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  function initModals() {
    const modal = document.getElementById('project-modal');
    const modalBody = document.getElementById('modal-body');
    const modalOverlay = document.getElementById('modal-overlay');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    if (!modal || !modalBody) return;

    let lastFocused = null;

    function openModal(id) {
      const p = FLAGSHIP_PROJECTS.find((item) => item.id === id);
      if (!p) return;
      lastFocused = document.activeElement;

      modalBody.innerHTML = `
        <div class="modal-header">
          <img src="${p.coverImage}" alt="${p.title}" class="modal-cover" loading="lazy" />
          <div class="modal-badge-row">
            <span class="badge ${p.badgeClass}">${p.badge}</span>
            <span class="lang-badge">${p.language}</span>
          </div>
          <h2 class="modal-title" id="modal-title-text">${p.title}</h2>
        </div>

        <p class="modal-description">${p.description}</p>

        <div class="modal-highlights">
          <h3 class="modal-highlights-title">Key Innovations &amp; Highlights</h3>
          <ul role="list">
            ${p.highlights.map((h) => `<li>${h}</li>`).join('')}
          </ul>
        </div>

        <div class="modal-stack">
          <h3 class="modal-stack-title">Technologies &amp; Tools</h3>
          <div class="modal-stack-tags">
            ${p.techStack.map((t) => `<span class="tag-pill">${t}</span>`).join('')}
          </div>
        </div>

        <div class="modal-actions">
          ${p.githubUrl ? `<a href="${p.githubUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-ghost"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg> View Repository</a>` : ''}
          ${p.liveUrl ? `<a href="${p.liveUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg> Open Live Demo</a>` : ''}
        </div>
      `;

      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';

      setTimeout(() => {
        if (modalCloseBtn) modalCloseBtn.focus();
      }, 50);
    }

    function closeModal() {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (lastFocused && typeof lastFocused.focus === 'function') {
        lastFocused.focus();
      }
    }

    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-modal]');
      if (btn) {
        e.preventDefault();
        openModal(btn.getAttribute('data-modal'));
        return;
      }
      const card = e.target.closest('.project-card');
      if (card && !e.target.closest('a, button')) {
        const id = card.getAttribute('data-project');
        if (id) openModal(id);
      }
    });

    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
    if (modalOverlay) modalOverlay.addEventListener('click', closeModal);

    document.addEventListener('keydown', (e) => {
      if (!modal.classList.contains('is-open')) return;
      if (e.key === 'Escape') {
        closeModal();
        return;
      }
      if (e.key === 'Tab') {
        const focusable = modal.querySelectorAll('a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])');
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });
  }

  function initProjects() {
    renderCompactCards();
    initFilters();
    initTiltEffect();
    initModals();
  }

  /* ══════════════════════════════════════════════════════════════
     4. ANIMATIONS MODULE
     ══════════════════════════════════════════════════════════════ */
  function initScrollReveal() {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const elements = document.querySelectorAll('.reveal-element, .reveal-left, .reveal-right, .reveal-scale');
    if (elements.length === 0) return;

    if (reduced || !('IntersectionObserver' in window)) {
      elements.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const obs = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -50px 0px', threshold: 0.12 });

    elements.forEach((el) => obs.observe(el));
  }

  function initCounters() {
    const statElements = document.querySelectorAll('.stat-number');
    if (statElements.length === 0) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function animate(element, target, dur, suffix) {
      if (reduced) {
        element.textContent = `${target}${suffix}`;
        return;
      }
      const start = performance.now();
      function step(now) {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        element.textContent = `${Math.floor(eased * target)}${suffix}`;
        if (p < 1) requestAnimationFrame(step);
        else element.textContent = `${target}${suffix}`;
      }
      requestAnimationFrame(step);
    }

    if (!('IntersectionObserver' in window)) {
      statElements.forEach((el) => {
        el.textContent = `${el.dataset.target || 0}${el.dataset.suffix || ''}`;
      });
      return;
    }

    const obs = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.dataset.target, 10);
          const suffix = el.dataset.suffix || '';
          if (!isNaN(target)) animate(el, target, 1800, suffix);
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.4 });

    statElements.forEach((el) => obs.observe(el));
  }

  function initTypewriter() {
    const roleSpan = document.getElementById('role-switcher');
    if (!roleSpan) return;

    const roles = [
      'AI & Computer Vision Engineer',
      'Deep Learning Researcher',
      'Flutter Mobile Developer',
      'Algorithmic Problem Solver'
    ];

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      roleSpan.textContent = roles[0];
      return;
    }

    let roleIdx = 0;
    let charIdx = 0;
    let isDeleting = false;
    let timerId = null;

    function tick() {
      const current = roles[roleIdx];
      if (!isDeleting) {
        charIdx++;
        roleSpan.textContent = current.substring(0, charIdx);
        if (charIdx >= current.length) {
          isDeleting = true;
          timerId = setTimeout(tick, 2200);
          return;
        }
        timerId = setTimeout(tick, 50);
      } else {
        charIdx--;
        roleSpan.textContent = current.substring(0, charIdx);
        if (charIdx <= 0) {
          isDeleting = false;
          roleIdx = (roleIdx + 1) % roles.length;
          timerId = setTimeout(tick, 350);
          return;
        }
        timerId = setTimeout(tick, 28);
      }
    }

    timerId = setTimeout(tick, 1000);

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        clearTimeout(timerId);
      } else {
        clearTimeout(timerId);
        timerId = setTimeout(tick, 400);
      }
    });
  }

  function initScrollIndicatorFade() {
    const indicator = document.querySelector('.scroll-indicator');
    if (!indicator) return;
    let ticking = false;

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const sy = window.scrollY || window.pageYOffset;
          if (sy > 90) {
            indicator.style.opacity = '0';
            indicator.style.pointerEvents = 'none';
          } else {
            indicator.style.opacity = '';
            indicator.style.pointerEvents = '';
          }
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  function initSectionTransitions() {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const sections = document.querySelectorAll('section:not(#hero)');
    if (sections.length === 0) return;

    if (reduced || !('IntersectionObserver' in window)) {
      sections.forEach((s) => s.classList.add('section-in-view'));
      return;
    }

    const obs = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('section-in-view');
          // Clean up will-change after transition completes to preserve GPU memory
          setTimeout(() => {
            const container = entry.target.querySelector('.section-container');
            if (container) container.style.willChange = 'auto';
          }, 1200);
          observer.unobserve(entry.target);
        }
      });
    }, {
      // Fire 80px before section enters viewport bottom — starts transition early for fluid feel
      rootMargin: '0px 0px 80px 0px',
      threshold: 0.04
    });

    sections.forEach((s) => obs.observe(s));
  }

  function initAuroraParallax() {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    const auroraEl = document.querySelector('.ambient-aurora');
    if (!auroraEl) return;
    let ticking = false;

    function updateParallax() {
      const sy = window.scrollY || window.pageYOffset;
      const offset = Math.min(140, sy * 0.04);
      auroraEl.style.transform = `translate3d(0, ${-offset}px, 0)`;
      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(updateParallax);
        ticking = true;
      }
    }, { passive: true });

    updateParallax();
  }

  function initAnimations() {
    initScrollReveal();
    initCounters();
    initTypewriter();
    initScrollIndicatorFade();
    initSectionTransitions();
    initAuroraParallax();
  }


  /* ══════════════════════════════════════════════════════════════
     5. NAVIGATION MODULE
     ══════════════════════════════════════════════════════════════ */
  function initNav() {
    const navbar = document.getElementById('navbar');
    const progressBar = document.getElementById('progress-bar');
    const backToTopBtn = document.getElementById('back-to-top');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileDrawer = document.getElementById('mobile-drawer');
    const drawerOverlay = document.getElementById('drawer-overlay');
    const drawerCloseBtn = document.getElementById('drawer-close');
    const mobileLinks = document.querySelectorAll('.mobile-nav-link, #drawer-resume-btn');
    const desktopLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('main > section[id]');

    let isScrolling = false;
    function onScroll() {
      const sy = window.scrollY || window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight;
      const winHeight = window.innerHeight;
      const maxScroll = docHeight - winHeight;

      if (navbar) {
        if (sy > 50) navbar.classList.add('scrolled');
        else navbar.classList.remove('scrolled');
      }

      if (progressBar && maxScroll > 0) {
        const pct = Math.min(100, Math.max(0, (sy / maxScroll) * 100));
        progressBar.style.width = `${pct}%`;
        progressBar.setAttribute('aria-valuenow', Math.round(pct));
      }

      if (backToTopBtn) {
        if (sy > 300) backToTopBtn.classList.add('is-visible');
        else backToTopBtn.classList.remove('is-visible');
      }

      isScrolling = false;
    }

    window.addEventListener('scroll', () => {
      if (!isScrolling) {
        window.requestAnimationFrame(onScroll);
        isScrolling = true;
      }
    }, { passive: true });

    onScroll();

    if (backToTopBtn) {
      backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        const logo = document.querySelector('.nav-logo');
        if (logo) logo.focus();
      });
    }

    if (sections.length > 0 && 'IntersectionObserver' in window) {
      const obs = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            if (!id) return;
            desktopLinks.forEach((link) => {
              if (link.getAttribute('href') === `#${id}`) {
                link.classList.add('active');
                link.setAttribute('aria-current', 'page');
              } else {
                link.classList.remove('active');
                link.removeAttribute('aria-current');
              }
            });
            mobileLinks.forEach((link) => {
              if (link.classList.contains('mobile-nav-link')) {
                if (link.getAttribute('href') === `#${id}`) link.classList.add('active');
                else link.classList.remove('active');
              }
            });
          }
        });
      }, { rootMargin: '-20% 0px -60% 0px', threshold: 0 });

      sections.forEach((sec) => obs.observe(sec));
    }

    function openDrawer() {
      if (!mobileDrawer) return;
      mobileDrawer.classList.add('is-open');
      mobileDrawer.setAttribute('aria-hidden', 'false');
      if (drawerOverlay) {
        drawerOverlay.classList.add('is-active');
        drawerOverlay.setAttribute('aria-hidden', 'false');
      }
      if (mobileMenuBtn) mobileMenuBtn.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      if (drawerCloseBtn) setTimeout(() => drawerCloseBtn.focus(), 100);
    }

    function closeDrawer() {
      if (!mobileDrawer) return;
      mobileDrawer.classList.remove('is-open');
      mobileDrawer.setAttribute('aria-hidden', 'true');
      if (drawerOverlay) {
        drawerOverlay.classList.remove('is-active');
        drawerOverlay.setAttribute('aria-hidden', 'true');
      }
      if (mobileMenuBtn) {
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
        mobileMenuBtn.focus();
      }
      document.body.style.overflow = '';
    }

    if (mobileMenuBtn) {
      mobileMenuBtn.addEventListener('click', () => {
        if (mobileDrawer?.classList.contains('is-open')) closeDrawer();
        else openDrawer();
      });
    }

    if (drawerCloseBtn) drawerCloseBtn.addEventListener('click', closeDrawer);
    if (drawerOverlay) drawerOverlay.addEventListener('click', closeDrawer);

    mobileLinks.forEach((l) => l.addEventListener('click', closeDrawer));

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileDrawer?.classList.contains('is-open')) {
        closeDrawer();
      }
    });

    /* Telemetry HUD Live Dhaka Clock (UTC+6) */
    const clockEl = document.getElementById('dhaka-clock');
    if (clockEl) {
      function updateDhakaClock() {
        try {
          const now = new Date();
          const formatter = new Intl.DateTimeFormat('en-GB', {
            timeZone: 'Asia/Dhaka',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
          });
          clockEl.textContent = `DHAKA (UTC+6) ${formatter.format(now)}`;
        } catch (e) {
          const now = new Date();
          clockEl.textContent = `DHAKA (UTC+6) ${now.toLocaleTimeString()}`;
        }
      }
      updateDhakaClock();
      setInterval(updateDhakaClock, 1000);
    }
  }

  /* ══════════════════════════════════════════════════════════════
     6. CUSTOM CURSOR MODULE (Magnetic & Spotlight Physics)
     ══════════════════════════════════════════════════════════════ */
  function initCursor() {
    const isPointerFine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (!isPointerFine || isTouch) return;

    const cursorDot = document.getElementById('cursor-dot');
    const cursorRing = document.getElementById('cursor-ring');
    if (!cursorDot || !cursorRing) return;

    document.body.classList.add('custom-cursor');

    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;
    let isVisible = false;
    let isMouseDown = false;
    let animId = null;
    let isTicking = false;

    const LERP_FACTOR = 0.22;

    function renderCursor() {
      const dx = mouseX - ringX;
      const dy = mouseY - ringY;
      ringX += dx * LERP_FACTOR;
      ringY += dy * LERP_FACTOR;

      const scale = isMouseDown ? ' scale(0.8)' : '';
      cursorRing.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)${scale}`;

      // Only schedule next frame if ring has NOT yet converged on mouse position
      // When at rest, rAF stops completely to give 100% main thread to user interactions!
      if (Math.abs(dx) > 0.15 || Math.abs(dy) > 0.15) {
        animId = requestAnimationFrame(renderCursor);
      } else {
        isTicking = false;
        animId = null;
      }
    }

    function scheduleRender() {
      if (!isTicking) {
        isTicking = true;
        animId = requestAnimationFrame(renderCursor);
      }
    }

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!isVisible) {
        isVisible = true;
        cursorDot.style.opacity = '1';
        cursorRing.style.opacity = '0.65';
        ringX = mouseX;
        ringY = mouseY;
      }

      // Hardware compositor position update (0 reflows)
      cursorDot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
      scheduleRender();
    }, { passive: true });

    document.addEventListener('mouseleave', () => {
      isVisible = false;
      cursorDot.style.opacity = '0';
      cursorRing.style.opacity = '0';
      if (animId) {
        cancelAnimationFrame(animId);
        animId = null;
        isTicking = false;
      }
    }, { passive: true });

    document.addEventListener('mouseenter', () => {
      isVisible = true;
      cursorDot.style.opacity = '1';
      cursorRing.style.opacity = '0.65';
    }, { passive: true });

    document.addEventListener('mousedown', () => {
      isMouseDown = true;
      scheduleRender();
    }, { passive: true });

    document.addEventListener('mouseup', () => {
      isMouseDown = false;
      scheduleRender();
    }, { passive: true });

    const selector = 'a, button, [role="tab"], .project-card, .profile-card, .stat-card, .pillar-card, .tag-pill, .timeline-card, input, textarea';
    document.addEventListener('mouseover', (e) => {
      if (e.target && e.target.closest && e.target.closest(selector)) {
        cursorRing.classList.add('cursor-hover');
        cursorDot.classList.add('cursor-hover');
      }
    }, { passive: true });

    document.addEventListener('mouseout', (e) => {
      if (e.target && e.target.closest && e.target.closest(selector)) {
        cursorRing.classList.remove('cursor-hover');
        cursorDot.classList.remove('cursor-hover');
      }
    }, { passive: true });

    document.addEventListener('focusin', (e) => {
      if (e.target && e.target.closest && e.target.closest(selector)) {
        cursorRing.classList.add('cursor-hover');
      }
    }, { passive: true });

    document.addEventListener('focusout', () => {
      cursorRing.classList.remove('cursor-hover');
    }, { passive: true });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden && animId) {
        cancelAnimationFrame(animId);
        animId = null;
        isTicking = false;
      }
    });
  }

  /* ══════════════════════════════════════════════════════════════
     7. CONTACT FORM MODULE (Direct Send via FormSubmit AJAX)
     ══════════════════════════════════════════════════════════════ */
  function initContactForm() {
    const form = document.getElementById('contact-form');
    const submitBtn = document.getElementById('contact-submit-btn');
    const statusEl = document.getElementById('contact-status');
    if (!form || !submitBtn) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const nameInput = document.getElementById('contact-name');
      const emailInput = document.getElementById('contact-email');
      const messageInput = document.getElementById('contact-message');

      const name = nameInput ? nameInput.value.trim() : '';
      const email = emailInput ? emailInput.value.trim() : '';
      const message = messageInput ? messageInput.value.trim() : '';

      if (!name || !email || !message) {
        if (statusEl) {
          statusEl.textContent = 'Please fill in your name, email, and message.';
          statusEl.className = 'contact-status is-error';
        }
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        if (statusEl) {
          statusEl.textContent = 'Please provide a valid email address.';
          statusEl.className = 'contact-status is-error';
        }
        return;
      }

      submitBtn.disabled = true;
      const btnText = submitBtn.querySelector('.btn-text');
      const originalText = btnText ? btnText.textContent : 'Send Message';
      if (btnText) btnText.textContent = 'Sending Message...';

      if (statusEl) {
        statusEl.textContent = 'Sending your message directly...';
        statusEl.className = 'contact-status is-pending';
      }

      try {
        const response = await fetch('https://formsubmit.co/ajax/rahmansaifur064@gmail.com', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            name: name,
            email: email,
            message: message,
            _subject: `New Portfolio Message from ${name} (${email})`,
            _template: 'table',
            _captcha: 'false'
          })
        });

        const data = await response.json();

        if (response.ok && (data.success === 'true' || data.success === true || response.status === 200)) {
          if (statusEl) {
            statusEl.textContent = '✓ Message sent successfully! Thank you, Saifur will get back to you soon.';
            statusEl.className = 'contact-status is-success';
          }
          form.reset();
        } else {
          throw new Error(data.message || 'Delivery error');
        }
      } catch (err) {
        console.warn('Direct AJAX submission fallback to mail client:', err);
        const subject = encodeURIComponent(`Portfolio Inquiry from ${name}`);
        const body = encodeURIComponent(`Hi Saifur,\n\n${message}\n\n---\nSender: ${name}\nReply Email: ${email}`);
        window.location.href = `mailto:rahmansaifur064@gmail.com?subject=${subject}&body=${body}`;

        if (statusEl) {
          statusEl.textContent = '✓ Message prepared! Your email client has been launched. Thank you!';
          statusEl.className = 'contact-status is-success';
        }
      } finally {
        submitBtn.disabled = false;
        if (btnText) btnText.textContent = originalText;
      }
    });
  }

  /* ══════════════════════════════════════════════════════════════
     BOOTSTRAP ENTRY POINT
     ══════════════════════════════════════════════════════════════ */
  function start() {
    initTheme();
    initCanvas();
    initProjects();
    initAnimations();
    initNav();
    initCursor();
    initContactForm();

    console.info(
      '%c⚡ Saifur Rahman Portfolio active. Built with Vanilla Web Standards.',
      'color: #00d4ff; font-weight: bold; font-size: 12px;'
    );
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
