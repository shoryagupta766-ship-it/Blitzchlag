// src/game/destinations/FlyIn.js
import { gsap } from 'gsap';
import { prefersReducedMotion } from '../utils/accessibility.js';

export class FlyIn {
  constructor(camera) {
    this._camera = camera;
    this._timeline = null;
  }

  execute(dest, markerGroup, onComplete) {
    const isReduced = prefersReducedMotion();
    
    this._timeline = gsap.timeline({ onComplete });

    const targetPos = markerGroup.position.clone();
    targetPos.y += 3;

    // Accessibility: Fade to black instead of bright gold flash
    const overlay = document.createElement('div');
    Object.assign(overlay.style, {
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      backgroundColor: isReduced ? '#000000' : '#D4A017', 
      opacity: 0, zIndex: 8500, pointerEvents: 'none'
    });
    document.body.appendChild(overlay);

    if (isReduced) {
      // Reduced motion: Skip camera swoop, just fade screen quickly and route
      this._timeline
        .to(overlay.style, { opacity: 1, duration: 0.3, ease: 'linear' })
        .add(() => overlay.remove(), 0.5);
    } else {
      // Full cinematic camera swoop
      this._timeline
        .to(this._camera.position, {
          x: targetPos.x, y: targetPos.y, z: targetPos.z,
          duration: 1.5,
          ease: 'power2.inOut'
        }, 0)
        .to(this._camera, {
          fov: 30,
          duration: 1.5,
          ease: 'power2.inOut',
          onUpdate: () => this._camera.updateProjectionMatrix()
        }, 0)
        .to(overlay.style, {
          opacity: 1, duration: 0.4, ease: 'power1.in'
        }, 1.1)
        .add(() => overlay.remove(), 1.6);
    }
  }

  dispose() {
    if (this._timeline) this._timeline.kill();
  }
}