// ========================================
// SENTIENCE — Main Controller
// ========================================

(function () {
  'use strict';

  // --- State ---
  const state = {
    currentSection: 0,
    totalSections: 6,
    isTransitioning: false,
    transitionDuration: 900,
    mouseX: 0,
    mouseY: 0,
    cursorX: 0,
    cursorY: 0,
    trailX: 0,
    trailY: 0,
    statsAnimated: false,
  };

  // --- DOM References ---
  const scrollContainer = document.getElementById('scrollContainer');
  const sections = document.querySelectorAll('.section');
  const dots = document.querySelectorAll('.dot');
  const progressBar = document.getElementById('progressBar');
  const nav = document.getElementById('nav');
  const cursorGlow = document.getElementById('cursorGlow');
  const particleCanvas = document.getElementById('particleCanvas');
  const ctx = particleCanvas.getContext('2d');
  const customCursor = document.getElementById('customCursor');
  const cursorTrails = [
    document.getElementById('cursorTrail1'),
    document.getElementById('cursorTrail2'),
    document.getElementById('cursorTrail3'),
  ];

  // ========================================
  // SECTION NAVIGATION
  // ========================================

  function goToSection(index, instant = false) {
    if (index < 0 || index >= state.totalSections) return;
    if (!instant && state.isTransitioning) return;
    if (index === state.currentSection && !instant) return;

    state.isTransitioning = true;
    state.currentSection = index;

    // Update sections
    sections.forEach((sec, i) => {
      sec.classList.toggle('active', i === index);
    });

    // Update dots
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });

    // Update progress
    const progress = (index / (state.totalSections - 1)) * 100;
    progressBar.style.width = progress + '%';

    // Nav state
    nav.classList.toggle('scrolled', index > 0);

    // Trigger section-specific animations
    onSectionEnter(index);

    const dur = instant ? 0 : state.transitionDuration;
    setTimeout(() => {
      state.isTransitioning = false;
    }, dur);
  }

  function onSectionEnter(index) {
    // Stats counter animation for hero
    if (index === 0 && !state.statsAnimated) {
      state.statsAnimated = true;
      setTimeout(animateStats, 2000);
    }

    // Terminal typing effect for gallery
    if (index === 4) {
      animateTerminal();
    }
  }

  // ========================================
  // SCROLL HANDLING (Wheel)
  // ========================================

  let scrollAccumulator = 0;
  const scrollThreshold = 50;

  window.addEventListener('wheel', (e) => {
    e.preventDefault();

    scrollAccumulator += e.deltaY;

    if (Math.abs(scrollAccumulator) >= scrollThreshold) {
      if (scrollAccumulator > 0) {
        goToSection(state.currentSection + 1);
      } else {
        goToSection(state.currentSection - 1);
      }
      scrollAccumulator = 0;
    }

    // Reset accumulator after a pause
    clearTimeout(window._scrollResetTimeout);
    window._scrollResetTimeout = setTimeout(() => {
      scrollAccumulator = 0;
    }, 200);
  }, { passive: false });

  // ========================================
  // TOUCH HANDLING
  // ========================================

  let touchStartY = 0;

  window.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  window.addEventListener('touchend', (e) => {
    const diff = touchStartY - e.changedTouches[0].clientY;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        goToSection(state.currentSection + 1);
      } else {
        goToSection(state.currentSection - 1);
      }
    }
  }, { passive: true });

  // ========================================
  // KEYBOARD
  // ========================================

  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === ' ' || e.key === 'PageDown') {
      e.preventDefault();
      goToSection(state.currentSection + 1);
    } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
      e.preventDefault();
      goToSection(state.currentSection - 1);
    } else if (e.key === 'Home') {
      e.preventDefault();
      goToSection(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      goToSection(state.totalSections - 1);
    }
  });

  // ========================================
  // DOT NAVIGATION
  // ========================================

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const index = parseInt(dot.dataset.section);
      goToSection(index);
    });
  });

  // ========================================
  // NAV LINK CLICKS
  // ========================================

  document.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const index = parseInt(link.dataset.section);
      goToSection(index);
    });
  });

  document.querySelector('.nav-logo').addEventListener('click', () => {
    goToSection(0);
  });

  // ========================================
  // CURSOR GLOW
  // ========================================

  const ease = 0.15;
  const trailEase = 0.08;

  document.addEventListener('mousemove', (e) => {
    state.mouseX = e.clientX;
    state.mouseY = e.clientY;
    cursorGlow.style.left = e.clientX + 'px';
    cursorGlow.style.top = e.clientY + 'px';
    
    state.cursorX = e.clientX;
    state.cursorY = e.clientY;
  });

  function updateCustomCursor() {
    state.trailX += (state.cursorX - state.trailX) * trailEase;
    state.trailY += (state.cursorY - state.trailY) * trailEase;

    customCursor.style.left = state.cursorX + 'px';
    customCursor.style.top = state.cursorY + 'px';

    cursorTrails[0].style.left = (state.trailX + (state.cursorX - state.trailX) * 0.5) + 'px';
    cursorTrails[0].style.top = (state.trailY + (state.cursorY - state.trailY) * 0.5) + 'px';

    cursorTrails[1].style.left = (state.trailX + (state.cursorX - state.trailX) * 0.3) + 'px';
    cursorTrails[1].style.top = (state.trailY + (state.cursorY - state.trailY) * 0.3) + 'px';

    cursorTrails[2].style.left = (state.trailX + (state.cursorX - state.trailX) * 0.15) + 'px';
    cursorTrails[2].style.top = (state.trailY + (state.cursorY - state.trailY) * 0.15) + 'px';

    requestAnimationFrame(updateCustomCursor);
  }

  updateCustomCursor();

  // Add pointer cursor for interactive elements
  const interactives = document.querySelectorAll('a, button, .pillar, .feature-card, .arch-node, .side-module');
  interactives.forEach(el => {
    el.style.cursor = 'pointer';
  });

  // ========================================
  // STAT COUNTER ANIMATION
  // ========================================

  function animateStats() {
    const statNumbers = document.querySelectorAll('.stat-number');
    statNumbers.forEach((el) => {
      const target = parseInt(el.dataset.target);
      const duration = 2000;
      const start = performance.now();

      function update(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(target * eased);
        if (progress < 1) requestAnimationFrame(update);
      }

      requestAnimationFrame(update);
    });
  }

  // ========================================
  // TERMINAL ANIMATION
  // ========================================

  let terminalAnimated = false;

  function animateTerminal() {
    if (terminalAnimated) return;
    terminalAnimated = true;

    const lines = document.querySelectorAll('#terminalBody .term-line');
    lines.forEach((line, i) => {
      line.style.opacity = '0';
      line.style.transform = 'translateX(-10px)';
      line.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      setTimeout(() => {
        line.style.opacity = '1';
        line.style.transform = 'translateX(0)';
      }, i * 180);
    });
  }

  // ========================================
  // PARTICLE SYSTEM
  // ========================================

  const particles = [];
  const particleCount = 60;

  function resizeCanvas() {
    particleCanvas.width = window.innerWidth;
    particleCanvas.height = window.innerHeight;
  }

  function createParticle() {
    return {
      x: Math.random() * particleCanvas.width,
      y: Math.random() * particleCanvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      size: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.3 + 0.05,
      pulse: Math.random() * Math.PI * 2,
    };
  }

  function initParticles() {
    for (let i = 0; i < particleCount; i++) {
      particles.push(createParticle());
    }
  }

  function drawParticles() {
    ctx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);

    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.pulse += 0.01;

      // Wrap around
      if (p.x < 0) p.x = particleCanvas.width;
      if (p.x > particleCanvas.width) p.x = 0;
      if (p.y < 0) p.y = particleCanvas.height;
      if (p.y > particleCanvas.height) p.y = 0;

      const alpha = p.alpha * (0.7 + 0.3 * Math.sin(p.pulse));

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(167, 139, 250, ${alpha})`;
      ctx.fill();
    });

    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 120) {
          const alpha = (1 - dist / 120) * 0.06;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(167, 139, 250, ${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(drawParticles);
  }

  // Mouse influence on particles
  document.addEventListener('mousemove', (e) => {
    particles.forEach((p) => {
      const dx = e.clientX - p.x;
      const dy = e.clientY - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 150) {
        const force = (150 - dist) / 150 * 0.02;
        p.vx -= dx * force * 0.01;
        p.vy -= dy * force * 0.01;
      }

      // Dampen velocity
      p.vx *= 0.99;
      p.vy *= 0.99;
    });
  });

  // ========================================
  // INIT
  // ========================================

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();
  initParticles();
  drawParticles();

  // Activate hero on load
  goToSection(0, true);

  // Remove loading state
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.6s ease';
  requestAnimationFrame(() => {
    document.body.style.opacity = '1';
  });

})();