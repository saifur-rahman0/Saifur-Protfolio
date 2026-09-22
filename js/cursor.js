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
  let isTicking = false;

  const LERP_FACTOR = 0.22;

  function renderCursor() {
    const dx = mouseX - ringX;
    const dy = mouseY - ringY;
    ringX += dx * LERP_FACTOR;
    ringY += dy * LERP_FACTOR;

    const scale = isMouseDown ? ' scale(0.8)' : '';
    cursorRing.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)${scale}`;

    // Only continue rAF while ring is catching up — stops immediately when resting
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

      cursorDot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
      scheduleRender();
    },
    { passive: true }
  );

  // Hide cursor when leaving window
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

  // Mouse press effect
  document.addEventListener('mousedown', () => {
    isMouseDown = true;
    scheduleRender();
  }, { passive: true });

  document.addEventListener('mouseup', () => {
    isMouseDown = false;
    scheduleRender();
  }, { passive: true });

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
