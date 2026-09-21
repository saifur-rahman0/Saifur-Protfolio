/**
 * nav.js — Navigation Bar, Mobile Drawer, Active Link Highlighting,
 * Scroll Progress Bar, and Back-to-Top Button
 * Md. Saifur Rahman Portfolio
 */

/**
 * Initialize all navigation and scroll-related interactions.
 */
export function initNav() {
  const navbar = document.getElementById('navbar');
  const progressBar = document.getElementById('progress-bar');
  const backToTopBtn = document.getElementById('back-to-top');

  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const drawerOverlay = document.getElementById('drawer-overlay');
  const drawerCloseBtn = document.getElementById('drawer-close');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link, #drawer-resume-btn');

  const desktopNavLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('main > section[id]');

  /* ──────────────────────────────────────────────────────────
     1. Sticky Navbar, Scroll Progress & Back-to-Top
     ────────────────────────────────────────────────────────── */
  let isScrolling = false;

  function handleScroll() {
    const scrollY = window.scrollY || window.pageYOffset;
    const docHeight = document.documentElement.scrollHeight;
    const winHeight = window.innerHeight;
    const scrollableHeight = docHeight - winHeight;

    // Sticky navbar glass background (> 50px)
    if (navbar) {
      if (scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }

    // Scroll progress bar
    if (progressBar && scrollableHeight > 0) {
      const scrollPercent = Math.min(100, Math.max(0, (scrollY / scrollableHeight) * 100));
      progressBar.style.width = `${scrollPercent}%`;
      progressBar.setAttribute('aria-valuenow', Math.round(scrollPercent));
    }

    // Back-to-top button (> 300px)
    if (backToTopBtn) {
      if (scrollY > 300) {
        backToTopBtn.classList.add('is-visible');
      } else {
        backToTopBtn.classList.remove('is-visible');
      }
    }

    isScrolling = false;
  }

  window.addEventListener(
    'scroll',
    () => {
      if (!isScrolling) {
        window.requestAnimationFrame(handleScroll);
        isScrolling = true;
      }
    },
    { passive: true }
  );

  // Initial call on load
  handleScroll();

  // Smooth scroll to top on back-to-top button click
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      // Return focus to top / main logo for accessibility
      const logo = document.querySelector('.nav-logo');
      if (logo) logo.focus();
    });
  }

  /* ──────────────────────────────────────────────────────────
     2. Active Section Highlighting via IntersectionObserver
     ────────────────────────────────────────────────────────── */
  if (sections.length > 0 && 'IntersectionObserver' in window) {
    const sectionObserverOptions = {
      root: null,
      rootMargin: '-20% 0px -60% 0px', // Active when in upper portion of viewport
      threshold: 0
    };

    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.getAttribute('id');
          if (!sectionId) return;

          // Update desktop links
          desktopNavLinks.forEach((link) => {
            const href = link.getAttribute('href');
            if (href === `#${sectionId}`) {
              link.classList.add('active');
              link.setAttribute('aria-current', 'page');
            } else {
              link.classList.remove('active');
              link.removeAttribute('aria-current');
            }
          });

          // Update mobile links
          mobileNavLinks.forEach((link) => {
            if (link.classList.contains('mobile-nav-link')) {
              const href = link.getAttribute('href');
              if (href === `#${sectionId}`) {
                link.classList.add('active');
              } else {
                link.classList.remove('active');
              }
            }
          });
        }
      });
    }, sectionObserverOptions);

    sections.forEach((section) => sectionObserver.observe(section));
  }

  /* ──────────────────────────────────────────────────────────
     3. Mobile Drawer Controls
     ────────────────────────────────────────────────────────── */
  function openMobileDrawer() {
    if (!mobileDrawer) return;
    mobileDrawer.classList.add('is-open');
    mobileDrawer.setAttribute('aria-hidden', 'false');

    if (drawerOverlay) {
      drawerOverlay.classList.add('is-active');
      drawerOverlay.setAttribute('aria-hidden', 'false');
    }

    if (mobileMenuBtn) {
      mobileMenuBtn.setAttribute('aria-expanded', 'true');
    }

    document.body.style.overflow = 'hidden';

    // Focus close button inside drawer for accessibility
    if (drawerCloseBtn) {
      setTimeout(() => drawerCloseBtn.focus(), 100);
    }
  }

  function closeMobileDrawer() {
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
      const isOpen = mobileDrawer?.classList.contains('is-open');
      if (isOpen) {
        closeMobileDrawer();
      } else {
        openMobileDrawer();
      }
    });
  }

  if (drawerCloseBtn) {
    drawerCloseBtn.addEventListener('click', closeMobileDrawer);
  }

  if (drawerOverlay) {
    drawerOverlay.addEventListener('click', closeMobileDrawer);
  }

  // Close drawer when clicking any link inside
  mobileNavLinks.forEach((link) => {
    link.addEventListener('click', () => {
      closeMobileDrawer();
    });
  });

  // Close drawer on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileDrawer?.classList.contains('is-open')) {
      closeMobileDrawer();
    }
  });

  /* ──────────────────────────────────────────────────────────
     4. Telemetry HUD Live Dhaka Clock (UTC+6)
     ────────────────────────────────────────────────────────── */
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
