/**
 * main.js — Application Bootstrap & Orchestrator
 * Md. Saifur Rahman Portfolio
 *
 * Vanilla HTML5 + CSS3 + ES6 Modules
 */

import { initTheme } from './theme.js';
import { initCanvas } from './canvas.js';
import { initAnimations } from './animations.js';
import { initNav } from './nav.js';
import { initProjects } from './projects.js';
import { initCursor } from './cursor.js';

/**
 * Bootstrap all application subsystems in priority order.
 */
function initApp() {
  // 1. Theme (apply theme preference first to ensure proper styling)
  initTheme();

  // 2. Neural particle simulation canvas for hero section
  initCanvas();

  // 3. Project cards, category filters, 3D tilt, and case study modal dialog
  initProjects();

  // 4. Page load sequences, scroll reveals, counters, and typewriter
  initAnimations();

  // 5. Navigation bar, scroll progress, mobile drawer, and back-to-top
  initNav();

  // 6. Fluid cursor for desktop pointer environments
  initCursor();

  console.info(
    '%c⚡ Saifur Rahman Portfolio loaded successfully. Built with Vanilla Web Standards.',
    'color: #00d4ff; font-weight: bold; font-size: 12px;'
  );
}

// Ensure execution occurs once DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
