/**
 * cursor.js — Custom Fluid Cursor with Magnetic Lerp & Card Spotlight Physics
 * (Desktop pointer devices only)
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

  // Activate custom cursor styling on body
  document.body.classList.add('custom-cursor');

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;
  let isVisible = false;
  let animId = null;

  // Track active magnetic element
  let activeMagneticEl = null;

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

      // Immediate position update for center dot
      cursorDot.style.left = `${mouseX}px`;
      cursorDot.style.top = `${mouseY}px`;

      // 1. Dynamic 3D Spotlight reflection on hovered cards
      const card = e.target.closest('.card, .project-card, .pillar-card, .stat-card, .profile-card, .timeline-card');
      if (card) {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
        card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
      }

      // 2. Magnetic pull on buttons, filter tabs, and social badges
      const magneticTarget = e.target.closest('.btn, .filter-tab, .social-icon, .nav-logo, #theme-toggle, .tag-pill');
      if (magneticTarget) {
        activeMagneticEl = magneticTarget;
        const rect = magneticTarget.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const deltaX = (e.clientX - centerX) * 0.22;
        const deltaY = (e.clientY - centerY) * 0.22;

        magneticTarget.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
      } else if (activeMagneticEl) {
        activeMagneticEl.style.transform = '';
        activeMagneticEl = null;
      }
    },
    { passive: true }
  );

  // Smooth spring lerp loop for the outer trailing ring
  const LERP_FACTOR = 0.18;

  function renderCursor() {
    if (isVisible) {
      ringX += (mouseX - ringX) * LERP_FACTOR;
      ringY += (mouseY - ringY) * LERP_FACTOR;

      cursorRing.style.left = `${ringX}px`;
      cursorRing.style.top = `${ringY}px`;
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
    cursorRing.style.transform = 'translate(-50%, -50%) scale(0.8)';
  });

  document.addEventListener('mouseup', () => {
    cursorRing.style.transform = 'translate(-50%, -50%) scale(1)';
  });

  // Interactive element hover states via event delegation
  const interactiveSelector =
    'a, button, [role="tab"], .project-card, .profile-card, .stat-card, .pillar-card, .tag-pill, .timeline-card, input, textarea';

  document.addEventListener(
    'mouseover',
    (e) => {
      if (e.target.closest(interactiveSelector)) {
        document.body.classList.add('cursor-hover');
      }
    },
    { passive: true }
  );

  document.addEventListener(
    'mouseout',
    (e) => {
      if (e.target.closest(interactiveSelector)) {
        document.body.classList.remove('cursor-hover');
      }
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
