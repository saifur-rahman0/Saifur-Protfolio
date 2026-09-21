/**
 * cursor.js — Ultra-High Performance Fluid Cursor (GPU-Accelerated)
 * Zero DOM Invalidation · Compositor Transforms · rAF Spotlight Physics
 * Md. Saifur Rahman Portfolio
 */

/**
 * Initialize custom glowing cursor with magnetic interaction and card spotlights.
 */
export function initCursor() {
  // Only enable on non-touch devices with fine pointer
  const isPointerFine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  if (!isPointerFine || isTouch) {
    return;
  }

  const cursorDot = document.getElementById('cursor-dot');
  const cursorRing = document.getElementById('cursor-ring');

  if (!cursorDot || !cursorRing) return;

  // Activate custom cursor styling on body (initializes display: block without layout recalc)
  document.body.classList.add('custom-cursor');

  let mouseX = -100;
  let mouseY = -100;
  let ringX = -100;
  let ringY = -100;
  let isVisible = false;
  let isMouseDown = false;
  let animId = null;

  // Pending physics targets for rAF update (avoids layout thrashing in raw mousemove)
  let pendingCard = null;
  let pendingCardClientX = 0;
  let pendingCardClientY = 0;

  let activeMagneticEl = null;
  let pendingMagClientX = 0;
  let pendingMagClientY = 0;

  // Track mouse coordinates
  window.addEventListener(
    'mousemove',
    (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!isVisible) {
        isVisible = true;
        cursorDot.style.opacity = '1';
        cursorRing.style.opacity = '0.65';
        ringX = mouseX;
        ringY = mouseY;
      }

      // 1. Stage card spotlight for rAF tick
      const card = e.target.closest(
        '.card, .project-card, .pillar-card, .stat-card, .profile-card, .timeline-card'
      );
      if (card) {
        pendingCard = card;
        pendingCardClientX = e.clientX;
        pendingCardClientY = e.clientY;
      } else {
        pendingCard = null;
      }

      // 2. Stage magnetic pull for rAF tick
      const magneticTarget = e.target.closest(
        '.btn, .filter-tab, .social-icon, .nav-logo, #theme-toggle, .tag-pill'
      );
      if (magneticTarget) {
        activeMagneticEl = magneticTarget;
        pendingMagClientX = e.clientX;
        pendingMagClientY = e.clientY;
      } else if (activeMagneticEl) {
        activeMagneticEl.style.transform = '';
        activeMagneticEl = null;
      }
    },
    { passive: true }
  );

  // Smooth GPU spring lerp loop
  const LERP_FACTOR = 0.18;

  function renderCursor() {
    if (isVisible) {
      ringX += (mouseX - ringX) * LERP_FACTOR;
      ringY += (mouseY - ringY) * LERP_FACTOR;

      const scale = isMouseDown ? ' scale(0.8)' : '';

      // Pure GPU compositor translate — no top/left reflow
      cursorDot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
      cursorRing.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)${scale}`;

      // Update card spotlight on animation frame (smooth 60fps, zero thrash)
      if (pendingCard) {
        const rect = pendingCard.getBoundingClientRect();
        pendingCard.style.setProperty('--mouse-x', `${pendingCardClientX - rect.left}px`);
        pendingCard.style.setProperty('--mouse-y', `${pendingCardClientY - rect.top}px`);
      }

      // Update magnetic spring on animation frame
      if (activeMagneticEl) {
        const rect = activeMagneticEl.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const deltaX = (pendingMagClientX - centerX) * 0.22;
        const deltaY = (pendingMagClientY - centerY) * 0.22;
        activeMagneticEl.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
      }
    }

    animId = requestAnimationFrame(renderCursor);
  }

  animId = requestAnimationFrame(renderCursor);

  // Hide cursor when leaving window
  document.addEventListener('mouseleave', () => {
    isVisible = false;
    cursorDot.style.opacity = '0';
    cursorRing.style.opacity = '0';
    if (activeMagneticEl) {
      activeMagneticEl.style.transform = '';
      activeMagneticEl = null;
    }
  });

  document.addEventListener('mouseenter', () => {
    isVisible = true;
    cursorDot.style.opacity = '1';
    cursorRing.style.opacity = '0.65';
  });

  // Mouse press effect
  document.addEventListener('mousedown', () => {
    isMouseDown = true;
  });

  document.addEventListener('mouseup', () => {
    isMouseDown = false;
  });

  // Interactive element hover states — targets ONLY the cursor elements directly.
  // NEVER modifies document.body.classList to prevent full-DOM style invalidations (fixes 240ms INP).
  const interactiveSelector =
    'a, button, [role="tab"], .project-card, .profile-card, .stat-card, .pillar-card, .tag-pill, .timeline-card, input, textarea';

  document.addEventListener(
    'mouseover',
    (e) => {
      if (e.target.closest(interactiveSelector)) {
        cursorRing.classList.add('cursor-hover');
        cursorDot.classList.add('cursor-hover');
      }
    },
    { passive: true }
  );

  document.addEventListener(
    'mouseout',
    (e) => {
      if (e.target.closest(interactiveSelector)) {
        cursorRing.classList.remove('cursor-hover');
        cursorDot.classList.remove('cursor-hover');
      }
    },
    { passive: true }
  );

  // Clean keyboard navigation (tabbing) without body recalcs
  document.addEventListener(
    'focusin',
    (e) => {
      if (e.target.closest && e.target.closest(interactiveSelector)) {
        cursorRing.classList.add('cursor-hover');
      }
    },
    { passive: true }
  );

  document.addEventListener(
    'focusout',
    () => {
      cursorRing.classList.remove('cursor-hover');
    },
    { passive: true }
  );

  // Clean up if tab is hidden
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && animId) {
      cancelAnimationFrame(animId);
      animId = null;
    } else if (!document.hidden && !animId) {
      animId = requestAnimationFrame(renderCursor);
    }
  });
}
