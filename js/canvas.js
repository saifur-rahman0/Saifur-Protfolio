/**
 * canvas.js — Neural Synapse Canvas 2.0 (Kinetic Particle & Action Potential Simulation)
 * Md. Saifur Rahman Portfolio
 */

/**
 * Helper: Parse color string (hex or rgb/rgba) into {r, g, b}
 * @param {string} colorStr
 * @returns {{r: number, g: number, b: number}}
 */
function parseColorToRgb(colorStr) {
  const fallback = { r: 0, g: 242, b: 254 }; // #00f2fe default
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
 * Get current theme accent colors in RGB.
 */
function getThemePalette() {
  const computed = getComputedStyle(document.documentElement);
  const primaryStr = computed.getPropertyValue('--accent-primary') || '#00f2fe';
  const secondaryStr = computed.getPropertyValue('--accent-secondary') || '#7928ca';
  const successStr = computed.getPropertyValue('--accent-success') || '#00ff88';

  return {
    primary: parseColorToRgb(primaryStr),
    secondary: parseColorToRgb(secondaryStr),
    success: parseColorToRgb(successStr)
  };
}

/**
 * Action potential spark traveling along a synaptic connection.
 */
class SynapseSpark {
  constructor(nodeA, nodeB, rgb) {
    this.nodeA = nodeA;
    this.nodeB = nodeB;
    this.rgb = rgb;
    this.progress = 0;
    this.speed = 0.015 + Math.random() * 0.025;
    this.dead = false;
    this.size = 2.0 + Math.random() * 1.5;
  }

  update() {
    this.progress += this.speed;
    if (this.progress >= 1) {
      this.dead = true;
    }
  }

  draw(ctx) {
    const x = this.nodeA.x + (this.nodeB.x - this.nodeA.x) * this.progress;
    const y = this.nodeA.y + (this.nodeB.y - this.nodeA.y) * this.progress;
    const { r, g, b } = this.rgb;

    // Glowing head
    ctx.beginPath();
    ctx.arc(x, y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.95)`;
    ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.8)`;
    ctx.shadowBlur = 8;
    ctx.fill();

    // Reset shadow
    ctx.shadowBlur = 0;
  }
}

/**
 * Node class representing a neural network particle.
 */
class Node {
  constructor(canvasWidth, canvasHeight, speedMultiplier = 0.45) {
    this.x = Math.random() * canvasWidth;
    this.y = Math.random() * canvasHeight;
    const angle = Math.random() * Math.PI * 2;
    const speed = (0.2 + Math.random() * 0.8) * speedMultiplier;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.radius = 1.5 + Math.random() * 2.2; // 1.5 - 3.7px
    this.baseOpacity = 0.35 + Math.random() * 0.45;

    // Chromatic variant
    const rand = Math.random();
    this.type = rand > 0.4 ? 'primary' : rand > 0.15 ? 'secondary' : 'success';
  }

  update(mouseX, mouseY, mouseVx, mouseVy, width, height, mouseRadius) {
    // Normal drift
    this.x += this.vx;
    this.y += this.vy;

    // Gentle velocity dampening toward original drift speed
    this.vx *= 0.99;
    this.vy *= 0.99;

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

    // Hydrodynamic cursor interaction
    if (mouseX >= 0 && mouseY >= 0) {
      const dx = mouseX - this.x;
      const dy = mouseY - this.y;
      const dist = Math.hypot(dx, dy);

      if (dist < mouseRadius && dist > 2) {
        // Soft pull
        const pull = (1 - dist / mouseRadius) * 0.018;
        this.x += dx * pull;
        this.y += dy * pull;

        // Hydrodynamic velocity push from fast cursor sweeps
        const mouseSpeed = Math.hypot(mouseVx, mouseVy);
        if (mouseSpeed > 2) {
          const pushFactor = (1 - dist / mouseRadius) * 0.08;
          this.vx += mouseVx * pushFactor;
          this.vy += mouseVy * pushFactor;
        }
      }
    }
  }

  draw(ctx, palette) {
    const rgb = palette[this.type] || palette.primary;
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
  let sparks = [];
  let animFrameId = null;
  let palette = getThemePalette();

  // Mouse interaction state
  let mouseX = -9999;
  let mouseY = -9999;
  let prevMouseX = -9999;
  let prevMouseY = -9999;
  let mouseVx = 0;
  let mouseVy = 0;

  const MOUSE_RADIUS = 190;
  const MAX_LINE_DIST = 145;
  const MAX_SPARKS = 14;

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

    // Node count: 48 on small screens, 90 on desktop
    const targetCount = width < 768 ? 48 : 90;
    nodes = [];
    sparks = [];
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

  // Track mouse coordinates & velocity
  window.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    if (prevMouseX >= 0) {
      mouseVx = currentX - prevMouseX;
      mouseVy = currentY - prevMouseY;
    }

    prevMouseX = currentX;
    prevMouseY = currentY;
    mouseX = currentX;
    mouseY = currentY;
  });

  window.addEventListener('mouseleave', () => {
    mouseX = -9999;
    mouseY = -9999;
    prevMouseX = -9999;
    prevMouseY = -9999;
    mouseVx = 0;
    mouseVy = 0;
  });

  // Update particle colors when theme changes
  window.addEventListener('themechange', () => {
    palette = getThemePalette();
  });

  // Render loop
  function render() {
    ctx.clearRect(0, 0, width, height);

    const nodeCount = nodes.length;
    const { primary, secondary } = palette;

    // Decay mouse velocity
    mouseVx *= 0.9;
    mouseVy *= 0.9;

    // 1. Update and connect nodes
    for (let i = 0; i < nodeCount; i++) {
      const nodeA = nodes[i];
      nodeA.update(mouseX, mouseY, mouseVx, mouseVy, width, height, MOUSE_RADIUS);

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

          // Subtle gradient or primary color for line
          ctx.strokeStyle = `rgba(${primary.r}, ${primary.g}, ${primary.b}, ${alpha})`;
          ctx.lineWidth = 0.9;
          ctx.stroke();

          // Chance to trigger an Action Potential Spark between active synapses
          if (sparks.length < MAX_SPARKS && Math.random() < 0.0018) {
            const sparkRgb = Math.random() > 0.5 ? primary : secondary;
            sparks.push(new SynapseSpark(nodeA, nodeB, sparkRgb));
          }
        }
      }

      // Connect node to cursor if nearby
      if (mouseX >= 0 && mouseY >= 0) {
        const mDist = Math.hypot(nodeA.x - mouseX, nodeA.y - mouseY);
        if (mDist < MOUSE_RADIUS) {
          const mAlpha = (1 - mDist / MOUSE_RADIUS) * 0.38;
          ctx.beginPath();
          ctx.moveTo(nodeA.x, nodeA.y);
          ctx.lineTo(mouseX, mouseY);
          ctx.strokeStyle = `rgba(${primary.r}, ${primary.g}, ${primary.b}, ${mAlpha})`;
          ctx.lineWidth = 1.1;
          ctx.stroke();
        }
      }

      // Draw node circle
      nodeA.draw(ctx, palette);
    }

    // 2. Update and render Action Potential Sparks
    for (let s = sparks.length - 1; s >= 0; s--) {
      const spark = sparks[s];
      spark.update();
      if (spark.dead) {
        sparks.splice(s, 1);
      } else {
        spark.draw(ctx);
      }
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
