// src/game/world/zoneA/Buildings.js
// Procedural InstancedMesh skyscrapers with setbacks.

import * as THREE from 'three';
import { mulberry32 } from '../../utils/rng.js';
import { placeBeside } from '../../utils/placement.js';

export class Buildings {
  constructor(parentGroup, curve, config, tier, zoneConfig) {
    this.parent = parentGroup;
    this.meshes = [];
    const count = tier === 'low' ? Math.floor(config.count / 2) : config.count;
    
    this._build(curve, count, tier, zoneConfig);
  }

  _build(curve, count, tier, zoneConfig) {
    const rng = mulberry32(101);
    
    const bodyGeo = new THREE.BoxGeometry(1, 1, 1);
    bodyGeo.translate(0, 0.5, 0); // Base at y=0
    
    const bodyMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const bodies = new THREE.InstancedMesh(bodyGeo, bodyMat, count * 2); // Base + Setback
    
    const winMat = new THREE.MeshLambertMaterial({ color: 0x222222, emissive: 0xFFD700, emissiveIntensity: 0 });
    const windows = new THREE.InstancedMesh(bodyGeo, winMat, count);
    this._winMat = winMat;

    const dummy = new THREE.Object3D();
    const color = new THREE.Color();
    const palettes = [0xAAAAAA, 0xDDDDDD, 0x8899AA, 0xE8C5A0]; 
    
    let instanceIdx = 0;
    let winIdx = 0;

    for (let i = 0; i < count; i++) {
      let t = zoneConfig.tStart + rng() * (zoneConfig.tEnd - zoneConfig.tStart);
      // Skip bounds near landmarks
      if (Math.abs(t - 0.12) < 0.02 || Math.abs(t - 0.28) < 0.02 || Math.abs(t - 0.006) < 0.02) t += 0.04;
      
      const lateral = (9 + rng() * 13) * (i % 2 === 0 ? 1 : -1);
      const { position, faceRoad } = placeBeside(curve, t, lateral);
      
      const width = 8 + rng() * 6;
      const depth = 8 + rng() * 4;
      const height = 8 + rng() * 22;
      
      const c = palettes[Math.floor(rng() * palettes.length)];
      color.setHex(c);

      // Base Block
      dummy.position.copy(position);
      dummy.rotation.set(0, faceRoad, 0);
      dummy.scale.set(width, height * 0.6, depth);
      dummy.updateMatrix();
      bodies.setMatrixAt(instanceIdx, dummy.matrix);
      bodies.setColorAt(instanceIdx, color);
      instanceIdx++;

      // Setback Block
      dummy.position.y += height * 0.6;
      dummy.scale.set(width * 0.7, height * 0.4, depth * 0.7);
      dummy.updateMatrix();
      bodies.setMatrixAt(instanceIdx, dummy.matrix);
      bodies.setColorAt(instanceIdx, color);
      instanceIdx++;

      // Windows (slightly larger, thin, colored per-instance for lights)
      dummy.position.copy(position);
      dummy.position.y += 1; // off ground
      dummy.scale.set(width + 0.1, height * 0.5, depth - 1);
      dummy.updateMatrix();
      windows.setMatrixAt(winIdx, dummy.matrix);
      
      // Randomly light up some windows more than others
      const lightTint = new THREE.Color(rng() > 0.5 ? 0xFFFFFF : 0x555555);
      windows.setColorAt(winIdx, lightTint);
      winIdx++;
    }

    bodies.instanceMatrix.needsUpdate = true;
    bodies.instanceColor.needsUpdate = true;
    bodies.computeBoundingSphere();
    
    windows.instanceMatrix.needsUpdate = true;
    windows.instanceColor.needsUpdate = true;
    windows.computeBoundingSphere();

    this.parent.add(bodies);
    this.parent.add(windows);
    this.meshes.push(bodies, windows);
  }

  setNightFactor(n) {
    this._winMat.emissiveIntensity = n * 0.8;
  }

  dispose() {
    this.meshes.forEach(m => {
      this.parent.remove(m);
      m.geometry.dispose();
      m.material.dispose();
    });
  }
}