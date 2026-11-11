// Tweak these constants to change the look and feel of the slice!
const TRAIL_LENGTH = 20;
const FADE_MS = 300;
const GLOW_COLOR = '#0554ff';

let canvas, ctx;
let animationFrameId;
let trail = [];
let sparks = [];
let slashes = [];
let lastMouse = { x: 0, y: 0 };
let isEnabled = false;

export function initCursor() {
  // 1. Accessibility & Device Check
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
  
  if (prefersReducedMotion || isTouchDevice) {
    console.log("Cursor disabled for accessibility or touch device.");
    return;
  }

  isEnabled = true;

  // 2. Setup the Canvas
  canvas = document.createElement('canvas');
  ctx = canvas.getContext('2d');
  
  // Tricky line: These inline styles guarantee the canvas floats invisibly over everything without blocking clicks
  Object.assign(canvas.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100vw',
    height: '100vh',
    pointerEvents: 'none',
    zIndex: '9998' // Just under the loader (9999)
  });
  
  document.body.appendChild(canvas);
  
  // Hide the default system cursor on the body
  document.body.style.cursor = 'none';

  // 3. Event Listeners
  window.addEventListener('resize', resizeCanvas);
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mousedown', onMouseDown);
  
  resizeCanvas();
  render(); // Start the animation loop
}

export function destroyCursor() {
  if (!isEnabled) return;
  isEnabled = false;
  
  cancelAnimationFrame(animationFrameId);
  window.removeEventListener('resize', resizeCanvas);
  window.removeEventListener('mousemove', onMouseMove);
  window.removeEventListener('mousedown', onMouseDown);
  
  if (canvas) canvas.remove();
  document.body.style.cursor = 'auto'; // Restore default cursor
}

function resizeCanvas() {
  // Tricky line: Multiplying by devicePixelRatio ensures the canvas isn't blurry on Retina/high-res displays
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  ctx.scale(dpr, dpr);
}

function onMouseMove(e) {
  const currentTime = Date.now();
  
  // Calculate speed (distance between last frame and this frame)
  const dx = e.clientX - lastMouse.x;
  const dy = e.clientY - lastMouse.y;
  const speed = Math.hypot(dx, dy); // Math.hypot(a, b) calculates the Pythagorean distance cleanly
  
  // Add new point to the trail
  trail.push({ x: e.clientX, y: e.clientY, time: currentTime });
  
  // Keep array within limits
  if (trail.length > TRAIL_LENGTH) {
    trail.shift();
  }

  // If moving fast, spawn spark particles
  if (speed > 15) {
    const sparkCount = Math.min(Math.floor(speed / 10), 6); // Max 6 sparks per frame
    for (let i = 0; i < sparkCount; i++) {
      sparks.push({
        x: e.clientX,
        y: e.clientY,
        vx: (Math.random() - 0.5) * (speed * 0.2), // Fling out based on speed
        vy: (Math.random() - 0.5) * (speed * 0.2),
        life: 1.0 // 1.0 means 100% alive, decreases over time
      });
    }
  }

  lastMouse = { x: e.clientX, y: e.clientY };
}

function onMouseDown(e) {
  // Spawn a slash flash at the click location
  slashes.push({
    x: e.clientX,
    y: e.clientY,
    life: 1.0,
    angle: Math.random() * Math.PI * 2 // Random diagonal rotation in radians
  });
}

// 4. The Main Animation Loop
function render() {
  if (!isEnabled) return;
  
  const currentTime = Date.now();
  
  // Clear the previous frame completely
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // --- DRAW TRAIL ---
  // Filter out points that are older than FADE_MS
  trail = trail.filter(p => currentTime - p.time < FADE_MS);
  
  if (trail.length > 1) {
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowBlur = 15;
    ctx.shadowColor = GLOW_COLOR;
    
    // Draw segments, tapering the thickness based on age
    for (let i = 0; i < trail.length - 1; i++) {
      const p1 = trail[i];
      const p2 = trail[i + 1];
      
      const ageRatio = 1 - ((currentTime - p1.time) / FADE_MS);
      
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      
      ctx.lineWidth = ageRatio * 6; // Thicker at the front, thin at the tail
      
      // Interpolate color from gold to white towards the head
      ctx.strokeStyle = i === trail.length - 2 ? '#ffffff' : GLOW_COLOR;
      ctx.stroke();
    }
    
    // Reset shadow so it doesn't affect sparks/slashes heavily
    ctx.shadowBlur = 0; 
  }

  // --- DRAW SPARKS ---
  for (let i = sparks.length - 1; i >= 0; i--) {
    let s = sparks[i];
    
    // Move spark
    s.x += s.vx;
    s.y += s.vy;
    s.life -= 0.05; // Fade out 5% per frame (~20 frames total life)
    
    if (s.life <= 0) {
      sparks.splice(i, 1);
    } else {
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.life * 2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 212, 0, ${s.life})`;
      ctx.fill();
    }
  }

  // --- DRAW SLASHES (Clicks) ---
  for (let i = slashes.length - 1; i >= 0; i--) {
    let slash = slashes[i];
    slash.life -= 0.1; // Very fast fade
    
    if (slash.life <= 0) {
      slashes.splice(i, 1);
    } else {
      ctx.save();
      ctx.translate(slash.x, slash.y);
      ctx.rotate(slash.angle);
      
      ctx.beginPath();
      // Draw a thin, long diagonal line
      ctx.moveTo(-30 * slash.life, 0);
      ctx.lineTo(30 * slash.life, 0);
      ctx.lineWidth = slash.life * 4;
      ctx.strokeStyle = `rgba(255, 255, 255, ${slash.life})`;
      ctx.stroke();
      
      ctx.restore(); // Undo translation/rotation for the next drawing
    }
  }

  // Schedule the next frame
  animationFrameId = requestAnimationFrame(render);
}