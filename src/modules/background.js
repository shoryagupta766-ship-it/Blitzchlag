import gsap from 'gsap';
import '../styles/competitions.css';

// --- CONFIG VARIABLES ---
const BANNER_COUNT = 5;
const COLORS = ['#f5b301', '#1e2a6b']; // Mustard and Navy
const SWAY_DEG = 1.5;

let isEnabled = false;
let parallaxCtx; // To store our GSAP context for easy cleanup
let mouseHandler, scrollHandler;

export function initBackground(containerElement) {
  isEnabled = true;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1. Inject the HTML structure dynamically
  containerElement.classList.add('competitions-page');
  
  let bannersHTML = '';
  for (let i = 0; i < BANNER_COUNT; i++) {
    const color = COLORS[i % COLORS.length];
    // Vary heights slightly so they don't look artificial
    const heightOffset = Math.random() * 10 - 5; 
    bannersHTML += `<div class="banner" style="background-color: ${color}; height: calc(60vh + ${heightOffset}vh); z-index: ${i % 2 === 0 ? 1 : 0}"></div>`;
  }

  const domHTML = `
    <div class="banner-container">
      ${bannersHTML}
    </div>
    <div class="heading-container">
      <div class="heading-script">Our</div>
      <h1 class="heading-main">COMPETITIONS</h1>
    </div>
  `;
  containerElement.innerHTML = domHTML;

  // 2. Entrance Animations
  const banners = document.querySelectorAll('.banner');
  const headingScript = document.querySelector('.heading-script');
  const headingMain = document.querySelector('.heading-main');

  // We set transform-origin here so GSAP knows where to hinge the rotation
  gsap.set(banners, { transformOrigin: 'top center' });

  const tl = gsap.timeline();
  
  // Drop banners in from above
  tl.from(banners, {
    y: -800,
    duration: 1.5,
    ease: "elastic.out(1, 0.5)",
    stagger: 0.15 // Drops them one by one with a 0.15s delay between each
  });

  // Fade and pop the text in
  tl.from(headingScript, { opacity: 0, scale: 0, rotation: -20, duration: 0.5, ease: "back.out(2)" }, "-=1");
  tl.from(headingMain, { opacity: 0, y: 50, duration: 0.5, ease: "power2.out" }, "-=0.8");

  // 3. Continuous Motion & Parallax (Skip if reduced motion is requested)
  if (!prefersReducedMotion) {
    // Continuous Sway
    banners.forEach((banner, index) => {
      gsap.to(banner, {
        rotation: (index % 2 === 0 ? SWAY_DEG : -SWAY_DEG) + (Math.random() * 0.5), // Alternate directions
        duration: 2 + Math.random(), // Slightly different durations so they fall out of sync naturally
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: index * 0.1
      });
    });

    // Mouse Parallax Setup
    const bannerContainer = document.querySelector('.banner-container');
    
    mouseHandler = (e) => {
      // Normalize mouse position from -1 (left/top) to 1 (right/bottom)
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;

      // Move the container slightly opposite to the mouse
      gsap.to(bannerContainer, {
        x: x * -15, 
        y: y * -10,
        duration: 0.5, // Small duration creates a smooth "lag" tracking effect
        ease: "power1.out"
      });
      
      // Move the heading slightly *with* the mouse to create depth
      gsap.to('.heading-container', {
        x: x * 10,
        y: y * 5,
        duration: 0.5,
        ease: "power1.out"
      });
    };

    // Scroll Parallax Setup
    scrollHandler = () => {
      const scrollY = window.scrollY;
      // Move banners down at half the speed of the scroll
      gsap.to(bannerContainer, {
        y: scrollY * 0.5,
        duration: 0.1,
        overwrite: 'auto'
      });
    };

    window.addEventListener('mousemove', mouseHandler);
    window.addEventListener('scroll', scrollHandler);
  }
}

export function destroyBackground(containerElement) {
  if (!isEnabled) return;
  isEnabled = false;
  
  // Clean up event listeners so they don't run when we navigate to other pages
  if (mouseHandler) window.removeEventListener('mousemove', mouseHandler);
  if (scrollHandler) window.removeEventListener('scroll', scrollHandler);
  
  // Kill GSAP animations on these elements
  gsap.killTweensOf('.banner');
  gsap.killTweensOf('.banner-container');
  gsap.killTweensOf('.heading-container');
  
  containerElement.innerHTML = ''; // Wipe the DOM
  containerElement.classList.remove('competitions-page');
}