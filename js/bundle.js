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

  function applyTheme(theme) {
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

    window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
  }

  function initTheme() {
    applyTheme(getSavedTheme());
    const toggleBtn = document.getElementById('theme-toggle');
    if (!toggleBtn) return;

    toggleBtn.addEventListener('click', () => {
      const active = document.documentElement.dataset.theme || THEME_DARK;
      const next = active === THEME_DARK ? THEME_LIGHT : THEME_DARK;

      toggleBtn.classList.remove('rotating');
      void toggleBtn.offsetWidth;
      toggleBtn.classList.add('rotating');
      setTimeout(() => toggleBtn.classList.remove('rotating'), 450);

      applyTheme(next);
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch (e) {}
    });
  }

  /* ══════════════════════════════════════════════════════════════
     2. NEURAL CANVAS MODULE
     ══════════════════════════════════════════════════════════════ */
  function parseColorToRgb(colorStr) {
    const fallback = { r: 0, g: 212, b: 255 };
    if (!colorStr) return fallback;
    const trimmed = colorStr.trim();

    if (trimmed.startsWith('#')) {
      let hex = trimmed.slice(1);
      if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('');
      if (hex.length === 6) {
        const num = parseInt(hex, 16);
        return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
      }
    }

    const rgbMatch = trimmed.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
    if (rgbMatch) {
      return { r: parseInt(rgbMatch[1], 10), g: parseInt(rgbMatch[2], 10), b: parseInt(rgbMatch[3], 10) };
    }
    return fallback;
  }

  function getAccentRgb() {
    const computed = getComputedStyle(document.documentElement);
    const colorStr = computed.getPropertyValue('--accent-primary') || '#00d4ff';
    return parseColorToRgb(colorStr);
  }

  class CanvasNode {
    constructor(w, h, speedMul = 0.4) {
      this.x = Math.random() * w;
      this.y = Math.random() * h;
      const angle = Math.random() * Math.PI * 2;
      const speed = (0.2 + Math.random() * 0.8) * speedMul;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
      this.radius = 1.5 + Math.random() * 2.0;
      this.baseOpacity = 0.35 + Math.random() * 0.45;
    }

    update(mx, my, w, h, mRad, mForce) {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0) { this.x = 0; this.vx = Math.abs(this.vx); }
      else if (this.x > w) { this.x = w; this.vx = -Math.abs(this.vx); }

      if (this.y < 0) { this.y = 0; this.vy = Math.abs(this.vy); }
      else if (this.y > h) { this.y = h; this.vy = -Math.abs(this.vy); }

      if (mx >= 0 && my >= 0) {
        const dx = mx - this.x;
        const dy = my - this.y;
        const dist = Math.hypot(dx, dy);
        if (dist < mRad && dist > 2) {
          const pull = (1 - dist / mRad) * mForce;
          this.x += dx * pull;
          this.y += dy * pull;
        }
      }
    }

    draw(ctx, rgb) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${this.baseOpacity})`;
      ctx.fill();
    }
  }

  function initCanvas() {
    const canvas = document.getElementById('neural-canvas');
    if (!canvas) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      canvas.style.display = 'none';
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let nodes = [];
    let animFrameId = null;
    let currentRgb = getAccentRgb();
    let mouseX = -9999;
    let mouseY = -9999;
    const MOUSE_RADIUS = 180;
    const MOUSE_FORCE = 0.02;
    const MAX_LINE_DIST = 140;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.parentElement ? canvas.parentElement.offsetWidth : window.innerWidth;
      height = canvas.parentElement ? canvas.parentElement.offsetHeight : window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.resetTransform?.();
      ctx.scale(dpr, dpr);

      const targetCount = width < 768 ? 45 : 85;
      nodes = [];
      for (let i = 0; i < targetCount; i++) {
        nodes.push(new CanvasNode(width, height));
      }
    }

    resize();

    let resizeTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 150);
    });

    window.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    });

    window.addEventListener('mouseleave', () => {
      mouseX = -9999;
      mouseY = -9999;
    });

    window.addEventListener('themechange', () => {
      currentRgb = getAccentRgb();
    });

    function loop() {
      ctx.clearRect(0, 0, width, height);
      const count = nodes.length;
      const { r, g, b } = currentRgb;

      for (let i = 0; i < count; i++) {
        const a = nodes[i];
        a.update(mouseX, mouseY, width, height, MOUSE_RADIUS, MOUSE_FORCE);

        for (let j = i + 1; j < count; j++) {
          const bNode = nodes[j];
          const dist = Math.hypot(a.x - bNode.x, a.y - bNode.y);
          if (dist < MAX_LINE_DIST) {
            const alpha = (1 - dist / MAX_LINE_DIST) * 0.22;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(bNode.x, bNode.y);
            ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
            ctx.lineWidth = 0.9;
            ctx.stroke();
          }
        }

        if (mouseX >= 0 && mouseY >= 0) {
          const mDist = Math.hypot(a.x - mouseX, a.y - mouseY);
          if (mDist < MOUSE_RADIUS) {
            const mAlpha = (1 - mDist / MOUSE_RADIUS) * 0.35;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(mouseX, mouseY);
            ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${mAlpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }

        a.draw(ctx, currentRgb);
      }

      animFrameId = requestAnimationFrame(loop);
    }

    animFrameId = requestAnimationFrame(loop);

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        if (animFrameId) {
          cancelAnimationFrame(animFrameId);
          animFrameId = null;
        }
      } else if (!animFrameId) {
        animFrameId = requestAnimationFrame(loop);
      }
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
        'Live production deployment hosted on Vercel at etc-apperial-ltd-v2.vercel.app',
        'Dedicated client-server architecture with modular REST API endpoints',
        'Relational schema handling purchase orders, styles, fabrics, and shipment logs',
        'Responsive enterprise UI with desktop and mobile tablet support'
      ],
      githubUrl: 'https://github.com/saifur-rahman0/ETC_Apperial_LTD_v2',
      liveUrl: 'https://etc-apperial-ltd-v2.vercel.app',
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
            <img src="assets/icons/github.svg" alt="" width="14" height="14" /> Code
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
          ${p.githubUrl ? `<a href="${p.githubUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-ghost"><img src="assets/icons/github.svg" alt="" width="18" height="18" /> View Repository</a>` : ''}
          ${p.liveUrl ? `<a href="${p.liveUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary"><img src="assets/icons/external-link.svg" alt="" width="18" height="18" /> Open Live Demo</a>` : ''}
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
            indicator.style.opacity = '1';
            indicator.style.pointerEvents = '';
          }
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  function initAnimations() {
    initScrollReveal();
    initCounters();
    initTypewriter();
    initScrollIndicatorFade();
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
  }

  /* ══════════════════════════════════════════════════════════════
     6. CUSTOM CURSOR MODULE
     ══════════════════════════════════════════════════════════════ */
  function initCursor() {
    const isPointerFine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (!isPointerFine || isTouch) return;

    const cursorDot = document.getElementById('cursor-dot');
    const cursorRing = document.getElementById('cursor-ring');
    if (!cursorDot || !cursorRing) return;

    document.body.classList.add('custom-cursor');

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    let isVisible = false;
    let animId = null;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!isVisible) {
        isVisible = true;
        cursorDot.style.opacity = '1';
        cursorRing.style.opacity = '0.6';
        ringX = mouseX;
        ringY = mouseY;
      }
      cursorDot.style.left = `${mouseX}px`;
      cursorDot.style.top = `${mouseY}px`;
    }, { passive: true });

    function renderCursor() {
      if (isVisible) {
        ringX += (mouseX - ringX) * 0.16;
        ringY += (mouseY - ringY) * 0.16;
        cursorRing.style.left = `${ringX}px`;
        cursorRing.style.top = `${ringY}px`;
      }
      animId = requestAnimationFrame(renderCursor);
    }

    animId = requestAnimationFrame(renderCursor);

    document.addEventListener('mouseleave', () => {
      isVisible = false;
      cursorDot.style.opacity = '0';
      cursorRing.style.opacity = '0';
    });

    document.addEventListener('mouseenter', () => {
      isVisible = true;
      cursorDot.style.opacity = '1';
      cursorRing.style.opacity = '0.6';
    });

    const selector = 'a, button, [role="tab"], .project-card, .profile-card, .stat-card, .pillar-card, .tag-pill, input, textarea';
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(selector)) document.body.classList.add('cursor-hover');
    }, { passive: true });

    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(selector)) document.body.classList.remove('cursor-hover');
    }, { passive: true });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden && animId) {
        cancelAnimationFrame(animId);
        animId = null;
      } else if (!document.hidden && !animId) {
        animId = requestAnimationFrame(renderCursor);
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
