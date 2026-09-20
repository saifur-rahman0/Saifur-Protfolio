/**
 * theme.js — Dark / Light Theme Management
 * Md. Saifur Rahman Portfolio
 */

const STORAGE_KEY = 'theme';
const THEME_DARK = 'dark';
const THEME_LIGHT = 'light';

/**
 * Safely retrieve saved theme from localStorage.
 * Defaults to 'dark'.
 * @returns {string} 'dark' | 'light'
 */
function getSavedTheme() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === THEME_DARK || saved === THEME_LIGHT) {
      return saved;
    }
  } catch (err) {
    console.warn('localStorage is unavailable for theme preference:', err);
  }
  return THEME_DARK;
}

/**
 * Apply theme to document element and update UI toggle icon.
 * @param {string} theme - 'dark' | 'light'
 */
export function applyTheme(theme) {
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
    toggleBtn.setAttribute(
      'aria-label',
      theme === THEME_DARK ? 'Switch to light theme' : 'Switch to dark theme'
    );
    toggleBtn.setAttribute(
      'title',
      theme === THEME_DARK ? 'Switch to light theme' : 'Switch to dark theme'
    );
  }

  // Notify other modules (e.g. neural canvas) about theme change
  window.dispatchEvent(
    new CustomEvent('themechange', { detail: { theme } })
  );
}

/**
 * Initialize theme and bind event listeners.
 */
export function initTheme() {
  const currentTheme = getSavedTheme();
  applyTheme(currentTheme);

  const toggleBtn = document.getElementById('theme-toggle');
  if (!toggleBtn) return;

  toggleBtn.addEventListener('click', () => {
    const activeTheme = document.documentElement.dataset.theme || THEME_DARK;
    const newTheme = activeTheme === THEME_DARK ? THEME_LIGHT : THEME_DARK;

    // Trigger icon spin animation
    toggleBtn.classList.remove('rotating');
    void toggleBtn.offsetWidth; // Force reflow
    toggleBtn.classList.add('rotating');
    setTimeout(() => {
      toggleBtn.classList.remove('rotating');
    }, 450);

    applyTheme(newTheme);

    try {
      localStorage.setItem(STORAGE_KEY, newTheme);
    } catch (err) {
      console.warn('Failed to save theme to localStorage:', err);
    }
  });
}
