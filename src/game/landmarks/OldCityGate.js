// src/game/landmarks/OldCityGate.js
import * as THREE from 'three';
import { placeBeside } from '../utils/placement.js';

export class OldCityGate {
  constructor(parentGroup, curve, t) {
    this.parent = parentGroup;
    this.meshes = [];
    
    const { position, faceRoad, angleY } = placeBeside(curve, t, 0);
    this.anchor = { position, facing: faceRoad }; // COMPETITIONS destination

    const group = new THREE.Group();
    group.position.copy(position);
    group.rotation.y = angleY;

    const pinkMat = new THREE.MeshLambertMaterial({ color: 0xd98a72 });
    const creamMat = new THREE.MeshLambertMaterial({ color: 0xF5E6D3 });

    // Left/Right massive piers
    const pierGeo = new THREE.BoxGeometry(4, 12, 4);
    const leftPier = new THREE.Mesh(pierGeo, pinkMat);
    leftPier.position.set(-8, 6, 0);
    const rightPier = new THREE.Mesh(pierGeo, pinkMat);
    rightPier.position.set(8, 6, 0);

    // Arch header
    const archGeo = new THREE.BoxGeometry(20, 4, 4);
    const arch = new THREE.Mesh(archGeo, pinkMat);
    arch.position.set(0, 14, 0);

    // Crenellations (instanced)
    const crenGeo = new THREE.BoxGeometry(0.8, 1, 0.5);
    const crens = new THREE.InstancedMesh(crenGeo, creamMat, 10);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < 10; i++) {
      dummy.position.set(-9 + (i * 2), 16.5, 0);
      dummy.updateMatrix();
      crens.setMatrixAt(i, dummy.matrix);
    }

    group.add(leftPier, rightPier, arch, crens);
    this.parent.add(group);
    this.meshes.push(group, crens);
  }

  dispose() {
    this.meshes.forEach(m => {
      if (m.isMesh || m.isInstancedMesh) {
        m.geometry.dispose();
        m.material.dispose();
      }
    });
    this.parent.remove(this.meshes[0]);
  }
}