// src/game/world/zoneB/SandstoneWalls.js
import * as THREE from 'three';
import { placeBeside } from '../../utils/placement.js';

export class SandstoneWalls {
  constructor(parentGroup, curve, config, tier, zoneConfig) {
    this.parent = parentGroup;
    this.meshes = [];
    
    const count = tier === 'low' ? Math.floor(config.count / 2) : config.count;
    
    const wallGeo = new THREE.BoxGeometry(16, 12, 1.5);
    wallGeo.translate(0, 6, 0);
    const wallMat = new THREE.MeshLambertMaterial({ color: 0xd98a72 });
    const walls = new THREE.InstancedMesh(wallGeo, wallMat, count * 2);
    
    const dummy = new THREE.Object3D();
    let idx = 0;
    
    for (let i = 0; i < count; i++) {
      const t = zoneConfig.tStart + 0.02 + (i / count) * (zoneConfig.tEnd - zoneConfig.tStart - 0.04);
      
      // Left Wall
      const left = placeBeside(curve, t, -12);
      dummy.position.copy(left.position);
      dummy.rotation.set(0, left.faceRoad, 0);
      dummy.updateMatrix();
      walls.setMatrixAt(idx++, dummy.matrix);

      // Right Wall
      const right = placeBeside(curve, t, 12);
      dummy.position.copy(right.position);
      dummy.rotation.set(0, right.faceRoad, 0);
      dummy.updateMatrix();
      walls.setMatrixAt(idx++, dummy.matrix);
    }
    
    walls.instanceMatrix.needsUpdate = true;
    this.parent.add(walls);
    this.meshes.push(walls);
  }

  dispose() {
    this.meshes.forEach(m => {
      this.parent.remove(m);
      m.geometry.dispose();
      m.material.dispose();
    });
  }
}