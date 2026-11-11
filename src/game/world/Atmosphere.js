// src/game/world/Atmosphere.js
// Paused GSAP timeline mapped to road parameter 't' for zero-allocation day/night cycles.

import * as THREE from 'three';
import { gsap } from 'gsap';
import { ZONES } from '../config.js';

export class Atmosphere {
    constructor(scene, skybox, lighting) {
        this._scene = scene;
        this._skybox = skybox;
        this._lighting = lighting;
        this._zoneBuilders = [];

        // Proxy objects for GSAP to tween, which we then apply to materials in onUpdate
        this.state = {
            skyTop: new THREE.Color(ZONES[0].skyTop),
            skyBottom: new THREE.Color(ZONES[0].skyBottom),
            fogColor: new THREE.Color(ZONES[0].fogColor),
            sunColor: new THREE.Color(ZONES[0].sunColor),
            sunIntensity: ZONES[0].sunIntensity,
            nightFactor: 0,
            starOpacity: 0
        };

        this._createStars();
        this._buildTimeline();
    }

    _createStars() {
        const starGeo = new THREE.BufferGeometry();
        const starCount = 800;
        const positions = new Float32Array(starCount * 3);
        
        for(let i = 0; i < starCount; i++) {
            // Distribute on the upper hemisphere
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(Math.random());
            const r = 400; // Inside skybox
            
            positions[i*3] = r * Math.sin(phi) * Math.cos(theta);
            positions[i*3+1] = Math.abs(r * Math.cos(phi));
            positions[i*3+2] = r * Math.sin(phi) * Math.sin(theta);
        }
        
        starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 1.5, transparent: true, opacity: 0 });
        this.stars = new THREE.Points(starGeo, this.starMat);
        this.stars.renderOrder = -1; // Render right after skybox
        this._scene.add(this.stars);
    }

    _buildTimeline() {
        // Paused timeline from 0 to 1 (representing t)
        this.tl = gsap.timeline({ paused: true, onUpdate: () => this._applyState() });
        
        // ZONES[0] -> ZONES[1] transition (t = 0.30 to 0.40)
        this.tl.to(this.state.skyTop, { r: new THREE.Color(ZONES[1].skyTop).r, g: new THREE.Color(ZONES[1].skyTop).g, b: new THREE.Color(ZONES[1].skyTop).b, duration: 0.1, ease: 'none' }, 0.30)
               .to(this.state.skyBottom, { r: new THREE.Color(ZONES[1].skyBottom).r, g: new THREE.Color(ZONES[1].skyBottom).g, b: new THREE.Color(ZONES[1].skyBottom).b, duration: 0.1, ease: 'none' }, 0.30)
               .to(this.state.fogColor, { r: new THREE.Color(ZONES[1].fogColor).r, g: new THREE.Color(ZONES[1].fogColor).g, b: new THREE.Color(ZONES[1].fogColor).b, duration: 0.1, ease: 'none' }, 0.30)
               .to(this.state.sunColor, { r: new THREE.Color(ZONES[1].sunColor).r, g: new THREE.Color(ZONES[1].sunColor).g, b: new THREE.Color(ZONES[1].sunColor).b, duration: 0.1, ease: 'none' }, 0.30)
               .to(this.state, { sunIntensity: ZONES[1].sunIntensity, duration: 0.1, ease: 'none' }, 0.30);

        // ZONES[1] -> ZONES[2] transition (t = 0.70 to 0.80)
        this.tl.to(this.state.skyTop, { r: new THREE.Color(ZONES[2].skyTop).r, g: new THREE.Color(ZONES[2].skyTop).g, b: new THREE.Color(ZONES[2].skyTop).b, duration: 0.1, ease: 'none' }, 0.70)
               .to(this.state.skyBottom, { r: new THREE.Color(ZONES[2].skyBottom).r, g: new THREE.Color(ZONES[2].skyBottom).g, b: new THREE.Color(ZONES[2].skyBottom).b, duration: 0.1, ease: 'none' }, 0.70)
               .to(this.state.fogColor, { r: new THREE.Color(ZONES[2].fogColor).r, g: new THREE.Color(ZONES[2].fogColor).g, b: new THREE.Color(ZONES[2].fogColor).b, duration: 0.1, ease: 'none' }, 0.70)
               .to(this.state.sunColor, { r: new THREE.Color(ZONES[2].sunColor).r, g: new THREE.Color(ZONES[2].sunColor).g, b: new THREE.Color(ZONES[2].sunColor).b, duration: 0.1, ease: 'none' }, 0.70)
               .to(this.state, { sunIntensity: ZONES[2].sunIntensity, duration: 0.1, ease: 'none' }, 0.70)
               .to(this.state, { nightFactor: 1.0, duration: 0.1, ease: 'none' }, 0.70)
               .to(this.state, { starOpacity: 0.8, duration: 0.15, ease: 'none' }, 0.75); // Stars fade in
    }

    _applyState() {
        this._skybox.setColors(this.state.skyTop, this.state.skyBottom);
        this._scene.fog.color.copy(this.state.fogColor);
        this._scene.background.copy(this.state.fogColor);
        
        this._lighting.sun.color.copy(this.state.sunColor);
        this._lighting.sun.intensity = this.state.sunIntensity;
        this._lighting.hemi.color.copy(this.state.sunColor);
        
        this.starMat.opacity = this.state.starOpacity;

        this._zoneBuilders.forEach(zb => zb.setNightFactor(this.state.nightFactor));
    }

    update(t, zoneBuilders, cameraPos) {
        this._zoneBuilders = zoneBuilders; // cache ref
        // Scrub the GSAP timeline manually based on the vehicle's position
        this.tl.progress(t); 
        this.stars.position.copy(cameraPos); // Stars follow camera like skybox
    }

    dispose() {
        this.tl.kill();
        this._scene.remove(this.stars);
        this.stars.geometry.dispose();
        this.starMat.dispose();
    }
}