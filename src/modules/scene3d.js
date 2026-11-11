import * as THREE from 'three';
import gsap from 'gsap';
import '../styles/scene.css';

const FOG_COLOR = 0x050510;
const GATES = [
  { name: 'COMPETITIONS', z: -25, color: 0xFFD400 },
  { name: 'PASSES', z: -50, color: 0x00FFCC },
  { name: 'EVENTS', z: -75, color: 0xFF00FF },
  { name: 'CONTACT', z: -100, color: 0xFF4444 }
];

let scene, camera, renderer, animationId;
let raycaster, mouse;
let gateMeshes = [];
let htmlLabels = [];
let isEnabled = false;
let isTabActive = true;

const scrollState = { targetZ: 0, currentZ: 0 };
let mouseParallax = { x: 0, y: 0, targetX: 0, targetY: 0 };
let touchStartY = 0;

export function initScene(container) {
  isEnabled = true;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  // Tricky block: Check hardware capability. 
  // If CPU cores <= 4 (usually low-end mobile), slash polygon and particle counts to save battery.
  const isLowEnd = (navigator.hardwareConcurrency || 4) <= 4;
  const starCount = isLowEnd ? 300 : 1500;
  const torusSegments = isLowEnd ? 32 : 64;

  container.innerHTML = `
    <div class="scene-wrapper">
      <canvas id="three-canvas"></canvas>
      <div class="hud">
        <div class="hud-top">
          <div class="hud-logo">BLITZSCHLAG</div>
        </div>
        <div class="hud-bottom">SWIPE OR SCROLL TO EXPLORE</div>
      </div>
      <div id="labels-container" role="navigation" aria-label="3D World Destinations"></div>
    </div>
  `;

  const canvas = document.getElementById('three-canvas');
  const labelsContainer = document.getElementById('labels-container');

  scene = new THREE.Scene();
  scene.fog = new THREE.Fog(FOG_COLOR, 5, 40);
  scene.background = new THREE.Color(FOG_COLOR);

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 2, 0);

  renderer = new THREE.WebGLRenderer({ canvas, antialias: !isLowEnd });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444455, 0.5);
  scene.add(hemiLight);

  const starGeo = new THREE.BufferGeometry();
  const starPositions = new Float32Array(starCount * 3);
  for(let i = 0; i < starCount * 3; i++) starPositions[i] = (Math.random() - 0.5) * 100;
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.1 })));

  const gateGeo = new THREE.TorusGeometry(3, 0.2, 16, torusSegments);
  
  GATES.forEach((gateData) => {
    const gateMat = new THREE.MeshStandardMaterial({ 
      color: 0x222222, emissive: gateData.color, emissiveIntensity: 0.5 
    });
    
    const gate = new THREE.Mesh(gateGeo, gateMat);
    gate.position.set(0, 3, gateData.z);
    scene.add(gate);
    gateMeshes.push(gate);

    // Accessibility: Creating semantic, focusable HTML buttons tied to the 3D meshes
    const btn = document.createElement('button');
    btn.className = 'gate-label';
    btn.textContent = gateData.name;
    btn.style.color = '#' + gateData.color.toString(16).padStart(6, '0');
    btn.tabIndex = 0; // Makes it selectable via keyboard Tab key
    btn.setAttribute('aria-label', `Navigate to ${gateData.name}`);
    
    btn.onclick = () => {
      gsap.to(scrollState, {
        targetZ: gate.position.z - 5,
        duration: 1.5,
        onComplete: () => { window.location.hash = `/${gateData.name.toLowerCase()}`; }
      });
    };
    
    labelsContainer.appendChild(btn);
    htmlLabels.push({ element: btn, mesh: gate });
  });

  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2(-2, -2);

  window.addEventListener('resize', onWindowResize);
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('wheel', onScroll, { passive: true });
  window.addEventListener('touchstart', onTouchStart, { passive: true });
  window.addEventListener('touchmove', onTouchMove, { passive: true });
  document.addEventListener('visibilitychange', onVisibilityChange);

  animate();

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 - 1;
    if (!prefersReducedMotion) {
      mouseParallax.targetX = mouse.x * 0.5;
      mouseParallax.targetY = mouse.y * 0.5;
    }
  }

  function onScroll(event) {
    scrollState.targetZ -= event.deltaY * 0.05;
    scrollState.targetZ = Math.max(-110, Math.min(0, scrollState.targetZ));
  }

  // Mobile Touch Support
  function onTouchStart(event) {
    touchStartY = event.touches[0].clientY;
  }
  function onTouchMove(event) {
    const currentY = event.touches[0].clientY;
    const deltaY = touchStartY - currentY;
    scrollState.targetZ -= deltaY * 0.1;
    scrollState.targetZ = Math.max(-110, Math.min(0, scrollState.targetZ));
    touchStartY = currentY; // Reset for smooth dragging
  }

  function onVisibilityChange() {
    isTabActive = !document.hidden;
  }

  window._sceneHandlers = { onWindowResize, onMouseMove, onScroll, onTouchStart, onTouchMove, onVisibilityChange };
}

export function destroyScene(container) {
  if (!isEnabled) return;
  isEnabled = false;
  cancelAnimationFrame(animationId);
  
  const h = window._sceneHandlers;
  if (h) {
    window.removeEventListener('resize', h.onWindowResize);
    window.removeEventListener('mousemove', h.onMouseMove);
    window.removeEventListener('wheel', h.onScroll);
    window.removeEventListener('touchstart', h.onTouchStart);
    window.removeEventListener('touchmove', h.onTouchMove);
    document.removeEventListener('visibilitychange', h.onVisibilityChange);
    delete window._sceneHandlers;
  }

  gateMeshes = [];
  htmlLabels = [];

  scene.traverse((object) => {
    if (object.isMesh) {
      object.geometry.dispose();
      if (object.material.isMaterial) object.material.dispose();
    }
  });
  
  renderer.forceContextLoss();
  renderer.dispose();
  container.innerHTML = '';
}

function animate() {
  if (!isEnabled) return;
  animationId = requestAnimationFrame(animate);
  if (!isTabActive) return; 

  scrollState.currentZ += (scrollState.targetZ - scrollState.currentZ) * 0.05;
  camera.position.z = scrollState.currentZ;

  mouseParallax.x += (mouseParallax.targetX - mouseParallax.x) * 0.05;
  mouseParallax.y += (mouseParallax.targetY - mouseParallax.y) * 0.05;
  camera.position.x = mouseParallax.x;
  camera.position.y = 2 + mouseParallax.y; 

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(gateMeshes);
  
  gateMeshes.forEach(gate => {
    gate.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
    gate.material.emissiveIntensity = THREE.MathUtils.lerp(gate.material.emissiveIntensity, 0.5, 0.1);
  });
  
  htmlLabels.forEach(l => {
    l.element.style.opacity = 0;
    l.element.style.pointerEvents = 'none'; // Disable clicks if not hovering
  });

  if (intersects.length > 0) {
    const hoveredGate = intersects[0].object;
    hoveredGate.scale.lerp(new THREE.Vector3(1.1, 1.1, 1.1), 0.2);
    hoveredGate.material.emissiveIntensity = THREE.MathUtils.lerp(hoveredGate.material.emissiveIntensity, 1.5, 0.2);
    
    const labelData = htmlLabels.find(l => l.mesh === hoveredGate);
    if (labelData) {
      const vector = hoveredGate.position.clone();
      vector.y += 4;
      vector.project(camera);
      const x = (vector.x * .5 + .5) * window.innerWidth;
      const y = (vector.y * -.5 + .5) * window.innerHeight;
      labelData.element.style.left = `${x}px`;
      labelData.element.style.top = `${y}px`;
      labelData.element.style.opacity = 1;
      labelData.element.style.pointerEvents = 'auto'; // Enable physical clicks on the button
    }
  }
  renderer.render(scene, camera);
}