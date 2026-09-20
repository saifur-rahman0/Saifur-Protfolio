/**
 * cursor.js — Custom Fluid Cursor with Magnetic Lerp Interpolation
 * (Desktop pointer devices only)
 * Md. Saifur Rahman Portfolio
 */

/**
 * Initialize custom glowing cursor.
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

  // Track mouse coordinates
  window.addEventListener(
    'mousemove',
    (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!isVisible) {
        isVisible = true;
        cursorDot.style.opacity = '1';
        cursorRing.style.opacity = '0.6';
        ringX = mouseX;
        ringY = mouseY;
      }

      // Immediate position update for center dot
      cursorDot.style.left = `${mouseX}px`;
      cursorDot.style.top = `${mouseY}px`;
    },
    { passive: true }
  );

  // Smooth lerp loop for the outer trailing ring
  const LERP_FACTOR = 0.16;

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
  });

  document.addEventListener('mouseenter', () => {
    isVisible = true;
    cursorDot.style.opacity = '1';
    cursorRing.style.opacity = '0.6';
  });

  // Interactive element hover states via event delegation
  const interactiveSelector =
    'a, button, [role="tab"], .project-card, .profile-card, .stat-card, .pillar-card, .tag-pill, input, textarea';

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
