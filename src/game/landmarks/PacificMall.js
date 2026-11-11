// src/game/landmarks/PacificMall.js
// EVENTS Destination Landmark. Exports anchor {position, facing}.

import * as THREE from 'three';
import { placeBeside } from '../utils/placement.js';

export class PacificMall {
  constructor(parentGroup, curve, t, lateral) {
    this.parent = parentGroup;
    this.meshes = [];
    
    const { position, faceRoad, angleY } = placeBeside(curve, t, lateral);
    this.anchor = { position, facing: faceRoad };

    const group = new THREE.Group();
    group.position.copy(position);
    group.rotation.y = angleY;

    const bodyMat   = new THREE.MeshLambertMaterial({ color: 0xD0C8B8 });
    const maroonMat = new THREE.MeshLambertMaterial({ color: 0x5B1A1A });
    const goldMat   = new THREE.MeshLambertMaterial({ color: 0xD4A017 });
    
    // Emissive material for the glass atrium to glow at night
    this._emissiveMat = new THREE.MeshLambertMaterial({ color: 0x3B7A9E, emissive: 0x3B7A9E, emissiveIntensity: 0 });

    const mainGeo = new THREE.BoxGeometry(9, 14, 20);
    const mainBox = new THREE.Mesh(mainGeo, bodyMat);
    mainBox.position.set(0, 7, 0);

    const atriumGeo = new THREE.BoxGeometry(1.2, 11, 8.5);
    const atrium = new THREE.Mesh(atriumGeo, this._emissiveMat);
    atrium.position.set(-4.2, 5.5, 0);

    group.add(mainBox, atrium);
    this.meshes.push(mainBox, atrium);

    const finGeo = new THREE.BoxGeometry(0.8, 14.6, 1.0);
    for (let z = -8; z <= 8; z += 4) {
      if (z === 0) continue;
      const fin = new THREE.Mesh(finGeo, z % 8 === 0 ? maroonMat : goldMat);
      fin.position.set(-4.3, 7.3, z);
      group.add(fin);
      this.meshes.push(fin);
    }

    const crownGeo = new THREE.BoxGeometry(1.0, 2.0, 12.0);
    const crown = new THREE.Mesh(crownGeo, maroonMat);
    crown.position.set(-4.0, 15.0, 0);
    
    group.add(crown);
    this.meshes.push(crown);

    this.parent.add(group);
    this.group = group; // store reference to remove later
  }

  setNightFactor(n) {
    this._emissiveMat.emissiveIntensity = n * 0.8;
  }

  dispose() {
    this.meshes.forEach(m => {
      if (m.isMesh) {
        m.geometry.dispose();
        m.material.dispose();
      }
    });
    this.parent.remove(this.group);
  }
}