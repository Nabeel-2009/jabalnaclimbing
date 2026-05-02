import * as THREE from 'three';

// Setup starfield/particle background
const scene = new THREE.Scene();
scene.background = null;

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 0);
document.getElementById('canvas-container').appendChild(renderer.domElement);

// Stars
const starCount = 1500;
const starGeometry = new THREE.BufferGeometry();
const starPositions = new Float32Array(starCount * 3);
for (let i = 0; i < starCount; i++) {
  starPositions[i*3]   = (Math.random() - 0.5) * 200;
  starPositions[i*3+1] = (Math.random() - 0.5) * 100;
  starPositions[i*3+2] = (Math.random() - 0.5) * 50 - 25;
}
starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
const starMaterial = new THREE.PointsMaterial({
  color: 0xffaa77,
  size: 0.08,
  transparent: true,
  opacity: 0.7,
  blending: THREE.AdditiveBlending
});
const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

// Dust
const dustCount = 3500;
const dustGeometry = new THREE.BufferGeometry();
const dustPositions = new Float32Array(dustCount * 3);
for (let i = 0; i < dustCount; i++) {
  dustPositions[i*3]   = (Math.random() - 0.5) * 220;
  dustPositions[i*3+1] = (Math.random() - 0.5) * 150;
  dustPositions[i*3+2] = (Math.random() - 0.5) * 60 - 20;
}
dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
const dustMaterial = new THREE.PointsMaterial({
  color: 0xcc5533,
  size: 0.05,
  transparent: true,
  opacity: 0.4,
  blending: THREE.AdditiveBlending
});
const dust = new THREE.Points(dustGeometry, dustMaterial);
scene.add(dust);

let time = 0;
function animate() {
  requestAnimationFrame(animate);
  time += 0.002;
  stars.rotation.y = time * 0.1;
  stars.rotation.x = Math.sin(time * 0.05) * 0.2;
  dust.rotation.y  = -time * 0.08;
  dust.rotation.x  = Math.cos(time * 0.03) * 0.1;
  renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ========== SITE INTERACTIVITY ==========
(function () {
  const navbar        = document.getElementById('navbar');
  const hamburger     = document.getElementById('nav-hamburger');
  const mobileMenu    = document.getElementById('nav-mobile');
  const ropeFill      = document.getElementById('rope-fill');
  const ropeClimber   = document.getElementById('rope-climber');
  const ropeTrack     = document.getElementById('rope-track');
  const scrollContainer = document.getElementById('scroll-progress-container');


  // --- Navbar scroll state ---
  function updateNavbar() {
    navbar.classList.toggle('scrolled', window.scrollY > 80);
  }

  // --- Restore nearest section on reload ---
  window.addEventListener('scroll', () => {
    sessionStorage.setItem('jabalna_scrollY', Math.round(window.scrollY));
  }, { passive: true });

  const savedY = parseInt(sessionStorage.getItem('jabalna_scrollY') || '0');
  if (savedY > 120) {
    const sections = document.querySelectorAll('#hero, #pricing-section, #hours-section, #timeline-section, #gym-section');
    let nearest = null;
    let minDist = Infinity;
    sections.forEach(sec => {
      const dist = Math.abs(sec.offsetTop - savedY);
      if (dist < minDist) { minDist = dist; nearest = sec; }
    });
    if (nearest) {
      setTimeout(() => nearest.scrollIntoView({ behavior: 'instant' }), 80);
    }
  }

  // --- Rope progress ---
  function updateScrollProgress() {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress  = maxScroll ? Math.min(window.scrollY / maxScroll, 1) : 0;

    if (ropeFill) ropeFill.style.height = (progress * 100) + '%';

    if (ropeClimber && ropeTrack && scrollContainer) {
      const containerRect      = scrollContainer.getBoundingClientRect();
      const trackRect          = ropeTrack.getBoundingClientRect();
      const trackTopRelative   = trackRect.top - containerRect.top;
      const climberY           = trackTopRelative + (trackRect.height * progress);
      ropeClimber.style.top    = climberY + 'px';
    }
  }

  // --- Hero parallax (SVG wall scene) ---
  const heroWallScene = document.getElementById('hero-wall-scene');
  const heroContent   = document.getElementById('hero-content');

  function updateHeroParallax() {
    if (window.scrollY > window.innerHeight) return;
    const p = window.scrollY / window.innerHeight;
    if (heroWallScene) {
      heroWallScene.style.transform = `translateY(${p * 25}%)`;
    }
    if (heroContent) {
      heroContent.style.opacity  = Math.max(0, 1 - p * 2.5);
      heroContent.style.transform = `translateY(${p * -40}px)`;
    }
  }

  function onScroll() {
    updateNavbar();
    updateScrollProgress();
    updateHeroParallax();
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', updateScrollProgress);

  // --- Hamburger menu ---
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open');
    });
    document.querySelectorAll('#nav-mobile a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
      });
    });
  }

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0, rootMargin: '0px 0px -30px 0px' });

  document.querySelectorAll(
    '.timeline-item, .gym-header, #gym-img-wrap, #gym-contact, #gym-stats, .pricing-header, .hours-header'
  ).forEach(el => observer.observe(el));

  setTimeout(() => {
    document.querySelectorAll(
      '.timeline-item, .gym-header, #gym-img-wrap, #gym-contact, #gym-stats, .pricing-header, .hours-header'
    ).forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight) {
        el.classList.add('visible');
      }
    });
  }, 300);    

  // ===== HERO WALL INTERACTIVITY =====
  const ropePath      = document.getElementById('rope-path');
  const ropePathGlow  = document.getElementById('rope-path-glow');
  const climberFigure = document.getElementById('climber-figure');
  let ropeTime = 0;

  // Climber SVG coords: starts mid-wall, climbs UP as user scrolls down
  const CLIMBER_START_Y = 580;
  const CLIMBER_END_Y   = 60;

  // Top anchor point (where rope is fixed)
  const ROPE_ANCHOR_X = 158;
  const ROPE_ANCHOR_Y = 65;

  function updateClimberScroll() {
    if (!climberFigure) return;
    const heroH   = window.innerHeight;
    const scrollP = Math.min(window.scrollY / heroH, 1);

    // Y position: climber goes UP as we scroll down
    const svgY = CLIMBER_START_Y - (CLIMBER_START_Y - CLIMBER_END_Y) * scrollP;

    // Fade out in last 15% of hero
    const fadeOut = scrollP > 0.85 ? 1 - (scrollP - 0.85) / 0.15 : 1;

    // Breathing/sway animation
    const breathY = Math.sin(ropeTime * 2) * 2.5;
    const swayX   = Math.sin(ropeTime * 0.9) * 1.5;

    // Move figure: drawn center is at (152, 620), offset to new position
    const offsetY = svgY - 620;
    climberFigure.setAttribute('transform',
      `translate(${swayX}, ${offsetY + breathY})`
    );
    climberFigure.style.opacity = fadeOut;

    // Update rope: anchor at top (fixed), rope hangs DOWN to climber's harness
    // Climber harness is near top of figure → svgY - 10 in SVG space after transform
    const climberHarnessY = svgY + offsetY + breathY - 10;
    // Actually the harness is at the figure's drawn position (152, 632) offset by transform
    // Rope end = figure center Y (svgY) + small offset for harness position
    const ropeEndY = svgY - 18 + breathY; // rope attaches near climber harness (shorter)
    const ropeEndX = 152 + swayX;

    if (ropePath) {
      const sway1 = Math.sin(ropeTime) * 4;
      const sway2 = Math.sin(ropeTime + 1.5) * 3;
      // Control points for natural rope sag between anchor (top) and climber
      const mid1Y = ROPE_ANCHOR_Y + (ropeEndY - ROPE_ANCHOR_Y) * 0.33;
      const mid2Y = ROPE_ANCHOR_Y + (ropeEndY - ROPE_ANCHOR_Y) * 0.66;
      const ds = `M${ROPE_ANCHOR_X},${ROPE_ANCHOR_Y} C${ROPE_ANCHOR_X + sway1 * 2},${mid1Y} ${ropeEndX - sway2 * 2},${mid2Y} ${ropeEndX + sway1},${ropeEndY}`;
      ropePath.setAttribute('d', ds);
      if (ropePathGlow) ropePathGlow.setAttribute('d', ds);
    }
  }

  function animateWall() {
    ropeTime += 0.012;
    updateClimberScroll();
    requestAnimationFrame(animateWall);
  }

  animateWall();

  // Mouse-based subtle wall tilt
  document.addEventListener('mousemove', (e) => {
    const wallScene = document.getElementById('hero-wall-scene');
    if (!wallScene || window.scrollY > window.innerHeight * 0.6) return;
    const mx = (e.clientX / window.innerWidth  - 0.5) * 6;
    const my = (e.clientY / window.innerHeight - 0.5) * 3;
    if (window.scrollY < 50) {
      wallScene.style.transform = `translate(${mx * -0.4}px, ${my * -0.2}px)`;
    }
  });

  // --- Timeline background images on mobile ---
  function setTimelineBackgrounds() {
    const isMobile = window.innerWidth <= 768;
    document.querySelectorAll('.timeline-item').forEach(item => {
      const img  = item.querySelector('.tl-img-wrap img');
      const card = item.querySelector('.tl-content-card');
      if (img && card) {
        card.style.backgroundImage = isMobile ? `url(${img.src})` : '';
      }
    });
  }

  window.addEventListener('resize', setTimelineBackgrounds);
  setTimelineBackgrounds();
  onScroll();

  // ===== MOBILE CLIMBER ANIMATION =====
  const mobileClimber  = document.getElementById('mobile-climber');
  const mRopePath      = document.getElementById('m-rope-path');
  const mRopePathGlow  = document.getElementById('m-rope-path-glow');

  // Mobile SVG viewBox: 390×844
  // Climber harness is drawn at (56, 464) in the SVG
  const M_HARNESS_DRAWN_Y = 464;
  const M_ROPE_ANCHOR_X   = 56;
  const M_ROPE_ANCHOR_Y   = 48;

  // Where harness should be at scroll=0 (bottom) and scroll=1 (top)
  const M_START_HARNESS_Y = 720;
  const M_END_HARNESS_Y   = 110;

  let mRopeTime = 0;

  function updateMobileClimber() {
    if (!mobileClimber) return;

    const heroH   = window.innerHeight;
    const scrollP = Math.min(window.scrollY / heroH, 1);

    // Target harness Y in SVG space
    const harnessY = M_START_HARNESS_Y - (M_START_HARNESS_Y - M_END_HARNESS_Y) * scrollP;

    // Offset = how much to shift the drawn figure
    const offsetY = harnessY - M_HARNESS_DRAWN_Y;

    // Subtle breathing sway
    const breathY = Math.sin(mRopeTime * 2) * 1.8;
    const swayX   = Math.sin(mRopeTime * 0.8) * 1.2;

    // Fade out near end of hero
    const fadeOut = scrollP > 0.85 ? 1 - (scrollP - 0.85) / 0.15 : 1;

    mobileClimber.setAttribute('transform', `translate(${swayX}, ${offsetY + breathY})`);
    mobileClimber.style.opacity = fadeOut;

    // Update rope: anchor at top, end at climber harness
    const ropeEndX = M_ROPE_ANCHOR_X + swayX;
    const ropeEndY = harnessY + breathY;
    const midY     = M_ROPE_ANCHOR_Y + (ropeEndY - M_ROPE_ANCHOR_Y) * 0.5;
    const s1       = Math.sin(mRopeTime) * 2;
    const d = `M${M_ROPE_ANCHOR_X},${M_ROPE_ANCHOR_Y} C${M_ROPE_ANCHOR_X + s1},${midY * 0.6} ${ropeEndX - s1},${midY * 1.3} ${ropeEndX},${ropeEndY}`;

    if (mRopePath)     mRopePath.setAttribute('d', d);
    if (mRopePathGlow) mRopePathGlow.setAttribute('d', d);
  }

  function animateMobileWall() {
    mRopeTime += 0.012;
    updateMobileClimber();
    requestAnimationFrame(animateMobileWall);
  }

  if (window.innerWidth <= 768) {
    animateMobileWall();
  }

  window.addEventListener('resize', () => {
    if (window.innerWidth <= 768 && mobileClimber) {
      animateMobileWall();
    }
  });

})();