/**
 * projects.js — Project Data, Interactive Filtering, 3D Tilt Effect,
 * and Case Study Modal Dialog
 * Md. Saifur Rahman Portfolio
 */

/**
 * Flagship Project Dataset (Verified with memory.md)
 */
export const FLAGSHIP_PROJECTS = [
  {
    id: 'bdsl',
    title: 'BdSLW401 — Sign Language AI Recognition',
    category: 'ai',
    coverImage: 'assets/images/projects/bdsl-cover.webp',
    tagline: 'Real-time recognition of 401 Bengali Sign Language word classes',
    description:
      'An end-to-end framework for isolated word-level Bengali Sign Language (BdSL) recognition across 401 distinct vocabulary classes. Features spatial-temporal landmark extraction using MediaPipe Holistic, a novel RQE-SF normalization algorithm, Transformer & CNN-BiLSTM Attention architectures, Explainable AI via Grad-CAM, and an optimized production pipeline. This benchmark serves as the primary final year thesis defence project at ShEC (constituent of University of Dhaka).',
    techStack: [
      'Python',
      'PyTorch',
      'MediaPipe',
      'ONNX',
      'Transformers',
      'CNN-BiLSTM',
      'Grad-CAM',
      'Jupyter'
    ],
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
    techStack: [
      'Flutter',
      'Dart',
      'ONNX Runtime',
      'MediaPipe',
      'Bangla TTS',
      'Android',
      'iOS'
    ],
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
    techStack: [
      'Python',
      'TensorFlow',
      'EfficientNet',
      'Vision Transformer',
      'MoE',
      'Grad-CAM',
      'FastAPI',
      'Docker'
    ],
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
    techStack: [
      'Flutter',
      'Dart',
      'Supabase',
      'PostgreSQL',
      'Firebase Auth',
      'Edge Functions'
    ],
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

/**
 * 1. Initialize Category Filter Tabs
 */
/**
 * Compact Projects Dataset (Tier 2/3 Open-Source Explorations from memory.md)
 */
export const COMPACT_PROJECTS = [
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

/**
 * Render compact cards into #compact-grid
 */
export function renderCompactCards() {
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

/**
 * 1. Initialize Category Filter Tabs
 */
export function initFilters() {
  const filterTabs = document.querySelectorAll('.filter-tab');

  if (filterTabs.length === 0) return;

  filterTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const filter = tab.dataset.filter || 'all';

      // Update active tab state
      filterTabs.forEach((t) => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      // Filter flagship and compact project cards
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

/**
 * 2. 3D Card Tilt with Interactive Shine Effect (Desktop only)
 */
export function initTiltEffect() {
  const isPointerDevice = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!isPointerDevice || prefersReduced) return;

  const projectCards = document.querySelectorAll('.project-card');

  projectCards.forEach((card) => {
    // Ensure card has shine element
    let shine = card.querySelector('.card-shine');
    if (!shine) {
      shine = document.createElement('div');
      shine.className = 'card-shine';
      shine.setAttribute('aria-hidden', 'true');
      card.appendChild(shine);
    }

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
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

/**
 * 3. Case Study Modal Dialog
 */
export function initModals() {
  const modal = document.getElementById('project-modal');
  const modalBody = document.getElementById('modal-body');
  const modalOverlay = document.getElementById('modal-overlay');
  const modalCloseBtn = document.getElementById('modal-close-btn');

  if (!modal || !modalBody) return;

  let lastFocusedElement = null;

  function openModal(projectId) {
    const project = FLAGSHIP_PROJECTS.find((p) => p.id === projectId);
    if (!project) return;

    lastFocusedElement = document.activeElement;

    // Render modal content
    modalBody.innerHTML = `
      <div class="modal-header">
        <img src="${project.coverImage}" alt="${project.title}" class="modal-cover" loading="lazy" />
        <div class="modal-badge-row">
          <span class="badge ${project.badgeClass}">${project.badge}</span>
          <span class="lang-badge">${project.language}</span>
        </div>
        <h2 class="modal-title" id="modal-title-text">${project.title}</h2>
      </div>

      <p class="modal-description">${project.description}</p>

      <div class="modal-highlights">
        <h3 class="modal-highlights-title">Key Innovations &amp; Highlights</h3>
        <ul role="list">
          ${project.highlights.map((h) => `<li>${h}</li>`).join('')}
        </ul>
      </div>

      <div class="modal-stack">
        <h3 class="modal-stack-title">Technologies &amp; Tools</h3>
        <div class="modal-stack-tags">
          ${project.techStack.map((t) => `<span class="tag-pill">${t}</span>`).join('')}
        </div>
      </div>

      <div class="modal-actions">
        ${
          project.githubUrl
            ? `<a href="${project.githubUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-ghost">
                 <img src="assets/icons/github.svg" alt="" width="18" height="18" />
                 View Repository
               </a>`
            : ''
        }
        ${
          project.liveUrl
            ? `<a href="${project.liveUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">
                 <img src="assets/icons/external-link.svg" alt="" width="18" height="18" />
                 Open Live Demo
               </a>`
            : ''
        }
      </div>
    `;

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Focus close button for accessibility
    setTimeout(() => {
      if (modalCloseBtn) modalCloseBtn.focus();
    }, 50);
  }

  function closeModal() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';

    if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
      lastFocusedElement.focus();
    }
  }

  // Bind clicks on Case Study buttons
  document.addEventListener('click', (e) => {
    const modalBtn = e.target.closest('[data-modal]');
    if (modalBtn) {
      e.preventDefault();
      const projectId = modalBtn.getAttribute('data-modal');
      openModal(projectId);
      return;
    }

    // Also support clicking card cover image or title to open modal
    const projectCard = e.target.closest('.project-card');
    if (projectCard) {
      // If the user clicked on a link or button inside the card, let that action happen
      if (e.target.closest('a, button')) return;

      const projectId = projectCard.getAttribute('data-project');
      if (projectId) {
        openModal(projectId);
      }
    }
  });

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeModal);
  }

  if (modalOverlay) {
    modalOverlay.addEventListener('click', closeModal);
  }

  // Keyboard accessibility: Escape to close, Tab trapping
  document.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('is-open')) return;

    if (e.key === 'Escape') {
      closeModal();
      return;
    }

    if (e.key === 'Tab') {
      const focusableElements = modal.querySelectorAll(
        'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    }
  });
}

/**
 * Initialize all project-related features.
 */
export function initProjects() {
  renderCompactCards();
  initFilters();
  initTiltEffect();
  initModals();
}
