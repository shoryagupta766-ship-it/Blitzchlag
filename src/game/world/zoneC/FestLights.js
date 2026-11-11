// src/game/world/zoneC/FestLights.js
import * as THREE from 'three';
import { placeBeside } from '../../utils/placement.js';

export class FestLights {
  constructor(parentGroup, curve, zoneConfig) {
    this.parent = parentGroup;
    this.meshes = [];

    const bulbGeo = new THREE.SphereGeometry(0.15, 8, 8);
    this._emissiveMat = new THREE.MeshLambertMaterial({ 
      color: 0xFFD400, 
      emissive: 0xFFD400, 
      emissiveIntensity: 0 
    });

    const count = 120;
    const bulbs = new THREE.InstancedMesh(bulbGeo, this._emissiveMat, count);
    const dummy = new THREE.Object3D();
    
    let idx = 0;
    // String lights across the plaza (t > 0.92)
    for (let t = 0.93; t < 0.99; t += 0.015) {
      if (idx >= count - 10) break;
      const left = placeBeside(curve, t, -20);
      const right = placeBeside(curve, t, 20);
      
      for (let i = 1; i < 9; i++) {
        const frac = i / 9;
        const sag = Math.pow((frac - 0.5) * 2, 2) * -2.0 + 2.0; 
        
        dummy.position.lerpVectors(left.position, right.position, frac);
        dummy.position.y = 12 - sag;
        dummy.updateMatrix();
        bulbs.setMatrixAt(idx++, dummy.matrix);
      }
    }
    
    bulbs.count = idx;
    bulbs.instanceMatrix.needsUpdate = true;
    
    this.parent.add(bulbs);
    this.meshes.push(bulbs);
  }

  setNightFactor(n) {
    this._emissiveMat.emissiveIntensity = n * 2.0;
  }

  dispose() {
    this.meshes.forEach(m => {
      this.parent.remove(m);
      m.geometry.dispose();
      m.material.dispose();
    });
  }
}