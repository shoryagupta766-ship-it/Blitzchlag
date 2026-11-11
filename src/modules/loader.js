import gsap from 'gsap';
import '../styles/loader.css';

export function startLoader(onDone) {
  // 1. Inject loader HTML structure into the DOM
  const loaderHTML = `
    <div class="loader-wrapper">
      <div class="loader-half top"></div>
      <div class="loader-half bottom"></div>
      <div class="loader-content">
        <div class="loader-ring"></div>
        <div class="loader-text">LOADING...</div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', loaderHTML);

  // 2. Generate floating particles
  const wrapper = document.querySelector('.loader-wrapper');
  const particleCount = 25;
  const particles = [];

  for (let i = 0; i < particleCount; i++) {
    const p = document.createElement('div');
    p.classList.add('particle');
    
    // Start at random coordinates across the viewport
    const startX = Math.random() * window.innerWidth;
    const startY = Math.random() * window.innerHeight;
    p.style.left = `${startX}px`;
    p.style.top = `${startY}px`;
    
    // Vary the size slightly for depth
    const size = Math.random() * 3 + 2; 
    p.style.width = `${size}px`;
    p.style.height = `${size}px`;
    
    wrapper.appendChild(p);
    particles.push(p);

    // Make them drift slowly using GSAP
    gsap.to(p, {
      x: (Math.random() - 0.5) * 100, // drift left or right by up to 50px
      y: (Math.random() - 0.5) * 100, // drift up or down by up to 50px
      duration: Math.random() * 3 + 2, // random duration between 2-5s
      repeat: -1, // Infinite loop
      yoyo: true, // Go back and forth smoothly
      ease: "sine.inOut"
    });
  }

  // 3. Track real loading progress and our minimum time requirement
  const minTimePromise = new Promise(resolve => setTimeout(resolve, 2500));
  
  // Tricky line: If document is already complete (hot reload), resolve immediately. Otherwise, wait for window load event.
  const loadEventPromise = document.readyState === 'complete' 
    ? Promise.resolve() 
    : new Promise(resolve => window.addEventListener('load', resolve));

  // 4. When BOTH the site is loaded AND 2.5 seconds have passed, animate out
  Promise.all([minTimePromise, loadEventPromise]).then(() => {
    // Check user accessibility preference to disable heavy motion if needed
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Create our GSAP timeline
    const tl = gsap.timeline({
      onComplete: () => {
        wrapper.remove(); // Clean up the DOM
        onDone(); // Tell main.js to start the site!
      }
    });

    if (prefersReducedMotion) {
      // Fast, simple fade for accessibility
      tl.to(wrapper, { opacity: 0, duration: 0.5 });
    } else {
      // The full cinematic exit sequence
      // Note on timeline syntax: the third parameter (e.g., '0' or '<') dictates WHEN the animation starts.
      tl.to(particles, { 
        scale: 0, 
        opacity: 0, 
        duration: 0.4, 
        stagger: 0.01 // Delay each particle slightly for a dissolving effect
      }, 0);
      
      tl.to('.loader-ring', { scale: 4, opacity: 0, duration: 0.6, ease: "power2.in" }, 0);
      tl.to('.loader-text', { opacity: 0, duration: 0.4 }, 0);
      
      // Split the screen in half
      tl.to('.loader-half.top', { yPercent: -100, duration: 1, ease: "power3.inOut" }, 0.4);
      tl.to('.loader-half.bottom', { yPercent: 100, duration: 1, ease: "power3.inOut" }, 0.4);
    }
  });
}