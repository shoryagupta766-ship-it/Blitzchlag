import gsap from 'gsap';

let appContainer;
let currentDestroy = null; 
let pendingRoute = null; // Prevents race conditions if users click links quickly

export function initRouter() {
  appContainer = document.getElementById('app');
  window.addEventListener('hashchange', handleRouteChange);
  handleRouteChange();
}

function handleRouteChange() {
  const hash = window.location.hash || '#/home';
  pendingRoute = hash; 
  
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === hash);
  });
  document.querySelector('.nav-links').classList.remove('open');

  gsap.to(appContainer, {
    opacity: 0,
    y: 20,
    duration: 0.3,
    onComplete: () => {
      cleanupPrevious();
      
      // Dynamic import routing based on the hash
      if (pendingRoute === '#/home') renderHome();
      else if (pendingRoute === '#/competitions') renderCompetitions();
      else if (pendingRoute === '#/passes') renderPasses();
      else if (pendingRoute === '#/contact') renderContact();
      
      gsap.fromTo(appContainer, 
        { opacity: 0, y: -20 }, 
        { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }
      );
    }
  });
}

function cleanupPrevious() {
  if (typeof currentDestroy === 'function') {
    currentDestroy(appContainer);
  }
  appContainer.innerHTML = '';
  appContainer.className = ''; 
  currentDestroy = null;
}

function renderHome() {
  // Tricky block: Dynamic import() forces Vite to split Three.js into a separate chunk.
  // It only downloads when the user visits the home page, saving megabytes of initial load time!
  import('./modules/scene3d.js').then(module => {
    if (pendingRoute !== '#/home') return; // Abort if user navigated away while downloading
    module.initScene(appContainer);
    currentDestroy = module.destroyScene;
  });
}

function renderCompetitions() {
  import('./modules/background.js').then(module => {
    if (pendingRoute !== '#/competitions') return;
    module.initBackground(appContainer);
    currentDestroy = module.destroyBackground;
    
    // Inject lightweight UI on top
    appContainer.insertAdjacentHTML('beforeend', `
      <div class="competitions-grid">
        <div class="card"><span class="tag">Music</span><h3>Battle of Bands</h3><button class="card-btn">Register</button></div>
        <div class="card"><span class="tag">Tech</span><h3>Hackathon</h3><button class="card-btn">Register</button></div>
      </div>
    `);
  });
}

function renderPasses() {
  appContainer.className = 'page-container';
  appContainer.innerHTML = `<h1>PASSES (Static Page)</h1>`;
}

function renderContact() {
  appContainer.className = 'page-container';
  appContainer.innerHTML = `<h1>CONTACT (Static Page)</h1>`;
}