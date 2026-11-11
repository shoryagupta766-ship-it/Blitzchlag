import './styles/style.css';
import { startLoader } from './modules/loader.js';
import { initCursor } from './modules/cursor.js';
import { initRouter } from './router.js';

document.addEventListener('DOMContentLoaded', () => {
  console.log("Initializing Blitzschlag Frontend...");

  // Setup the mobile hamburger menu logic globally
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });
  }

  // Orchestrating the startup sequence:
  // 1. Fire the loader immediately to hide the blank screen
  startLoader(() => {
    // 2. Once the loader split-screen finishes (onDone), mount the custom cursor
    initCursor();
    
    // 3. Start the router, which reads the URL and mounts the correct page module (like Home/3D)
    initRouter();
  });
});