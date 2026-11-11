// src/game/GameManager.js
// ──────────────────────────────────────────────────────────────
// The master orchestrator.  It creates the THREE renderer,
// scene and camera, instantiates every world subsystem, runs
// the game loop, and tears everything down on destroy().
//
// For Lesson 1 the "game loop" is simple:
//   scroll / touch → advance t along the curve → chase-camera.
// Later lessons add vehicle physics, HUD updates, zone
// transitions, and destination proximity checks.
// ──────────────────────────────────────────────────────────────
import * as THREE from 'three';
import { PALETTE, ZONES, CAMERA, SCROLL } from './config.js';
import { getDeviceTier, getPixelRatio } from './utils/perf.js';
import { prefersReducedMotion }         from './utils/accessibility.js';
import { Road }     from './world/Road.js';
import { Skybox }   from './world/Skybox.js';
import { Lighting } from './world/Lighting.js';

export class GameManager {
  constructor() {
    // State flags
    this._active       = false;
    this._tabVisible   = true;

    // Curve-follow state
    this._targetT      = 0;          // where scroll wants to be
    this._currentT     = 0;          // where the camera actually is (lerped)

    // Mouse parallax state
    this._parallax     = { x: 0, y: 0, tx: 0, ty: 0 };

    // Touch scroll state
    this._touchStartY  = 0;

    // References (set in init)
    this._renderer     = null;
    this._scene        = null;
    this._camera       = null;
    this._road         = null;
    this._skybox       = null;
    this._lighting     = null;
    this._rafId        = null;
    this._container    = null;
    this._clock        = null;
  }

  /* ═══════════════════════ PUBLIC API ═══════════════════════ */

  /**
   * Mount the game inside the given container DOM element.
   * Matches the initScene(container) contract.
   */
  init(container) {
    this._active    = true;
    this._container = container;

    const tier      = getDeviceTier();
    const reduced   = prefersReducedMotion();

    // ── DOM structure ────────────────────────────────────────
    container.innerHTML = `
      <div class="scene-wrapper">
        <canvas id="three-canvas"></canvas>
        <div class="hud">
          <div class="hud-top">
            <div class="hud-logo">BLITZSCHLAG</div>
          </div>
          <div class="hud-bottom">${reduced ? 'USE BUTTONS TO NAVIGATE' : 'SCROLL OR SWIPE TO DRIVE'}</div>
        </div>
      </div>
    `;

    const canvas = container.querySelector('#three-canvas');

    // ── Renderer ─────────────────────────────────────────────
    this._renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: tier === 'high',
    });
    this._renderer.setSize(window.innerWidth, window.innerHeight);
    this._renderer.setPixelRatio(getPixelRatio());

    // ── Scene ────────────────────────────────────────────────
    this._scene = new THREE.Scene();
    const zone0 = ZONES[0];
    this._scene.fog = new THREE.Fog(zone0.fogColor, 10, 200);
    this._scene.background = new THREE.Color(zone0.fogColor);

    // ── Camera ───────────────────────────────────────────────
    this._camera = new THREE.PerspectiveCamera(
      CAMERA.fov,
      window.innerWidth / window.innerHeight,
      CAMERA.near,
      CAMERA.far,
    );

    // ── World objects ────────────────────────────────────────
    this._road     = new Road(this._scene);
    this._skybox   = new Skybox(this._scene);
    this._lighting = new Lighting(this._scene);

    // ── Clock (for delta-time) ───────────────────────────────
    this._clock = new THREE.Clock();

    // ── Bind & attach listeners ──────────────────────────────
    this._onResize      = this._onResize.bind(this);
    this._onWheel       = this._onWheel.bind(this);
    this._onMouseMove   = this._onMouseMove.bind(this);
    this._onTouchStart  = this._onTouchStart.bind(this);
    this._onTouchMove   = this._onTouchMove.bind(this);
    this._onVisChange   = this._onVisChange.bind(this);

    window.addEventListener('resize',      this._onResize);
    window.addEventListener('wheel',       this._onWheel,      { passive: true });
    window.addEventListener('mousemove',   this._onMouseMove);
    window.addEventListener('touchstart',  this._onTouchStart,  { passive: true });
    window.addEventListener('touchmove',   this._onTouchMove,   { passive: true });
    document.addEventListener('visibilitychange', this._onVisChange);

    // ── Place camera at start and kick off the loop ──────────
    this._updateCamera(true);    // instant snap, no lerp
    this._animate();
  }

  /**
   * Tear everything down.  Matches the destroyScene(container)
   * contract: stop loop, remove listeners, dispose GPU resources,
   * forceContextLoss(), clear the container.
   */
  destroy(container) {
    if (!this._active) return;
    this._active = false;

    // 1. Stop loop
    cancelAnimationFrame(this._rafId);

    // 2. Remove every listener
    window.removeEventListener('resize',     this._onResize);
    window.removeEventListener('wheel',      this._onWheel);
    window.removeEventListener('mousemove',  this._onMouseMove);
    window.removeEventListener('touchstart', this._onTouchStart);
    window.removeEventListener('touchmove',  this._onTouchMove);
    document.removeEventListener('visibilitychange', this._onVisChange);

    // 3. Dispose subsystems (geometry + materials)
    this._road.dispose();
    this._skybox.dispose();
    this._lighting.dispose();

    // 4. Walk the scene for anything we missed
    this._scene.traverse(obj => {
      if (obj.isMesh || obj.isLine || obj.isPoints) {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
          mats.forEach(m => {
            if (m.map)       m.map.dispose();
            if (m.normalMap) m.normalMap.dispose();
            m.dispose();
          });
        }
      }
    });

    // 5. Context loss + renderer dispose
    this._renderer.forceContextLoss();
    this._renderer.dispose();

    // 6. Clear DOM
    container.innerHTML = '';
  }

  /* ═══════════════════ EVENT HANDLERS ═══════════════════════ */

  _onResize() {
    this._camera.aspect = window.innerWidth / window.innerHeight;
    this._camera.updateProjectionMatrix();
    this._renderer.setSize(window.innerWidth, window.innerHeight);
  }

  /**
   * Mouse-wheel drives the player forward/backward along the
   * road.  Positive deltaY (scroll down) = drive forward.
   */
  _onWheel(e) {
    this._targetT += e.deltaY * SCROLL.wheelSensitivity;
    this._targetT  = Math.max(0, Math.min(SCROLL.maxT, this._targetT));
  }

  /**
   * Mouse-move feeds the parallax offset.
   * Values are normalised to ±1 from viewport centre.
   */
  _onMouseMove(e) {
    if (prefersReducedMotion()) return;
    this._parallax.tx = ((e.clientX / window.innerWidth)  - 0.5) * 2;
    this._parallax.ty = ((e.clientY / window.innerHeight) - 0.5) * 2;
  }

  _onTouchStart(e) {
    this._touchStartY = e.touches[0].clientY;
  }

  /**
   * Touch-drag = swipe-to-drive on mobile.
   * Dragging upward (finger moves up-screen) drives forward.
   */
  _onTouchMove(e) {
    const y     = e.touches[0].clientY;
    const delta = this._touchStartY - y;           // positive = dragged upward
    this._targetT += delta * SCROLL.touchSensitivity;
    this._targetT  = Math.max(0, Math.min(SCROLL.maxT, this._targetT));
    this._touchStartY = y;
  }

  _onVisChange() {
    this._tabVisible = !document.hidden;
  }

  /* ═══════════════════ GAME LOOP ═══════════════════════════ */

  _animate() {
    if (!this._active) return;
    this._rafId = requestAnimationFrame(() => this._animate());

    // Skip rendering when tab is hidden — saves battery.
    if (!this._tabVisible) return;

    this._updateCamera(false);
    this._renderer.render(this._scene, this._camera);
  }

  /**
   * Chase-camera: smoothly follows a point on the road curve.
   *
   * @param {boolean} snap — if true, teleport instantly (used on
   *   first frame so the camera doesn't lerp in from the origin).
   *
   * How it works:
   *   1. Lerp currentT toward targetT (smooth scroll).
   *   2. Sample the curve at currentT → road point.
   *   3. Get the tangent → tells us "which way is forward".
   *   4. Place the camera BEHIND the road point (opposite tangent)
   *      and ABOVE it.
   *   5. Look at a point slightly AHEAD on the curve.
   *   6. Add mouse-parallax offset for depth feel.
   */
  _updateCamera(snap) {
    const lerp = snap ? 1 : CAMERA.lerpSpeed;

    // 1. Smooth-follow the scroll target
    this._currentT += (this._targetT - this._currentT) * lerp;

    const t = this._currentT;

    // 2. Sample curve
    const point   = this._road.curve.getPointAt(t);
    const tangent = this._road.curve.getTangentAt(t);

    // 3. Look-ahead point
    const lookT   = Math.min(t + CAMERA.lookAheadT, SCROLL.maxT);
    const lookAt  = this._road.curve.getPointAt(lookT);

    // 4. Camera position = road point − tangent × followDist + up × followHeight
    const camX = point.x - tangent.x * CAMERA.followDistance;
    const camY = point.y + CAMERA.followHeight;
    const camZ = point.z - tangent.z * CAMERA.followDistance;

    // 5. Smooth parallax
    this._parallax.x += (this._parallax.tx * CAMERA.parallaxStrength - this._parallax.x) * 0.05;
    this._parallax.y += (this._parallax.ty * CAMERA.parallaxStrength - this._parallax.y) * 0.05;

    if (snap) {
      this._camera.position.set(camX, camY, camZ);
    } else {
      // Lerp camera position for buttery smoothness
      this._camera.position.x += (camX + this._parallax.x - this._camera.position.x) * lerp;
      this._camera.position.y += (camY + this._parallax.y - this._camera.position.y) * lerp;
      this._camera.position.z += (camZ                     - this._camera.position.z) * lerp;
    }

    // 6. Look at the ahead-point (lookAt.y raised to eye level)
    this._camera.lookAt(lookAt.x, lookAt.y + 1.5, lookAt.z);
  }
}
