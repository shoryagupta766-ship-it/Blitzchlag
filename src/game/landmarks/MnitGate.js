// src/game/landmarks/MnitGate.js
// Start line archway.

import * as THREE from 'three';
import { placeBeside } from '../utils/placement.js';

export class MnitGate {
  constructor(parentGroup, curve, t) {
    this.parent = parentGroup;
    this.meshes = [];

    const { position, angleY } = placeBeside(curve, t, 0);

    const group = new THREE.Group();
    group.position.copy(position);
    group.rotation.y = angleY;

    const sandMat = new THREE.MeshLambertMaterial({ color: 0xE8C5A0 });
    const maroonMat = new THREE.MeshLambertMaterial({ color: 0x5B1A1A });

    const pillarGeo = new THREE.BoxGeometry(1.5, 7, 1.5);
    const leftP = new THREE.Mesh(pillarGeo, sandMat);
    leftP.position.set(-6, 3.5, 0);
    const rightP = new THREE.Mesh(pillarGeo, sandMat);
    rightP.position.set(6, 3.5, 0);

    const archGeo = new THREE.BoxGeometry(13.5, 1.5, 1);
    const arch = new THREE.Mesh(archGeo, maroonMat);
    arch.position.set(0, 7.75, 0);

    // Decorative Bulbs
    const bulbGeo = new THREE.SphereGeometry(0.2, 8, 8);
    const bulbMat = new THREE.MeshBasicMaterial({ color: 0xFFD400 });
    const bulbs = new THREE.InstancedMesh(bulbGeo, bulbMat, 24);
    
    const dummy = new THREE.Object3D();
    for(let i = 0; i < 24; i++) {
      dummy.position.set(-5.5 + (i * (11/23)), 7, 0.6);
      dummy.updateMatrix();
      bulbs.setMatrixAt(i, dummy.matrix);
    }

    group.add(leftP, rightP, arch, bulbs);
    this.parent.add(group);
    this.meshes.push(group, bulbs);
  }

  dispose() {
    this.meshes.forEach(m => {
      if (m.isMesh || m.isInstancedMesh) {
        m.geometry.dispose();
        m.material.dispose();
      }
      this.parent.remove(m);
    });
  }
}