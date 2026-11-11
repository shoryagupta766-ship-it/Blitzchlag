// src/game/camera/CameraRig.js
// Dynamic vehicle follow camera with parallax, bob, shake, and view modes.

import * as THREE from 'three';
import { CAMERA } from '../config.js';
import { prefersReducedMotion } from '../utils/accessibility.js';

export class CameraRig {
  constructor(camera, mouseParallax) {
    this._camera = camera;
    this._parallax = mouseParallax; // Ref to GameManager's _parallax object
    this._modeIndex = 0;
    this._modes = ['chase', 'high', 'side'];
    
    this._baseFov = CAMERA.fov;
    this._shakeIntensity = 0;
  }

  cycleView() {
    this._modeIndex = (this._modeIndex + 1) % this._modes.length;
  }

  update(dt, vehicleGroup, seatTarget, vehicleConfig, roadFrame, speed, isBoosting) {
    const reduced = prefersReducedMotion();
    const mode = this._modes[this._modeIndex];
    
    // Target calculation based on mode
    let targetX, targetY, targetZ;
    let lookAtTarget = new THREE.Vector3();

    if (mode === 'chase') {
      const offset = roadFrame.tangent.clone().multiplyScalar(-CAMERA.followDistance);
      targetX = vehicleGroup.position.x + offset.x;
      targetY = vehicleGroup.position.y + CAMERA.followHeight;
      targetZ = vehicleGroup.position.z + offset.z;
      
      lookAtTarget.setFromMatrixPosition(seatTarget.matrixWorld);
      lookAtTarget.add(roadFrame.tangent.clone().multiplyScalar(10)); // look ahead
    } 
    else if (mode === 'high') {
      targetX = vehicleGroup.position.x;
      targetY = vehicleGroup.position.y + 20;
      targetZ = vehicleGroup.position.z + 15;
      lookAtTarget.copy(vehicleGroup.position);
    } 
    else if (mode === 'side') {
      const offset = roadFrame.right.clone().multiplyScalar(12);
      targetX = vehicleGroup.position.x + offset.x;
      targetY = vehicleGroup.position.y + 2;
      targetZ = vehicleGroup.position.z + offset.z;
      lookAtTarget.copy(vehicleGroup.position);
    }

    // Parallax
    if (!reduced) {
      this._parallax.x += (this._parallax.tx * CAMERA.parallaxStrength - this._parallax.x) * 5 * dt;
      this._parallax.y += (this._parallax.ty * CAMERA.parallaxStrength - this._parallax.y) * 5 * dt;
      targetX += this._parallax.x;
      targetY += this._parallax.y;
    }

    // Smooth Lerp Camera Position
    const lerp = mode === 'chase' ? 8 * dt : 4 * dt;
    this._camera.position.x += (targetX - this._camera.position.x) * lerp;
    this._camera.position.y += (targetY - this._camera.position.y) * lerp;
    this._camera.position.z += (targetZ - this._camera.position.z) * lerp;

    this._camera.lookAt(lookAtTarget);

    // Apply Bob & Shake (modifies rotation/position destructively after lookAt)
    if (!reduced && mode === 'chase') {
      if (Math.abs(speed) > 1) {
        const time = performance.now() * 0.001;
        const bob = Math.sin(time * vehicleConfig.bobFreq * speed * 0.2) * vehicleConfig.bobAmp;
        this._camera.position.y += bob;
      }

      if (this._shakeIntensity > 0) {
        this._camera.rotation.z += (Math.random() - 0.5) * this._shakeIntensity * 0.1;
        this._camera.position.y += (Math.random() - 0.5) * this._shakeIntensity * 0.2;
        this._shakeIntensity *= 0.8; // fast decay
      }
    }

    // Dynamic FOV for boost
    const targetFov = this._baseFov + (isBoosting ? 8 : 0);
    this._camera.fov += (targetFov - this._camera.fov) * 5 * dt;
    this._camera.updateProjectionMatrix();
  }

  addShake(amount) {
    this._shakeIntensity = Math.min(this._shakeIntensity + amount, 2.0);
  }
}