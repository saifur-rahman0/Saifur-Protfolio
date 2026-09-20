/**
 * canvas.js — Neural Network Background Particle Simulation
 * Md. Saifur Rahman Portfolio
 */

/**
 * Helper: Parse color string (hex or rgb/rgba) into {r, g, b}
 * @param {string} colorStr
 * @returns {{r: number, g: number, b: number}}
 */
function parseColorToRgb(colorStr) {
  const fallback = { r: 0, g: 212, b: 255 }; // #00d4ff default
  if (!colorStr) return fallback;

  const trimmed = colorStr.trim();

  // Hex color
  if (trimmed.startsWith('#')) {
    let hex = trimmed.slice(1);
    if (hex.length === 3) {
      hex = hex.split('').map((c) => c + c).join('');
    }
    if (hex.length === 6) {
      const num = parseInt(hex, 16);
      return {
        r: (num >> 16) & 255,
        g: (num >> 8) & 255,
        b: num & 255
      };
    }
  }

  // rgb/rgba color
  const rgbMatch = trimmed.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1], 10),
      g: parseInt(rgbMatch[2], 10),
      b: parseInt(rgbMatch[3], 10)
    };
  }

  return fallback;
}

/**
 * Get current primary accent color in RGB based on theme.
 */
function getAccentRgb() {
  const computed = getComputedStyle(document.documentElement);
  const colorStr = computed.getPropertyValue('--accent-primary') || '#00d4ff';
  return parseColorToRgb(colorStr);
}

/**
 * Node class representing a neural network particle.
 */
class Node {
  constructor(canvasWidth, canvasHeight, speedMultiplier = 0.4) {
    this.x = Math.random() * canvasWidth;
    this.y = Math.random() * canvasHeight;
    const angle = Math.random() * Math.PI * 2;
    const speed = (0.2 + Math.random() * 0.8) * speedMultiplier;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.radius = 1.5 + Math.random() * 2.0; // 1.5 - 3.5px
    this.baseOpacity = 0.35 + Math.random() * 0.45;
  }

  update(mouseX, mouseY, width, height, mouseRadius, mouseForce) {
    // Normal drift
    this.x += this.vx;
    this.y += this.vy;

    // Bounce off viewport edges
    if (this.x < 0) {
      this.x = 0;
      this.vx = Math.abs(this.vx);
    } else if (this.x > width) {
      this.x = width;
      this.vx = -Math.abs(this.vx);
    }

    if (this.y < 0) {
      this.y = 0;
      this.vy = Math.abs(this.vy);
    } else if (this.y > height) {
      this.y = height;
      this.vy = -Math.abs(this.vy);
    }

    // Subtle magnetic attraction toward cursor
    if (mouseX >= 0 && mouseY >= 0) {
      const dx = mouseX - this.x;
      const dy = mouseY - this.y;
      const dist = Math.hypot(dx, dy);

      if (dist < mouseRadius && dist > 2) {
        const pull = (1 - dist / mouseRadius) * mouseForce;
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

/**
 * Initialize neural network particle canvas.
 */
export function initCanvas() {
  const canvas = document.getElementById('neural-canvas');
  if (!canvas) return;

  // Check prefers-reduced-motion
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

  // Mouse interaction state
  let mouseX = -9999;
  let mouseY = -9999;
  const MOUSE_RADIUS = 180;
  const MOUSE_FORCE = 0.02;
  const MAX_LINE_DIST = 140;

  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = canvas.parentElement ? canvas.parentElement.offsetWidth : window.innerWidth;
    height = canvas.parentElement ? canvas.parentElement.offsetHeight : window.innerHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.resetTransform?.();
    ctx.scale(dpr, dpr);

    // Node count: 45 on small screens, 85 on desktop
    const targetCount = width < 768 ? 45 : 85;
    nodes = [];
    for (let i = 0; i < targetCount; i++) {
      nodes.push(new Node(width, height));
    }
  }

  resizeCanvas();

  // Debounced window resize
  let resizeTimeout = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      resizeCanvas();
    }, 150);
  });

  // Track mouse coordinates over window
  window.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
  });

  window.addEventListener('mouseleave', () => {
    mouseX = -9999;
    mouseY = -9999;
  });

  // Update particle colors when theme changes
  window.addEventListener('themechange', () => {
    currentRgb = getAccentRgb();
  });

  // Render loop
  function render() {
    ctx.clearRect(0, 0, width, height);

    const nodeCount = nodes.length;
    const { r, g, b } = currentRgb;

    // 1. Update and connect nodes
    for (let i = 0; i < nodeCount; i++) {
      const nodeA = nodes[i];
      nodeA.update(mouseX, mouseY, width, height, MOUSE_RADIUS, MOUSE_FORCE);

      // Connect to subsequent nodes
      for (let j = i + 1; j < nodeCount; j++) {
        const nodeB = nodes[j];
        const dx = nodeA.x - nodeB.x;
        const dy = nodeA.y - nodeB.y;
        const dist = Math.hypot(dx, dy);

        if (dist < MAX_LINE_DIST) {
          const alpha = (1 - dist / MAX_LINE_DIST) * 0.22;
          ctx.beginPath();
          ctx.moveTo(nodeA.x, nodeA.y);
          ctx.lineTo(nodeB.x, nodeB.y);
          ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
          ctx.lineWidth = 0.9;
          ctx.stroke();
        }
      }

      // Connect node to cursor if nearby
      if (mouseX >= 0 && mouseY >= 0) {
        const mDist = Math.hypot(nodeA.x - mouseX, nodeA.y - mouseY);
        if (mDist < MOUSE_RADIUS) {
          const mAlpha = (1 - mDist / MOUSE_RADIUS) * 0.35;
          ctx.beginPath();
          ctx.moveTo(nodeA.x, nodeA.y);
          ctx.lineTo(mouseX, mouseY);
          ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${mAlpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      // Draw node circle
      nodeA.draw(ctx, currentRgb);
    }

    animFrameId = requestAnimationFrame(render);
  }

  // Start loop
  animFrameId = requestAnimationFrame(render);

  // Tab visibility management: pause when hidden to save CPU/battery
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (animFrameId) {
        cancelAnimationFrame(animFrameId);
        animFrameId = null;
      }
    } else {
      if (!animFrameId) {
        animFrameId = requestAnimationFrame(render);
      }
    }
  });
}
