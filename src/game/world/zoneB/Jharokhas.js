// src/game/world/zoneB/Jharokhas.js
import * as THREE from 'three';
import { placeBeside } from '../../utils/placement.js';

export class Jharokhas {
  constructor(parentGroup, curve, config, tier, zoneConfig) {
    this.parent = parentGroup;
    this.meshes = [];
    
    const count = config.count;
    const geo = new THREE.BoxGeometry(3, 4, 1.5);
    const mat = new THREE.MeshLambertMaterial({ color: 0xE8C5A0 });
    const jharokhas = new THREE.InstancedMesh(geo, mat, count * 2);
    
    const dummy = new THREE.Object3D();
    let idx = 0;
    
    for (let i = 0; i < count; i++) {
      const t = zoneConfig.tStart + 0.05 + (i / count) * 0.3;
      
      const left = placeBeside(curve, t, -11.2);
      dummy.position.copy(left.position);
      dummy.position.y += 8; // high on the wall
      dummy.rotation.set(0, left.faceRoad, 0);
      dummy.updateMatrix();
      jharokhas.setMatrixAt(idx++, dummy.matrix);

      const right = placeBeside(curve, t, 11.2);
      dummy.position.copy(right.position);
      dummy.position.y += 8;
      dummy.rotation.set(0, right.faceRoad, 0);
      dummy.updateMatrix();
      jharokhas.setMatrixAt(idx++, dummy.matrix);
    }
    
    jharokhas.instanceMatrix.needsUpdate = true;
    this.parent.add(jharokhas);
    this.meshes.push(jharokhas);
  }

  dispose() {
    this.meshes.forEach(m => {
      this.parent.remove(m);
      m.geometry.dispose();
      m.material.dispose();
    });
  }
}