// src/game/world/zoneC/StreetLights.js
import * as THREE from 'three';
import { placeBeside } from '../../utils/placement.js';

export class StreetLights {
  constructor(parentGroup, curve, config, zoneConfig) {
    this.parent = parentGroup;
    this.meshes = [];
    this.lights = [];
    
    const count = config.count || 12;
    const poleGeo = new THREE.CylinderGeometry(0.1, 0.15, 8);
    poleGeo.translate(0, 4, 0);
    const poleMat = new THREE.MeshLambertMaterial({ color: 0x222222 });
    const poles = new THREE.InstancedMesh(poleGeo, poleMat, count);
    
    const dummy = new THREE.Object3D();
    
    for (let i = 0; i < count; i++) {
      const t = zoneConfig.tStart + (i / count) * (zoneConfig.tEnd - zoneConfig.tStart);
      const lateral = i % 2 === 0 ? 9 : -9; // Alternate sides
      const { position } = placeBeside(curve, t, lateral);
      
      dummy.position.copy(position);
      dummy.updateMatrix();
      poles.setMatrixAt(i, dummy.matrix);

      // We only use 4 actual PointLights to save performance, placed at the first 4 poles
      if (i < 4) {
        const light = new THREE.PointLight(0xFFD400, 0, 30);
        light.position.copy(position);
        light.position.y += 8;
        this.parent.add(light);
        this.lights.push(light);
      }
    }
    
    poles.instanceMatrix.needsUpdate = true;
    this.parent.add(poles);
    this.meshes.push(poles);
  }

  setNightFactor(n) {
    this.lights.forEach(light => {
      light.intensity = n * 1.5;
    });
  }

  dispose() {
    this.meshes.forEach(m => {
      this.parent.remove(m);
      m.geometry.dispose();
      m.material.dispose();
    });
    this.lights.forEach(l => this.parent.remove(l));
  }
}