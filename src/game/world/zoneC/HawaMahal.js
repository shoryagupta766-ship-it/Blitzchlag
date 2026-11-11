// src/game/world/zoneC/HawaMahal.js
import * as THREE from 'three';
import { placeBeside } from '../../utils/placement.js';

export class HawaMahal {
  constructor(parentGroup, curve, t) {
    this.parent = parentGroup;
    this.meshes = [];
    
    // Facing the approaching driver
    const { position, angleY } = placeBeside(curve, t, 0);
    this.anchor = { position, facing: angleY + Math.PI }; 

    const group = new THREE.Group();
    group.position.copy(position);
    group.rotation.y = angleY;

    const pinkMat = new THREE.MeshLambertMaterial({ color: 0xd9826a });
    this._emissiveMat = new THREE.MeshLambertMaterial({ color: 0x333333, emissive: 0xFFD400, emissiveIntensity: 0 });

    // Stepped 5-storey facade
    const tierWidths = [30, 26, 20, 14, 8];
    const tierHeights = [6, 5, 4, 4, 3];
    let yBase = 0;
    
    tierWidths.forEach((w, i) => {
      const h = tierHeights[i];
      const geo = new THREE.BoxGeometry(w, h, 2);
      const mesh = new THREE.Mesh(geo, pinkMat);
      mesh.position.set(0, yBase + h/2, -i * 0.5); // slight curve back
      group.add(mesh);
      this.meshes.push(mesh);
      yBase += h;
    });

    // Emissive windows (simplified as instanced planes)
    const winGeo = new THREE.PlaneGeometry(0.6, 1.2);
    const winCount = 80;
    const windows = new THREE.InstancedMesh(winGeo, this._emissiveMat, winCount);
    
    const dummy = new THREE.Object3D();
    let wIdx = 0;
    yBase = 0;
    
    tierWidths.forEach((w, i) => {
      const h = tierHeights[i];
      const numWins = Math.floor(w / 2.5);
      for (let j = 0; j < numWins && wIdx < winCount; j++) {
        dummy.position.set(-w/2 + 1.25 + j*2.5, yBase + h/2, -i * 0.5 + 1.05);
        dummy.updateMatrix();
        windows.setMatrixAt(wIdx++, dummy.matrix);
      }
      yBase += h;
    });
    
    windows.count = wIdx;
    group.add(windows);
    this.meshes.push(windows);

    this.parent.add(group);
    this.group = group;
  }

  setNightFactor(n) {
    this._emissiveMat.emissiveIntensity = n * 1.5;
  }

  dispose() {
    this.meshes.forEach(m => {
      m.geometry.dispose();
      m.material.dispose();
    });
    this.parent.remove(this.group);
  }
}