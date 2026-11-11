// src/game/world/zoneB/Stalls.js
import * as THREE from 'three';
import { placeBeside } from '../../utils/placement.js';

export class Stalls {
  constructor(parentGroup, curve, config, zoneConfig) {
    this.parent = parentGroup;
    this.meshes = [];
    
    const count = config.count;
    
    const stallGeo = new THREE.BoxGeometry(4, 3, 3);
    stallGeo.translate(0, 1.5, 0);
    const stallMat = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const stalls = new THREE.InstancedMesh(stallGeo, stallMat, count * 2);

    const awningGeo = new THREE.PlaneGeometry(4, 3.5);
    awningGeo.rotateX(-Math.PI / 4);
    awningGeo.translate(0, 3.5, 1);
    const awningMat = new THREE.MeshLambertMaterial({ color: 0xD4A017, side: THREE.DoubleSide });
    const awnings = new THREE.InstancedMesh(awningGeo, awningMat, count * 2);
    
    const dummy = new THREE.Object3D();
    let idx = 0;
    
    for (let i = 0; i < count; i++) {
      const t = zoneConfig.tStart + 0.03 + (i / count) * 0.35;
      
      const left = placeBeside(curve, t, -9);
      dummy.position.copy(left.position);
      dummy.rotation.set(0, left.faceRoad, 0);
      dummy.updateMatrix();
      stalls.setMatrixAt(idx, dummy.matrix);
      awnings.setMatrixAt(idx, dummy.matrix);
      idx++;

      const right = placeBeside(curve, t + 0.01, 9);
      dummy.position.copy(right.position);
      dummy.rotation.set(0, right.faceRoad, 0);
      dummy.updateMatrix();
      stalls.setMatrixAt(idx, dummy.matrix);
      awnings.setMatrixAt(idx, dummy.matrix);
      idx++;
    }
    
    stalls.instanceMatrix.needsUpdate = true;
    awnings.instanceMatrix.needsUpdate = true;
    
    this.parent.add(stalls, awnings);
    this.meshes.push(stalls, awnings);
  }

  dispose() {
    this.meshes.forEach(m => {
      this.parent.remove(m);
      m.geometry.dispose();
      m.material.dispose();
    });
  }
}