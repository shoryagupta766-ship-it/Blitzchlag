// src/game/destinations/FlyIn.js
// GSAP cinematic camera sequence.

import { gsap } from 'gsap';
import { prefersReducedMotion } from '../utils/accessibility.js';

export class FlyIn {
  constructor(camera) {
    this._camera = camera;
    this._timeline = null;
  }

  execute(dest, markerGroup, onComplete) {
    if (prefersReducedMotion()) {
      onComplete();
      return;
    }

    // Freeze physics, trigger flash, fly to marker
    this._timeline = gsap.timeline({ onComplete });

    const targetPos = markerGroup.position.clone();
    targetPos.y += 3; // eye level

    // Simple gold flash div for transition
    const flash = document.createElement('div');
    Object.assign(flash.style, {
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      backgroundColor: '#D4A017', opacity: 0, zIndex: 8500, pointerEvents: 'none'
    });
    document.body.appendChild(flash);

    this._timeline
      .to(this._camera.position, {
        x: targetPos.x, y: targetPos.y, z: targetPos.z,
        duration: 1.5,
        ease: 'power2.inOut'
      }, 0)
      .to(this._camera, {
        fov: 30, // dramatic zoom
        duration: 1.5,
        ease: 'power2.inOut',
        onUpdate: () => this._camera.updateProjectionMatrix()
      }, 0)
      .to(flash.style, {
        opacity: 1,
        duration: 0.4,
        ease: 'power1.in'
      }, 1.1)
      .add(() => flash.remove(), 1.6);
  }

  dispose() {
    if (this._timeline) {
      this._timeline.kill();
    }
  }
}