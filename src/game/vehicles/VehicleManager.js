// src/game/vehicles/VehicleManager.js
// Handles hot-swapping between the auto, camel, and elephant.

import { gsap } from 'gsap';
import { VEHICLES } from '../config.js';
import { createAutoRickshaw } from './AutoRickshaw.js';
import { createCamel } from './Camel.js';
import { createElephant } from './Elephant.js';

export class VehicleManager {
  constructor(scene) {
    this._scene = scene;
    this.activeVehicle = null;
    this.activeConfig = null;
    this._lastSwapTime = 0;
  }

  init(initialId = 'auto') {
    this.swap(initialId);
  }

  swap(id) {
    const now = performance.now();
    if (now - this._lastSwapTime < 250) return; // Cooldown
    if (this.activeConfig && this.activeConfig.id === id) return;

    this._lastSwapTime = now;
    const config = VEHICLES.find(v => v.id === id);
    if (!config) return;

    // Save previous transform
    const pos = this.activeVehicle ? this.activeVehicle.group.position.clone() : null;
    const rot = this.activeVehicle ? this.activeVehicle.group.rotation.clone() : null;

    if (this.activeVehicle) {
      this._scene.remove(this.activeVehicle.group);
      this.activeVehicle.dispose();
    }

    this.activeConfig = config;
    
    if (id === 'auto') this.activeVehicle = createAutoRickshaw(config);
    if (id === 'camel') this.activeVehicle = createCamel(config);
    if (id === 'elephant') this.activeVehicle = createElephant(config);

    if (pos && rot) {
      this.activeVehicle.group.position.copy(pos);
      this.activeVehicle.group.rotation.copy(rot);
    }

    this._scene.add(this.activeVehicle.group);
    
    // GSAP Scale Pop
    gsap.fromTo(this.activeVehicle.group.scale, 
      { x: 0.2, y: 0.2, z: 0.2 }, 
      { x: 1, y: 1, z: 1, duration: 0.3, ease: 'back.out(1.7)' }
    );
  }

  update(dt, speed, steer) {
    if (this.activeVehicle) {
      this.activeVehicle.update(dt, speed, steer);
    }
  }

  dispose() {
    if (this.activeVehicle) {
      this._scene.remove(this.activeVehicle.group);
      this.activeVehicle.dispose();
      this.activeVehicle = null;
    }
  }
}