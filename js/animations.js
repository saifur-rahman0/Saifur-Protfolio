/**
 * animations.js — Scroll Reveal, Stat Counters, Role Typewriter,
 * and Hero Animations
 * Md. Saifur Rahman Portfolio
 */

/**
 * 1. Scroll Reveal Animations via IntersectionObserver
 */
export function initScrollReveal() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealElements = document.querySelectorAll(
    '.reveal-element, .reveal-left, .reveal-right, .reveal-scale'
  );

  if (revealElements.length === 0) return;

  if (prefersReduced || !('IntersectionObserver' in window)) {
    revealElements.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -50px 0px',
    threshold: 0.12
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      }
    });
  }, observerOptions);

  revealElements.forEach((el) => observer.observe(el));
}

/**
 * 2. Animated Numerical Stat Counters
 */
export function initCounters() {
  const statElements = document.querySelectorAll('.stat-number');
  if (statElements.length === 0) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function animateCounter(element, target, duration = 1800, suffix = '') {
    if (prefersReduced) {
      element.textContent = `${target}${suffix}`;
      return;
    }

    const start = performance.now();

    function step(timestamp) {
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);

      // Cubic ease-out: 1 - (1 - t)^3
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const currentVal = Math.floor(easedProgress * target);

      element.textContent = `${currentVal}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        element.textContent = `${target}${suffix}`;
      }
    }

    requestAnimationFrame(step);
  }

  if (!('IntersectionObserver' in window)) {
    statElements.forEach((el) => {
      const target = parseInt(el.dataset.target, 10) || 0;
      const suffix = el.dataset.suffix || '';
      el.textContent = `${target}${suffix}`;
    });
    return;
  }

  const counterObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.dataset.target, 10);
          const suffix = el.dataset.suffix || '';

          if (!isNaN(target)) {
            animateCounter(el, target, 1800, suffix);
          }

          obs.unobserve(el);
        }
      });
    },
    { threshold: 0.4 }
  );

  statElements.forEach((el) => counterObserver.observe(el));
}

/**
 * 3. Typewriter Role Switcher
 */
export function initTypewriter() {
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

  const TYPING_SPEED = 50; // ms per character
  const DELETING_SPEED = 28; // ms per character deletion
  const HOLD_DURATION = 2200; // ms to pause on completed word
  const PAUSE_BEFORE_NEXT = 350; // ms pause before typing next word

  function tick() {
    const currentRole = roles[roleIdx];

    if (!isDeleting) {
      charIdx++;
      roleSpan.textContent = currentRole.substring(0, charIdx);

      if (charIdx >= currentRole.length) {
        // Word complete: hold
        isDeleting = true;
        timerId = setTimeout(tick, HOLD_DURATION);
        return;
      }
      timerId = setTimeout(tick, TYPING_SPEED);
    } else {
      charIdx--;
      roleSpan.textContent = currentRole.substring(0, charIdx);

      if (charIdx <= 0) {
        // Deletion complete: move to next word
        isDeleting = false;
        roleIdx = (roleIdx + 1) % roles.length;
        timerId = setTimeout(tick, PAUSE_BEFORE_NEXT);
        return;
      }
      timerId = setTimeout(tick, DELETING_SPEED);
    }
  }

  // Start after hero sequence has begun
  timerId = setTimeout(tick, 1000);

  // Clean up if tab becomes hidden or re-visible
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      clearTimeout(timerId);
    } else {
      clearTimeout(timerId);
      timerId = setTimeout(tick, 400);
    }
  });
}

/**
 * 4. Hero Scroll Indicator Fade on Scroll
 */
export function initScrollIndicatorFade() {
  const indicator = document.querySelector('.scroll-indicator');
  if (!indicator) return;

  let ticking = false;

  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY || window.pageYOffset;
          if (scrollY > 90) {
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
    },
    { passive: true }
  );
}

/**
 * 5. Hero Animation Trigger Fallback
 */
export function initHeroAnimation() {
  // CSS handles .hero-animate-1 to .hero-animate-6 via animations.css
  // This ensures they are given a subtle entrance fallback on browsers with delays
  const heroElements = document.querySelectorAll('[class*="hero-animate-"]');
  heroElements.forEach((el) => {
    el.style.willChange = 'opacity, transform';
  });
}

/**
 * 6. About Section Developer Console Tabs (Auto-switching + Interactive)
 */
export function initAboutConsoleTabs() {
  const consoleCard = document.querySelector('.about-card--console');
  const tabs = document.querySelectorAll('.console-tab');
  const panels = document.querySelectorAll('.console-panel');
  if (!tabs.length || !panels.length) return;

  let currentIndex = 0;
  let autoTimer = null;
  const SWITCH_INTERVAL = 3800; // 3.8s per tab

  function activateTab(index) {
    currentIndex = index;
    const tab = tabs[index];
    if (!tab) return;
    const targetPanelId = tab.getAttribute('aria-controls');

    tabs.forEach((t, i) => {
      const isActive = i === index;
      t.classList.toggle('is-active', isActive);
      t.setAttribute('aria-selected', isActive ? 'true' : 'false');
      t.setAttribute('tabindex', isActive ? '0' : '-1');
    });

    panels.forEach((panel) => {
      if (panel.id === targetPanelId) {
        panel.classList.add('is-active');
        panel.removeAttribute('hidden');
      } else {
        panel.classList.remove('is-active');
        panel.setAttribute('hidden', '');
      }
    });
  }

  function startAutoSwitch() {
    stopAutoSwitch();
    autoTimer = setInterval(() => {
      const nextIndex = (currentIndex + 1) % tabs.length;
      activateTab(nextIndex);
    }, SWITCH_INTERVAL);
  }

  function stopAutoSwitch() {
    if (autoTimer) {
      clearInterval(autoTimer);
      autoTimer = null;
    }
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => {
      activateTab(index);
      startAutoSwitch();
    });

    tab.addEventListener('keydown', (e) => {
      let nextIndex = null;

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        nextIndex = (index + 1) % tabs.length;
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        nextIndex = (index - 1 + tabs.length) % tabs.length;
      }

      if (nextIndex !== null) {
        e.preventDefault();
        tabs[nextIndex].focus();
        activateTab(nextIndex);
        startAutoSwitch();
      }
    });
  });

  if (consoleCard) {
    consoleCard.addEventListener('mouseenter', stopAutoSwitch);
    consoleCard.addEventListener('mouseleave', startAutoSwitch);
  }

  startAutoSwitch();
}

/**
 * Initialize all animation controllers.
 */
export function initAnimations() {
  initHeroAnimation();
  initScrollReveal();
  initCounters();
  initTypewriter();
  initScrollIndicatorFade();
  initAboutConsoleTabs();
}
