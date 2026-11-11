// src/game/world/zoneC/Fireworks.js
// Object-pooled additive blending particle system.

import * as THREE from 'three';
import { prefersReducedMotion } from '../../utils/accessibility.js';

export class Fireworks {
  constructor(parentGroup, curve, tier) {
    this.parent = parentGroup;
    this.active = !prefersReducedMotion();
    if (!this.active) return;

    this.count = tier === 'low' ? 150 : 500;
    this._timer = 0;
    
    // Arrays for pooling
    this.positions = new Float32Array(this.count * 3);
    this.velocities = new Float32Array(this.count * 3);
    this.colors = new Float32Array(this.count * 3);
    this.lifes = new Float32Array(this.count); // 0 = dead/ready

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(this.colors, 3));
    
    this.material = new THREE.PointsMaterial({
      size: 1.2,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
      opacity: 0.8,
    });

    this.points = new THREE.Points(geo, this.material);
    this.parent.add(this.points);
  }

  _explode() {
    const origin = new THREE.Vector3((Math.random()-0.5)*30, 25 + Math.random()*15, -880 + Math.random()*20);
    const palette = [ [1,0.8,0], [1,0,1], [0,1,1], [1,1,1] ]; // RGB normalized
    const color = palette[Math.floor(Math.random() * palette.length)];

    // Find dead particles in the pool and reuse them
    let spawned = 0;
    for (let i = 0; i < this.count; i++) {
      if (this.lifes[i] <= 0) {
        this.positions[i*3] = origin.x;
        this.positions[i*3+1] = origin.y;
        this.positions[i*3+2] = origin.z;
        
        const velocity = new THREE.Vector3(
          (Math.random()-0.5)*15, 
          (Math.random()-0.5)*15, 
          (Math.random()-0.5)*15
        ).multiplyScalar(Math.random() * 0.5 + 0.5);

        this.velocities[i*3] = velocity.x;
        this.velocities[i*3+1] = velocity.y;
        this.velocities[i*3+2] = velocity.z;
        
        this.colors[i*3] = color[0];
        this.colors[i*3+1] = color[1];
        this.colors[i*3+2] = color[2];
        
        this.lifes[i] = 1.0 + Math.random() * 0.5;
        
        spawned++;
        if (spawned > 40) break; // Burst size
      }
    }
  }

  update(dt, t) {
    if (!this.active || t < 0.85) return;

    this._timer += dt;
    if (this._timer > 1.8 + Math.random() * 1.2) {
      this._explode();
      this._timer = 0;
    }

    let needsUpdate = false;
    for (let i = 0; i < this.count; i++) {
      if (this.lifes[i] > 0) {
        this.lifes[i] -= dt;
        
        this.positions[i*3] += this.velocities[i*3] * dt;
        this.positions[i*3+1] += this.velocities[i*3+1] * dt - (9.8 * dt); // Gravity
        this.positions[i*3+2] += this.velocities[i*3+2] * dt;
        
        // Decay velocity (drag)
        this.velocities[i*3] *= 0.95;
        this.velocities[i*3+1] *= 0.95;
        this.velocities[i*3+2] *= 0.95;

        // Fade out
        this.colors[i*3] *= 0.95;
        this.colors[i*3+1] *= 0.95;
        this.colors[i*3+2] *= 0.95;
        
        needsUpdate = true;
      } else {
        // Hide dead particles
        this.positions[i*3] = 9999;
      }
    }

    if (needsUpdate) {
      this.points.geometry.attributes.position.needsUpdate = true;
      this.points.geometry.attributes.color.needsUpdate = true;
    }
  }

  dispose() {
    if (this.active) {
      this.parent.remove(this.points);
      this.points.geometry.dispose();
      this.material.dispose();
    }
  }
}