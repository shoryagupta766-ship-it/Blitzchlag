// src/game/GameManager.js
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ZONES, CAMERA } from './config.js';
import { getDeviceTier, getPixelRatio } from './utils/perf.js';
import { prefersReducedMotion } from './utils/accessibility.js';
import { Road } from './world/Road.js';
import { Skybox } from './world/Skybox.js';
import { Lighting } from './world/Lighting.js';
import { ZoneBuilder } from './world/ZoneBuilder.js';
import { Atmosphere } from './world/Atmosphere.js';

import { InputManager } from './controls/InputManager.js';
import { VehicleController } from './vehicles/VehicleController.js';
import { VehicleManager } from './vehicles/VehicleManager.js';
import { CameraRig } from './camera/CameraRig.js';

import { DestinationManager } from './destinations/DestinationManager.js';
import { events } from './utils/events.js';
import { state } from './utils/state.js';
import { HUD } from './hud/HUD.js';
import { AudioManager } from './audio/AudioManager.js';

import '../styles/hud.css';

export class GameManager {
    constructor() {
        this._active = false;
        this._tabVisible = true;
        this._parallax = { x: 0, y: 0, tx: 0, ty: 0 };

        // Core Managers
        this._input = null;
        this._vControl = null;
        this._vManager = null;
        this._cameraRig = null;
        this._destManager = null;
        this._hud = null;
        this._audio = null;

        this._renderer = null;
        this._scene = null;
        this._camera = null;
        this._road = null;
        this._skybox = null;
        this._lighting = null;
        this._zoneBuilders = [];
        this._atmosphere = null;
        this._rafId = null;
        this._clock = null;

        this._frames = 0;
        this._lastTime = performance.now();
        this._devOverlay = null;
    }

    init(container) {
        this._active = true;
        this._container = container;
        const tier = getDeviceTier();
        const reduced = prefersReducedMotion();

        container.innerHTML = `
          <div class="scene-wrapper">
            <canvas id="three-canvas"></canvas>
            <!-- HUD container gets populated by HUD.js -->
            <div id="dev-stats" style="display:none; position:absolute; top:0; right:0; background:rgba(0,0,0,0.8); color:lime; padding:10px; z-index:9999; font-family:monospace; pointer-events:none;"></div>
          </div>
        `;

        const canvas = container.querySelector('#three-canvas');
        this._devOverlay = container.querySelector('#dev-stats');

        this._renderer = new THREE.WebGLRenderer({ canvas, antialias: tier === 'high' });
        this._renderer.setSize(window.innerWidth, window.innerHeight);
        this._renderer.setPixelRatio(getPixelRatio());

        this._scene = new THREE.Scene();
        const zone0 = ZONES[0];
        this._scene.fog = new THREE.Fog(zone0.fogColor, 10, 200);
        this._scene.background = new THREE.Color(zone0.fogColor);

        this._camera = new THREE.PerspectiveCamera(CAMERA.fov, window.innerWidth / window.innerHeight, CAMERA.near, CAMERA.far);

        this._road = new Road(this._scene);
        this._skybox = new Skybox(this._scene);
        this._lighting = new Lighting(this._scene);
        this._clock = new THREE.Clock();

        this._zoneBuilders = [
            new ZoneBuilder(this._scene, this._road.curve, ZONES[0], tier), // New Jaipur
            new ZoneBuilder(this._scene, this._road.curve, ZONES[1], tier), // Old City
            new ZoneBuilder(this._scene, this._road.curve, ZONES[2], tier)  // Finale
        ];
        this._atmosphere = new Atmosphere(this._scene, this._skybox, this._lighting);
        
        // Vehicles & Input
        this._input = new InputManager();
        this._vControl = new VehicleController(this._road.curve);
        this._vManager = new VehicleManager(this._scene);

        // Restore last saved 't' state
        const savedT = parseFloat(sessionStorage.getItem('blitz.lastT'));
        if (!isNaN(savedT) && savedT >= 0 && savedT <= 1) {
            this._vControl.t = savedT;
        }

        this._vManager.init('auto');
        this._cameraRig = new CameraRig(this._camera, this._parallax);

        // Wire up destinations
        this._destManager = new DestinationManager(
            this._scene, this._camera, this._road.curve,
            this._input, this._container, this._zoneBuilders
        );

        // HUD & Audio
        this._audio = new AudioManager();
        this._hud = new HUD(container.querySelector('.scene-wrapper'), this._audio);

        // Fast Travel Listener
        events.on('fastTravel', (targetT) => {
            if (this._destManager._isEntering) return;
            gsap.to(this._vControl, {
                t: targetT,
                duration: 2.0,
                ease: 'power2.inOut'
            });
        });

        // Setup Initial Zone State
        let initialZone = ZONES[0].label;
        ZONES.forEach(z => {
            if (this._vControl.t >= z.tStart && this._vControl.t <= z.tEnd) initialZone = z.label;
        });
        state.zoneLabel = initialZone;

        this._onResize = this._onResize.bind(this);
        this._onMouseMove = this._onMouseMove.bind(this);
        this._onVisChange = this._onVisChange.bind(this);
        this._onKey = this._onKey.bind(this);

        window.addEventListener('resize', this._onResize);
        window.addEventListener('mousemove', this._onMouseMove);
        document.addEventListener('visibilitychange', this._onVisChange);
        window.addEventListener('keydown', this._onKey);

        // Force immediate camera snap to restored T position
        const { position, rotationY, frame } = this._vControl.getTransform();
        this._vManager.activeVehicle.group.position.copy(position);
        this._vManager.activeVehicle.group.rotation.y = rotationY;
        this._cameraRig.update(0.016, this._vManager.activeVehicle.group, this._vManager.activeVehicle.seat, this._vManager.activeConfig, frame, 0, false);

        this._animate();
    }

    _onKey(e) {
        if (e.code === 'Backquote') {
            this._devOverlay.style.display = this._devOverlay.style.display === 'none' ? 'block' : 'none';
        }
    }

    destroy(container) {
        if (!this._active) return;
        this._active = false;
        cancelAnimationFrame(this._rafId);

        events.clear();

        window.removeEventListener('resize', this._onResize);
        window.removeEventListener('mousemove', this._onMouseMove);
        document.addEventListener('visibilitychange', this._onVisChange);
        window.removeEventListener('keydown', this._onKey);

        this._hud.dispose();
        this._audio.dispose();
        this._destManager.dispose();
        this._input.dispose();
        this._vManager.dispose();
        this._zoneBuilders.forEach(zb => zb.dispose());
        this._road.dispose();
        this._skybox.dispose();
        this._lighting.dispose();

        this._scene.traverse(obj => {
            if (obj.isMesh || obj.isLine || obj.isPoints) {
                if (obj.geometry) obj.geometry.dispose();
                if (obj.material) {
                    const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
                    mats.forEach(m => {
                        if (m.map) m.map.dispose();
                        m.dispose();
                    });
                }
            }
        });

        this._renderer.forceContextLoss();
        this._renderer.dispose();
        container.innerHTML = '';
    }

    _onResize() {
        this._camera.aspect = window.innerWidth / window.innerHeight;
        this._camera.updateProjectionMatrix();
        this._renderer.setSize(window.innerWidth, window.innerHeight);
    }

    _onMouseMove(e) {
        if (prefersReducedMotion()) return;
        this._parallax.tx = ((e.clientX / window.innerWidth) - 0.5) * 2;
        this._parallax.ty = ((e.clientY / window.innerHeight) - 0.5) * 2;
    }

    _onVisChange() { this._tabVisible = !document.hidden; }

    _animate() {
        if (!this._active) return;
        this._rafId = requestAnimationFrame(() => this._animate());
        if (!this._tabVisible) return;

        const dt = Math.min(this._clock.getDelta(), 0.05); // cap at 20fps equivalent

        // 1. Inputs (Freeze player physics if entering a destination)
        if (this._destManager._isEntering) {
            this._vControl.speed *= 0.9; // Decelerate to stop
        } else {
            if (this._input.consumePressed('toggleCam')) this._cameraRig.cycleView();
            if (this._input.consumePressed('vehicle1')) this._vManager.swap('auto');
            if (this._input.consumePressed('vehicle2')) this._vManager.swap('camel');
            if (this._input.consumePressed('vehicle3')) this._vManager.swap('elephant');
        }

        // 2. Physics & Transform Updates
        const activeCfg = this._vManager.activeConfig;
        const { position, rotationY, frame } = this._vControl.update(dt, this._input, activeCfg);

        // Constantly save progress so returning from a page spawns you right here
        if (!this._destManager._isEntering) {
            sessionStorage.setItem('blitz.lastT', this._vControl.t.toString());
        }

        // 3. Sync Data to Global State Object
        state.speed = this._vControl.speed;
        state.t = this._vControl.t;
        state.nearestDestination = this._destManager._activeDest;

        // Zone Toast Logic
        let currentZone = state.zoneLabel;
        ZONES.forEach(z => {
            if (state.t >= z.tStart && state.t <= z.tEnd) currentZone = z.label;
        });
        if (currentZone !== state.zoneLabel) {
            state.zoneLabel = currentZone;
            events.emit('zone:change', currentZone);
        }

        // 4. Move Vehicle Mesh & Handle Audio
        if (this._vManager.activeVehicle) {
            const vGroup = this._vManager.activeVehicle.group;
            vGroup.position.copy(position);
            vGroup.rotation.y = rotationY;

            this._vManager.update(dt, this._vControl.speed, this._vControl.steer);
            
            // Audio Updates
            this._audio.update(this._vManager.activeConfig, this._vControl.speed);

            if (activeCfg.shakeOnStep && this._vManager.activeVehicle.shakeImpulse) {
                this._cameraRig.addShake(this._vManager.activeVehicle.shakeImpulse);
                this._audio.playThud();
            }
        }

        // 5. Update Camera (freeze camera follow if GSAP fly-in hijacked it)
        if (!this._destManager._isEntering && this._vManager.activeVehicle) {
            this._cameraRig.update(
                dt,
                this._vManager.activeVehicle.group,
                this._vManager.activeVehicle.seat,
                activeCfg,
                frame,
                this._vControl.speed,
                this._input.isDown('boost')
            );
        }
        
        // 6. Component Updates
        this._destManager.update(dt, this._vControl.t, this._camera.position);
        this._atmosphere.update(this._vControl.t, this._zoneBuilders);
        this._zoneBuilders.forEach(zb => zb.update(dt, this._vControl.t, this._camera.position));
        this._skybox.update(this._camera.position);
        
        this._hud.update(dt);
        this._input.update();

        // 7. Render Loop
        this._renderer.render(this._scene, this._camera);

        // 8. Dev Stats
        if (this._devOverlay.style.display === 'block') {
            this._frames++;
            const now = performance.now();
            if (now >= this._lastTime + 1000) {
                const fps = Math.round((this._frames * 1000) / (now - this._lastTime));
                this._devOverlay.innerHTML = `FPS: ${fps}<br>Calls: ${this._renderer.info.render.calls}<br>Tris: ${this._renderer.info.render.triangles}`;
                this._frames = 0;
                this._lastTime = now;
            }
        }
    }
}